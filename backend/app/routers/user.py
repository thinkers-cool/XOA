from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import os
from pathlib import Path
from pydantic import BaseModel

from ..crud import user as crud_user
from ..crud import role as crud_role
from ..schemas.user import User, UserCreate, UserUpdate
from ..schemas.role import RoleCreate, UserRoleCreate
from ..models.user import User as UserModel
from ..database import get_db
from ..settings import AVATAR_UPLOAD_DIR, ACCESS_TOKEN_EXPIRE_MINUTES
from ..common.permissions import has_permissions, PERMISSIONS
from ..common.auth import (
    verify_password, get_password_hash, create_access_token, create_refresh_token,
    get_current_user, Token, UserLogin, oauth2_scheme
)

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=User)
async def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if this is the first user registration
    existing_users = crud_user.get_users(db, skip=0, limit=1)
    is_first_user = len(existing_users) == 0

    # If not first user, check permissions
    if not is_first_user:
        # Wrap the function with permission check
        @has_permissions([PERMISSIONS['USER_CREATE']])
        async def create_user_with_permission(user: UserCreate, db: Session, current_user: User):
            return await create_user_internal(user, db)
        return await create_user_with_permission(user, db, current_user)
    
    # For first user, proceed without permission check
    return await create_user_internal(user, db)

async def create_user_internal(user: UserCreate, db: Session):
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if this is the first user registration
    existing_users = crud_user.get_users(db, skip=0, limit=1)
    is_first_user = len(existing_users) == 0

    # Create the user
    try:
        db_user = crud_user.create_user(db=db, user=user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # If this is the first user, create admin role and assign it
    if is_first_user:
        # Create admin role with all permissions
        admin_role = RoleCreate(
            name="admin",
            description="Administrator with full system access",
            permissions=["*"]  # Wildcard permission for full access
        )
        try:
            db_role = crud_role.create_role(db=db, role=admin_role)
            # Assign admin role to the user
            user_role = UserRoleCreate(
                user_id=db_user.id,
                role_id=db_role.id
            )
            crud_role.assign_user_role(db=db, user_role=user_role)
            # Set user as superuser
            db_user.is_superuser = True
            db.commit()
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    return db_user

@router.get("/", response_model=List[User])
@has_permissions([PERMISSIONS['USER_READ']])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/me", response_model=User)
@has_permissions([PERMISSIONS['USER_READ']])
async def read_current_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=User)
@has_permissions([PERMISSIONS['USER_READ']])
async def read_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=User)
@has_permissions([PERMISSIONS['USER_UPDATE']])
async def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_user = crud_user.update_user(db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}")
@has_permissions([PERMISSIONS['USER_DELETE']])
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = crud_user.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}

@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Create user using the create_user endpoint logic
    try:
        db_user = await create_user_internal(user, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Create tokens
    access_token = create_access_token(
        data={"sub": db_user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(data={"sub": db_user.username})

    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(data={"sub": user.username})

    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@router.post("/refresh", response_model=Token)
async def refresh_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        is_refresh = payload.get("refresh")
        if not username or not is_refresh:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user = db.query(UserModel).filter(UserModel.username == username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        access_token = create_access_token(
            data={"sub": username},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        new_refresh_token = create_refresh_token(data={"sub": username})

        return {"access_token": access_token, "token_type": "bearer", "refresh_token": new_refresh_token}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.put("/{user_id}/avatar", response_model=User)
@has_permissions([PERMISSIONS['USER_UPDATE']])
async def update_user_avatar(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # Create avatars directory if it doesn't exist
    avatar_dir = Path(AVATAR_UPLOAD_DIR)
    avatar_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"avatar_{user_id}{file_ext}"
    file_path = avatar_dir / filename

    # Save file
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not upload file")

    # Update user's avatar_url
    avatar_url = f"/storage/avatars/{filename}"
    user = crud_user.update_user(db, user_id=user_id, user=UserUpdate(avatar_url=avatar_url))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.put("/{user_id}/password")
@has_permissions([PERMISSIONS['USER_UPDATE']])
def update_password(
    user_id: int,
    password_update: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check permissions
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Get user from database
    db_user = crud_user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify current password
    if not verify_password(password_update.current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    # Update password
    user = crud_user.update_user(db, user_id=user_id, user=UserUpdate(password=password_update.new_password))
    return {"message": "Password updated successfully"}

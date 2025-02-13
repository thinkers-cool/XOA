from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
from pathlib import Path
from pydantic import BaseModel

from ..crud import user as crud_user
from ..schemas.user import User, UserCreate, UserUpdate
from ..database import get_db
from .auth import get_current_user, verify_password
from ..settings import AVATAR_UPLOAD_DIR

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=User)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db=db, user=user)

@router.get("/", response_model=List[User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/me", response_model=User)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=User)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = crud_user.update_user(db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    success = crud_user.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}

@router.put("/{user_id}/avatar", response_model=User)
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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..crud import role as crud_role
from ..schemas.role import Role, RoleCreate, RoleUpdate, UserRole, UserRoleCreate
from ..database import get_db

router = APIRouter(tags=["Users"])

@router.post("/roles/", response_model=Role)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    return crud_role.create_role(db=db, role=role)

@router.get("/roles/", response_model=List[Role])
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    roles = crud_role.get_roles(db, skip=skip, limit=limit)
    return roles

@router.get("/roles/{role_id}", response_model=Role)
def read_role(role_id: int, db: Session = Depends(get_db)):
    db_role = crud_role.get_role(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    return db_role

@router.put("/roles/{role_id}", response_model=Role)
def update_role(role_id: int, role: RoleUpdate, db: Session = Depends(get_db)):
    return crud_role.update_role(db=db, role_id=role_id, role=role)

@router.post("/users/{user_id}/roles/", response_model=UserRole)
def assign_role_to_user(user_id: int, role_assignment: UserRoleCreate, db: Session = Depends(get_db)):
    role_assignment.user_id = user_id
    return crud_role.assign_user_role(db=db, user_role=role_assignment)

@router.get("/users/{user_id}/roles/", response_model=List[UserRole])
def get_user_roles(user_id: int, db: Session = Depends(get_db)):
    return crud_role.get_user_roles(db, user_id=user_id)

@router.delete("/users/{user_id}/roles/", response_model=List[UserRole])
def delete_user_roles(user_id: int, db: Session = Depends(get_db)):
    return crud_role.delete_user_roles(db, user_id=user_id)

@router.get("/roles/{role_id}/users/", response_model=List[UserRole])
def get_role_users(role_id: int, db: Session = Depends(get_db)):
    return crud_role.get_role_users(db, role_id=role_id)

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List

from ..models.role import Role, UserRole
from ..schemas.role import RoleCreate, RoleUpdate, UserRoleCreate

def get_role(db: Session, role_id: int) -> Optional[Role]:
    return db.query(Role).filter(Role.id == role_id).first()

def get_role_by_name(db: Session, name: str) -> Optional[Role]:
    return db.query(Role).filter(Role.name == name).first()

def get_roles(db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
    return db.query(Role).offset(skip).limit(limit).all()

def create_role(db: Session, role: RoleCreate) -> Role:
    db_role = Role(
        name=role.name,
        description=role.description,
        permissions=role.permissions
    )
    try:
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        return db_role
    except IntegrityError:
        db.rollback()
        raise ValueError("Role name already exists")

def update_role(db: Session, role_id: int, role: RoleUpdate) -> Role:
    db_role = get_role(db, role_id)
    if db_role is None:
        raise ValueError("Role not found")
    db_role.name = role.name
    db_role.description = role.description
    db_role.permissions = role.permissions
    db.commit()
    db.refresh(db_role)
    return db_role

def assign_user_role(db: Session, user_role: UserRoleCreate) -> UserRole:
    db_user_role = UserRole(
        user_id=user_role.user_id,
        role_id=user_role.role_id,
        reports_to_id=user_role.reports_to_id
    )
    try:
        db.add(db_user_role)
        db.commit()
        db.refresh(db_user_role)
        return db_user_role
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid user, role, or supervisor reference")

def get_user_roles(db: Session, user_id: int) -> List[UserRole]:
    return db.query(UserRole).filter(UserRole.user_id == user_id).all()

def delete_user_roles(db: Session, user_id: int) -> None:
    user_roles = db.query(UserRole).filter(UserRole.user_id == user_id)
    user_roles.delete()
    db.commit()
    return user_roles

def get_role_users(db: Session, role_id: int) -> List[UserRole]:
    return db.query(UserRole).filter(UserRole.role_id == role_id).all()

def get_user_supervisor(db: Session, user_id: int, role_id: int) -> Optional[UserRole]:
    return db.query(UserRole).filter(
        UserRole.user_id == user_id,
        UserRole.role_id == role_id
    ).first()
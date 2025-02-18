from functools import wraps
from typing import List, Callable
from inspect import iscoroutinefunction
from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from .auth import get_current_user
from ..crud import role as crud_role

def has_permissions(required_permissions: List[str]):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, db: Session = Depends(get_db), current_user: User = Depends(get_current_user), **kwargs):
            # Get all user roles and their permissions
            user_roles = crud_role.get_user_roles(db=db, user_id=current_user.id)
            user_permissions = set()
            for user_role in user_roles:
                role = crud_role.get_role(db, user_role.role_id)
                user_permissions.update(role.permissions)
            
            # Check if user has wildcard permission or all required permissions
            has_wildcard = '*' in user_permissions
            has_required = all(perm in user_permissions for perm in required_permissions)
            
            if not (has_wildcard or has_required):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
            
            # Handle both async and non-async route handlers
            if iscoroutinefunction(func):
                return await func(*args, db=db, current_user=current_user, **kwargs)
            return func(*args, db=db, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Common permission constants
PERMISSIONS = {
    # User management permissions
    'USER_CREATE': 'user.create',
    'USER_READ': 'user.read',
    'USER_UPDATE': 'user.update',
    'USER_DELETE': 'user.delete',
    
    # Role management permissions
    'ROLE_CREATE': 'role.create',
    'ROLE_READ': 'role.read',
    'ROLE_UPDATE': 'role.update',
    'ROLE_DELETE': 'role.delete',
    
    # Ticket management permissions
    'TICKET_CREATE': 'ticket.create',
    'TICKET_READ': 'ticket.read',
    'TICKET_UPDATE': 'ticket.update',
    'TICKET_DELETE': 'ticket.delete',
    
    # Template management permissions
    'TICKET_TEMPLATE_CREATE': 'ticket_template.create',
    'TICKET_TEMPLATE_READ': 'ticket_template.read',
    'TICKET_TEMPLATE_UPDATE': 'ticket_template.update',
    'TICKET_TEMPLATE_DELETE': 'ticket_template.delete',

    # Resource Type management permissions
    'RESOURCE_TYPE_CREATE': 'resource_type.create',
    'RESOURCE_TYPE_READ': 'resource_type.read',
    'RESOURCE_TYPE_UPDATE': 'resource_type.update',
    'RESOURCE_TYPE_DELETE': 'resource_type.delete',
    
    # Resource Entry management permissions
    'RESOURCE_ENTRY_CREATE': 'resource_entry.create',
    'RESOURCE_ENTRY_READ': 'resource_entry.read',
    'RESOURCE_ENTRY_UPDATE': 'resource_entry.update',
    'RESOURCE_ENTRY_DELETE': 'resource_entry.delete',
}
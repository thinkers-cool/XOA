from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from .auth import get_current_user
from ..crud import preferences as preferences_crud
from ..schemas.preferences import PreferencesCreate, PreferencesUpdate, Preferences
from ..models.user import User

router = APIRouter(
    tags=["Preferences"],
)

@router.post("/preferences", response_model=Preferences)
def create_preferences(preferences: PreferencesCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing_preferences = preferences_crud.get_user_preferences(db, current_user.id)
    if existing_preferences:
        raise HTTPException(status_code=400, detail="User preferences already exist")
    
    user_preferences = preferences_crud.create_user_preferences(db, current_user.id, preferences)
    return user_preferences

@router.get("/preferences", response_model=Preferences)
def get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_preferences = preferences_crud.get_user_preferences(db, current_user.id)
    if not user_preferences:
        # Create default preferences if not exists
        preferences = PreferencesCreate(
            notification_settings={
                "emailNotifications": True,
                "inAppNotifications": True,
                "ticketUpdates": True,
                "systemAnnouncements": True
            },
            display_settings={
                "timezone": "auto",
                "dateFormat": "24h",
                "numberFormat": "standard"
            }
        )
        user_preferences = preferences_crud.create_user_preferences(db, current_user.id, preferences)
    return user_preferences

@router.put("/preferences", response_model=Preferences)
def update_preferences(preferences: PreferencesUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    updated_preferences = preferences_crud.update_user_preferences(db, current_user.id, preferences)
    if not updated_preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return updated_preferences
from sqlalchemy.orm import Session
from typing import Optional

from ..models.preferences import UserPreferences
from ..schemas.preferences import PreferencesCreate, PreferencesUpdate

def get_user_preferences(db: Session, user_id: int) -> Optional[UserPreferences]:
    return db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()

def create_user_preferences(db: Session, user_id: int, preferences: PreferencesCreate) -> UserPreferences:
    db_preferences = UserPreferences(
        user_id=user_id,
        notification_settings=preferences.notification_settings.dict(),
        display_settings=preferences.display_settings.dict()
    )
    db.add(db_preferences)
    db.commit()
    db.refresh(db_preferences)
    return db_preferences

def update_user_preferences(db: Session, user_id: int, preferences: PreferencesUpdate) -> Optional[UserPreferences]:
    db_preferences = get_user_preferences(db, user_id)
    if not db_preferences:
        return None

    if preferences.notification_settings:
        # Create a new dictionary with updated values
        db_preferences.notification_settings = {
            **db_preferences.notification_settings,
            **preferences.notification_settings.dict(exclude_unset=True)
        }
    if preferences.display_settings:
        # Create a new dictionary with updated values
        db_preferences.display_settings = {
            **db_preferences.display_settings,
            **preferences.display_settings.dict(exclude_unset=True)
        }

    db.commit()
    db.refresh(db_preferences)
    return db_preferences

def delete_user_preferences(db: Session, user_id: int) -> bool:
    db_preferences = get_user_preferences(db, user_id)
    if not db_preferences:
        return False
    
    db.delete(db_preferences)
    db.commit()
    return True
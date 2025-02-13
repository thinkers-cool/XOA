from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime

class NotificationSettings(BaseModel):
    emailNotifications: bool = True
    inAppNotifications: bool = True
    ticketUpdates: bool = True
    systemAnnouncements: bool = True

class DisplaySettings(BaseModel):
    timezone: str = "auto"
    dateFormat: str = "24h"
    numberFormat: str = "standard"

class PreferencesBase(BaseModel):
    notification_settings: NotificationSettings
    display_settings: DisplaySettings

class PreferencesCreate(PreferencesBase):
    pass

class PreferencesUpdate(BaseModel):
    notification_settings: Optional[NotificationSettings] = None
    display_settings: Optional[DisplaySettings] = None

class Preferences(PreferencesBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
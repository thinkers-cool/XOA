from sqlalchemy import Column, Integer, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notification_settings = Column(JSON, default=lambda: {
        "emailNotifications": True,
        "inAppNotifications": True,
        "ticketUpdates": True,
        "systemAnnouncements": True
    })
    display_settings = Column(JSON, default=lambda: {
        "timezone": "auto",
        "dateFormat": "24h",
        "numberFormat": "standard"
    })

    user = relationship("User", back_populates="preferences")
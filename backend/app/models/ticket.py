from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    status = Column(String)
    priority = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    template_id = Column(Integer, ForeignKey("ticket_templates.id"))
    workflow_data = Column(JSON)  # Stores workflow step data including status, assignee, timestamps and form data

    creator = relationship("User", foreign_keys=[created_by], back_populates="created_tickets")
    template = relationship("TicketTemplate", back_populates="tickets")
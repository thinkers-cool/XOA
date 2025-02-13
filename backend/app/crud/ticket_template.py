from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from ..models.ticket_template import TicketTemplate
from ..schemas.ticket_template import TicketTemplateCreate, TicketTemplateUpdate

def get_ticket_template(db: Session, template_id: int) -> Optional[TicketTemplate]:
    return db.query(TicketTemplate).filter(TicketTemplate.id == template_id).first()

def get_ticket_templates(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[TicketTemplate]:
    return db.query(TicketTemplate).offset(skip).limit(limit).all()

def create_ticket_template(
    db: Session,
    template: TicketTemplateCreate,
    created_by: int
) -> TicketTemplate:
    db_template = TicketTemplate(
        **template.model_dump(),
        created_by=created_by
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def update_ticket_template(
    db: Session,
    template_id: int,
    template: TicketTemplateUpdate
) -> Optional[TicketTemplate]:
    db_template = get_ticket_template(db, template_id)
    if not db_template:
        return None
    
    update_data = template.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)
    
    db_template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_template)
    return db_template

def delete_ticket_template(db: Session, template_id: int) -> bool:
    db_template = get_ticket_template(db, template_id)
    if not db_template:
        return False
    
    db.delete(db_template)
    db.commit()
    return True
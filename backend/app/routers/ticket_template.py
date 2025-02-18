from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..crud import ticket_template
from ..schemas.ticket_template import (
    TicketTemplate,
    TicketTemplateCreate,
    TicketTemplateUpdate
)
from ..database import get_db
from ..schemas.user import User
from ..common.permissions import has_permissions, PERMISSIONS
from ..common.auth import get_current_user

router = APIRouter(prefix="/ticket-templates", tags=["Tickets"])

@router.get("/", response_model=List[TicketTemplate])
@has_permissions([PERMISSIONS['TICKET_TEMPLATE_READ']])
def read_ticket_templates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    templates = ticket_template.get_ticket_templates(db, skip=skip, limit=limit)
    return templates

@router.get("/{template_id}", response_model=TicketTemplate)
@has_permissions([PERMISSIONS['TICKET_TEMPLATE_READ']])
def read_ticket_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    template = ticket_template.get_ticket_template(db, template_id=template_id)
    if template is None:
        raise HTTPException(status_code=404, detail="Ticket template not found")
    return template

@router.post("/", response_model=TicketTemplate)
@has_permissions([PERMISSIONS['TICKET_TEMPLATE_CREATE']])
def create_ticket_template(
    template: TicketTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ticket_template.create_ticket_template(
        db=db,
        template=template,
        created_by=1  # Temporarily hardcoded user ID
    )

@router.put("/{template_id}", response_model=TicketTemplate)
@has_permissions([PERMISSIONS['TICKET_TEMPLATE_UPDATE']])
def update_ticket_template(
    template_id: int,
    template: TicketTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_template = ticket_template.update_ticket_template(
        db=db,
        template_id=template_id,
        template=template
    )
    if updated_template is None:
        raise HTTPException(status_code=404, detail="Ticket template not found")
    return updated_template

@router.delete("/{template_id}")
@has_permissions([PERMISSIONS['TICKET_TEMPLATE_DELETE']])
def delete_ticket_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = ticket_template.delete_ticket_template(db=db, template_id=template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ticket template not found")
    return {"status": "success"}
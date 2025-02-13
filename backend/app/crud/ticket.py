from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..models.ticket import Ticket
from ..models.ticket_template import TicketTemplate
from ..schemas.ticket import TicketCreate, TicketUpdate
from ..schemas.ticket_template import WorkflowStep

def get_step_assignee(workflow_steps: List[WorkflowStep], status: str) -> Optional[int]:
    if not workflow_steps:
        return None
    
    for step in workflow_steps:
        if step['id'] == status:
            # Here we would implement the logic to resolve the assignee based on
            # the assignable_roles. For now, we'll return None
            # as this would require additional role/user resolution logic
            return None
    return None

def create_ticket(db: Session, ticket: TicketCreate, user_id: int) -> Ticket:
    template = db.query(TicketTemplate).filter(TicketTemplate.id == ticket.template_id).first()
    if not template:
        raise ValueError("Invalid template reference")

    # Initialize workflow data if not provided
    if not ticket.workflow_data:
        current_time = datetime.utcnow().isoformat()
        ticket.workflow_data = {
            "metadata": {
                "template_version": "1.0.0",
                "created_at": current_time,
                "workflow_config": template.workflow_config or {
                    "parallel_execution": False,
                    "auto_assignment": False,
                    "notification_rules": []
                },
                "form_definitions": {}
            },
            "steps": {}
        }

        # Initialize steps from template workflow
        for i, step in enumerate(template.workflow or []):
            ticket.workflow_data["metadata"]["form_definitions"][step["id"]] = step.get("form", [])
            ticket.workflow_data["steps"][step["id"]] = {
                "status": "in_progress" if i == 0 else "pending",
                "assignee_id": None,
                "started_at": current_time if i == 0 else None,
                "form_data": {},
                "history": [{
                    "timestamp": datetime.utcnow().isoformat(),
                    "type": "status_change",
                    "from": "pending",
                    "to": "in_progress"
                }] if i == 0 else []
            }

    db_ticket = Ticket(
        title=ticket.title or template.title_format,
        description=ticket.description,
        priority=ticket.priority or template.default_priority,
        status="opened",
        template_id=ticket.template_id,
        created_by=user_id,
        workflow_data=ticket.workflow_data.model_dump(mode='json') if ticket.workflow_data else None
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def get_tickets(db: Session, skip: int = 0, limit: int = 100) -> List[Ticket]:
    return db.query(Ticket).order_by(desc(Ticket.created_at)).offset(skip).limit(limit).all()

def get_ticket(db: Session, ticket_id: int) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()

def update_ticket(db: Session, ticket_id: int, ticket_update: TicketUpdate) -> Optional[Ticket]:
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return None
    
    update_data = ticket_update.model_dump(exclude_unset=True)
    
    # If status is being updated, update the assignee based on the template's workflow
    if 'status' in update_data:
        template = db.query(TicketTemplate).filter(TicketTemplate.id == db_ticket.template_id).first()
        if template:
            new_assignee = get_step_assignee(template.workflow, update_data['status'])
            if new_assignee is not None:
                update_data['assigned_to'] = new_assignee
    
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def delete_ticket(db: Session, ticket_id: int) -> bool:
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return False
    
    db.delete(db_ticket)
    db.commit()
    return True
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas.ticket import Ticket, TicketCreate, TicketUpdate
from ..crud import ticket as ticket_crud
from .auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.post("/", response_model=Ticket)
async def create_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    return ticket_crud.create_ticket(db=db, ticket=ticket, user_id=1)  # Temporarily hardcoded user ID

@router.get("/", response_model=List[Ticket])
async def list_tickets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    return ticket_crud.get_tickets(db, skip=skip, limit=limit)

@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    ticket = ticket_crud.get_ticket(db, ticket_id=ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.put("/{ticket_id}", response_model=Ticket)
async def update_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    ticket = ticket_crud.update_ticket(db, ticket_id=ticket_id, ticket_update=ticket_update)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    result = ticket_crud.delete_ticket(db, ticket_id=ticket_id)
    if not result:
        raise HTTPException(status_code=404, detail="Ticket not found")
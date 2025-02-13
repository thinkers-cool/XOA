from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

from enum import Enum
from typing import Union, List

class TicketStatus(str, Enum):
    OPENED = "opened"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CLOSED = "closed"

class StepStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"

class HistoryEntry(BaseModel):
    timestamp: datetime
    type: str
    from_status: Optional[str] = None
    to_status: Optional[str] = None
    user_id: int
    content: Optional[str] = None

class StepData(BaseModel):
    status: StepStatus
    assignee_id: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    form_data: Dict[str, Any] = {}
    history: List[HistoryEntry] = []

class WorkflowMetadata(BaseModel):
    template_version: str
    created_at: datetime
    workflow_config: Dict[str, Any]
    form_definitions: Dict[str, List[Dict[str, Any]]]

class WorkflowData(BaseModel):
    metadata: WorkflowMetadata
    steps: Dict[str, StepData]

class TicketBase(BaseModel):
    title: str
    description: Optional[str] = ""
    status: TicketStatus
    priority: str
    template_id: int
    workflow_data: Optional[WorkflowData] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    workflow_data: Optional[Dict[str, Dict[str, Any]]] = None

class Ticket(TicketBase):
    id: int
    description: Optional[str] = ""
    status: str
    priority: str
    template_id: int
    workflow_data: Optional[Dict[str, Dict[str, Any]]] = None
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
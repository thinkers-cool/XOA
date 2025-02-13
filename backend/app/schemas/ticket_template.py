from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any

class NotificationRule(BaseModel):
    event: str
    notify_roles: List[str]
    channels: List[str]

class WorkflowConfig(BaseModel):
    parallel_execution: bool
    auto_assignment: bool
    notification_rules: List[NotificationRule]

class FormFieldValidation(BaseModel):
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    min: Optional[float] = None
    max: Optional[float] = None

class FormField(BaseModel):
    id: str
    name: str
    type: str
    label: str
    required: bool
    options: Optional[List[str]] = None
    validation: Optional[FormFieldValidation] = None
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    width: Optional[str] = None
    default_value: Optional[Any] = None
    resource_type_id: Optional[int] = None
    resource_display_field: Optional[str] = None

class WorkflowStep(BaseModel):
    id: str
    name: str
    description: str
    assignable_roles: List[str]
    form: List[FormField]
    dependencies: Optional[List[str]] = None

class TicketTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    title_format: str
    default_priority: str
    workflow: List[WorkflowStep]
    workflow_config: WorkflowConfig

class TicketTemplateCreate(TicketTemplateBase):
    pass

class TicketTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    title_format: Optional[str] = None
    default_priority: Optional[str] = None
    workflow: Optional[List[WorkflowStep]] = None

class TicketTemplate(TicketTemplateBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
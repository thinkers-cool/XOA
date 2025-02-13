from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

class ValidationRule(BaseModel):
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    min: Optional[Union[int, float]] = None
    max: Optional[Union[int, float]] = None
    pattern: Optional[str] = None
    allowed_types: Optional[List[str]] = None
    max_size: Optional[int] = None

class ResourceField(BaseModel):
    id: str
    name: str
    type: str
    label: str
    required: bool
    options: Optional[List[str]] = None
    validation: Optional[ValidationRule] = None
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    width: Optional[str] = None
    default_value: Optional[Any] = None
    resource_type_id: Optional[int] = None
    resource_display_field: Optional[str] = None

class ResourceTypeMetainfo(BaseModel):
    searchable_fields: List[str]
    filterable_fields: List[str]
    default_sort_field: str
    tags: List[str]
    category: str

class ResourceTypeBase(BaseModel):
    name: str
    description: str
    version: str
    fields: List[ResourceField]
    metainfo: ResourceTypeMetainfo

class ResourceTypeCreate(ResourceTypeBase):
    pass

class ResourceType(ResourceTypeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ResourceEntryBase(BaseModel):
    data: Dict[str, Any]

class ResourceEntryCreate(ResourceEntryBase):
    resource_type_id: int

class ResourceEntry(ResourceEntryBase):
    id: int
    resource_type_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
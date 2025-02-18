from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import resource as crud_resource
from app.schemas.resource import (
    ResourceType,
    ResourceTypeCreate,
    ResourceEntry,
    ResourceEntryCreate
)
from ..common.permissions import has_permissions, PERMISSIONS
from ..common.auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/resources", tags=["Resources"])

@router.post("/types", response_model=ResourceType)
@has_permissions([PERMISSIONS['RESOURCE_TYPE_CREATE']])
def create_resource_type(resource_type: ResourceTypeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud_resource.create_resource_type(db, resource_type)

@router.get("/types", response_model=List[ResourceType])
@has_permissions([PERMISSIONS['RESOURCE_TYPE_READ']])
def list_resource_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_resource.get_resource_types(db, skip=skip, limit=limit)

@router.get("/types/{resource_type_id}", response_model=ResourceType)
@has_permissions([PERMISSIONS['RESOURCE_TYPE_READ']])
def get_resource_type(resource_type_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_resource_type = crud_resource.get_resource_type(db, resource_type_id)
    if not db_resource_type:
        raise HTTPException(status_code=404, detail="Resource type not found")
    return db_resource_type

@router.put("/types/{resource_type_id}", response_model=ResourceType)
@has_permissions([PERMISSIONS['RESOURCE_TYPE_UPDATE']])
def update_resource_type(
    resource_type_id: int,
    resource_type: ResourceTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_resource_type = crud_resource.update_resource_type(db, resource_type_id, resource_type)
    if not db_resource_type:
        raise HTTPException(status_code=404, detail="Resource type not found")
    return db_resource_type

@router.delete("/types/{resource_type_id}")
@has_permissions([PERMISSIONS['RESOURCE_TYPE_DELETE']])
def delete_resource_type(resource_type_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = crud_resource.delete_resource_type(db, resource_type_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resource type not found")
    return {"status": "success"}

@router.post("/entries", response_model=ResourceEntry)
@has_permissions([PERMISSIONS['RESOURCE_ENTRY_CREATE']])
def create_resource_entry(
    resource_entry: ResourceEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_resource.create_resource_entry(db, resource_entry)

@router.get("/types/{resource_type_id}/entries", response_model=List[ResourceEntry])
@has_permissions([PERMISSIONS['RESOURCE_ENTRY_READ']])
def list_resource_entries(
    resource_type_id: int,
    skip: int = 0,
    limit: int = 100,
    filters: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_resource.get_resource_entries(
        db,
        resource_type_id,
        skip=skip,
        limit=limit,
        filters=filters
    )

@router.get("/entries/{entry_id}", response_model=ResourceEntry)
@has_permissions([PERMISSIONS['RESOURCE_ENTRY_READ']])
def get_resource_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_entry = crud_resource.get_resource_entry(db, entry_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Resource entry not found")
    return db_entry

@router.put("/entries/{entry_id}", response_model=ResourceEntry)
@has_permissions([PERMISSIONS['RESOURCE_ENTRY_UPDATE']])
def update_resource_entry(
    entry_id: int,
    resource_entry: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_entry = crud_resource.update_resource_entry(db, entry_id, resource_entry)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Resource entry not found")
    return db_entry

@router.delete("/entries/{entry_id}")
@has_permissions([PERMISSIONS['RESOURCE_ENTRY_DELETE']])
def delete_resource_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = crud_resource.delete_resource_entry(db, entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resource entry not found")
    return {"status": "success"}
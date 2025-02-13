from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import resource as crud_resource
from app.schemas.resource import (
    ResourceType,
    ResourceTypeCreate,
    ResourceEntry,
    ResourceEntryCreate
)

router = APIRouter(prefix="/resources", tags=["Resources"])

@router.post("/types", response_model=ResourceType)
def create_resource_type(resource_type: ResourceTypeCreate, db: Session = Depends(get_db)):
    return crud_resource.create_resource_type(db, resource_type)

@router.get("/types", response_model=List[ResourceType])
def list_resource_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud_resource.get_resource_types(db, skip=skip, limit=limit)

@router.get("/types/{resource_type_id}", response_model=ResourceType)
def get_resource_type(resource_type_id: int, db: Session = Depends(get_db)):
    db_resource_type = crud_resource.get_resource_type(db, resource_type_id)
    if not db_resource_type:
        raise HTTPException(status_code=404, detail="Resource type not found")
    return db_resource_type

@router.put("/types/{resource_type_id}", response_model=ResourceType)
def update_resource_type(
    resource_type_id: int,
    resource_type: ResourceTypeCreate,
    db: Session = Depends(get_db)
):
    db_resource_type = crud_resource.update_resource_type(db, resource_type_id, resource_type)
    if not db_resource_type:
        raise HTTPException(status_code=404, detail="Resource type not found")
    return db_resource_type

@router.delete("/types/{resource_type_id}")
def delete_resource_type(resource_type_id: int, db: Session = Depends(get_db)):
    success = crud_resource.delete_resource_type(db, resource_type_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resource type not found")
    return {"status": "success"}

@router.post("/entries", response_model=ResourceEntry)
def create_resource_entry(
    resource_entry: ResourceEntryCreate,
    db: Session = Depends(get_db)
):
    return crud_resource.create_resource_entry(db, resource_entry)

@router.get("/types/{resource_type_id}/entries", response_model=List[ResourceEntry])
def list_resource_entries(
    resource_type_id: int,
    skip: int = 0,
    limit: int = 100,
    filters: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db)
):
    return crud_resource.get_resource_entries(
        db,
        resource_type_id,
        skip=skip,
        limit=limit,
        filters=filters
    )

@router.get("/entries/{entry_id}", response_model=ResourceEntry)
def get_resource_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = crud_resource.get_resource_entry(db, entry_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Resource entry not found")
    return db_entry

@router.put("/entries/{entry_id}", response_model=ResourceEntry)
def update_resource_entry(
    entry_id: int,
    resource_entry: Dict[str, Any],
    db: Session = Depends(get_db)
):
    db_entry = crud_resource.update_resource_entry(db, entry_id, resource_entry)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Resource entry not found")
    return db_entry

@router.delete("/entries/{entry_id}")
def delete_resource_entry(entry_id: int, db: Session = Depends(get_db)):
    success = crud_resource.delete_resource_entry(db, entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resource entry not found")
    return {"status": "success"}
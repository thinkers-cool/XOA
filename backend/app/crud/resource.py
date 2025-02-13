from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.resource import ResourceType, ResourceEntry
from app.schemas.resource import ResourceTypeCreate, ResourceEntryCreate, ResourceField

def create_resource_type(db: Session, resource_type: ResourceTypeCreate) -> ResourceType:
    # Convert fields and metainfo to JSON-serializable format
    fields_list = [field.dict() for field in resource_type.fields] if resource_type.fields else []
    metainfo_dict = resource_type.metainfo.dict() if resource_type.metainfo else {}
    
    db_resource_type = ResourceType(
        name=resource_type.name,
        description=resource_type.description,
        version=resource_type.version,
        fields=fields_list,
        metainfo=metainfo_dict
    )
    db.add(db_resource_type)
    db.commit()
    db.refresh(db_resource_type)
    return db_resource_type

def get_resource_type(db: Session, resource_type_id: int) -> Optional[ResourceType]:
    db_resource_type = db.query(ResourceType).filter(ResourceType.id == resource_type_id).first()
    if db_resource_type and isinstance(db_resource_type.fields, dict):
        # Convert dict fields back to list of ResourceField objects
        db_resource_type.fields = [ResourceField(**field_data) for field_data in db_resource_type.fields.values()]
    return db_resource_type

def get_resource_types(db: Session, skip: int = 0, limit: int = 100) -> List[ResourceType]:
    db_resource_types = db.query(ResourceType).offset(skip).limit(limit).all()
    for resource_type in db_resource_types:
        if resource_type and isinstance(resource_type.fields, dict):
            # Convert dict fields back to list of ResourceField objects
            resource_type.fields = [ResourceField(**field_data) for field_data in resource_type.fields.values()]
    return db_resource_types

def update_resource_type(db: Session, resource_type_id: int, resource_type: ResourceTypeCreate) -> Optional[ResourceType]:
    db_resource_type = get_resource_type(db, resource_type_id)
    if db_resource_type:
        for key, value in resource_type.dict().items():
            setattr(db_resource_type, key, value)
        db.commit()
        db.refresh(db_resource_type)
    return db_resource_type

def delete_resource_type(db: Session, resource_type_id: int) -> bool:
    db_resource_type = get_resource_type(db, resource_type_id)
    if db_resource_type:
        db.delete(db_resource_type)
        db.commit()
        return True
    return False

def create_resource_entry(db: Session, resource_entry: ResourceEntryCreate) -> ResourceEntry:
    db_resource_entry = ResourceEntry(
        resource_type_id=resource_entry.resource_type_id,
        data=resource_entry.data
    )
    db.add(db_resource_entry)
    db.commit()
    db.refresh(db_resource_entry)
    return db_resource_entry

def get_resource_entry(db: Session, entry_id: int) -> Optional[ResourceEntry]:
    return db.query(ResourceEntry).filter(ResourceEntry.id == entry_id).first()

def get_resource_entries(
    db: Session,
    resource_type_id: int,
    skip: int = 0,
    limit: int = 100,
    filters: Optional[Dict[str, Any]] = None
) -> List[ResourceEntry]:
    query = db.query(ResourceEntry).filter(ResourceEntry.resource_type_id == resource_type_id)
    
    if filters:
        for field, value in filters.items():
            query = query.filter(ResourceEntry.data[field].astext == str(value))
    
    return query.offset(skip).limit(limit).all()

def update_resource_entry(db: Session, entry_id: int, resource_entry: Dict[str, Any]) -> Optional[ResourceEntry]:
    db_resource_entry = get_resource_entry(db, entry_id)
    if db_resource_entry:
        db_resource_entry.data = resource_entry
        db.commit()
        db.refresh(db_resource_entry)
    return db_resource_entry

def delete_resource_entry(db: Session, entry_id: int) -> bool:
    db_resource_entry = get_resource_entry(db, entry_id)
    if db_resource_entry:
        db.delete(db_resource_entry)
        db.commit()
        return True
    return False
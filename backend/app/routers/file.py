import os
from typing import List
from fastapi import APIRouter, UploadFile, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(
    prefix="/files",
    tags=["Files"]
)

from ..settings import STORAGE_DIR

@router.post("/upload")
async def upload_files(files: List[UploadFile]):
    """Upload multiple files to the storage directory"""
    try:
        saved_files = []
        for file in files:
            # Generate a unique filename to prevent conflicts
            filename = f"{os.urandom(8).hex()}_{file.filename}"
            file_path = os.path.join(STORAGE_DIR, filename)
            
            # Save the file
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            saved_files.append({
                "original_name": file.filename,
                "saved_name": filename,
                "content_type": file.content_type,
                "size": len(content)
            })
        
        return {
            "message": "Files uploaded successfully",
            "files": saved_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{filename}")
async def download_file(filename: str):
    """Download a file from the storage directory"""
    file_path = os.path.join(STORAGE_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.delete("/{filename}")
async def delete_file(filename: str):
    """Delete a file from the storage directory"""
    file_path = os.path.join(STORAGE_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
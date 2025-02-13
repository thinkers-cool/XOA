import os
import shutil
import time
from pathlib import Path
from fastapi import UploadFile
from typing import Optional
from uuid import uuid4
from ..settings import AVATAR_UPLOAD_DIR as BASE_UPLOAD_DIR, VALID_IMAGE_EXTENSIONS

def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()

def is_valid_image(file_extension: str) -> bool:
    return file_extension in VALID_IMAGE_EXTENSIONS

async def save_avatar(file: UploadFile) -> Optional[str]:
    if not file:
        return None

    file_extension = get_file_extension(file.filename)
    if not is_valid_image(file_extension):
        raise ValueError("Invalid file type. Only JPG, JPEG, PNG and GIF are allowed.")

    # Create upload directory if it doesn't exist
    os.makedirs(BASE_UPLOAD_DIR, exist_ok=True)

    # Generate unique filename with timestamp to prevent caching
    timestamp = int(time.time())
    unique_filename = f"{uuid4()}_{timestamp}{file_extension}"
    file_path = BASE_UPLOAD_DIR / unique_filename

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return f"/avatars/{unique_filename}"
    except Exception as e:
        raise Exception(f"Failed to save avatar: {str(e)}")
    finally:
        file.file.close()

def delete_avatar(avatar_url: str) -> bool:
    if not avatar_url:
        return False

    try:
        filename = Path(avatar_url).name
        file_path = BASE_UPLOAD_DIR / filename
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    except Exception:
        return False
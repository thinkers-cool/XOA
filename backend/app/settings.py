import os
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Database settings
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# JWT settings
SECRET_KEY = "your-secret-key-here"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 7 * 24 * 60

# File storage settings
STORAGE_DIR = BASE_DIR / "app" / "storage"
AVATAR_UPLOAD_DIR = STORAGE_DIR / "avatars"

# Ensure storage directories exist
os.makedirs(STORAGE_DIR, exist_ok=True)
os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)

# Valid file extensions for avatars
VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}

# CORS settings
ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Frontend development server
    "http://localhost:5173",  # Vite development server
]
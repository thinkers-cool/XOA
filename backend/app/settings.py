import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Database settings
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")  # Change this in production
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(7 * 24 * 60)))

# File storage settings
STORAGE_DIR = BASE_DIR / "app" / "storage"
AVATAR_UPLOAD_DIR = STORAGE_DIR / "avatars"

# Ensure storage directories exist
os.makedirs(STORAGE_DIR, exist_ok=True)
os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)

# Valid file extensions for avatars
VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}

# CORS settings
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

# Log directory
LOG_DIR = BASE_DIR / "logs"
os.makedirs(LOG_DIR, exist_ok=True)

# AI API settings
AI_API_BASE_URL = os.getenv("AI_API_BASE_URL")
AI_API_KEY = os.getenv("AI_API_KEY")
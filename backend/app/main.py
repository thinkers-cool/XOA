from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import ticket, ticket_template, user, role, file, preferences, resource, ai
from .settings import STORAGE_DIR

app = FastAPI(
    title="XOA (Thinkers AI OA) API",
    description="XOA (Thinkers AI OA): A low-code OA System.",
    version="0.1.0"
)

app.include_router(ticket.router)
app.include_router(ticket_template.router)
app.include_router(user.router)
app.include_router(role.router)
app.include_router(file.router)
app.include_router(preferences.router)
app.include_router(resource.router)
app.include_router(ai.router)
# Configure CORS
from .settings import ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file directory for avatars
app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")

@app.get("/")
async def root():
    return {"message": "Welcome to AIOA Backend API"}
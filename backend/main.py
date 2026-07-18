from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import settings
from database.connection import engine, Base
from api.auth import router as auth_router
from api.projects import router as projects_router
from api.tasks import router as tasks_router
from api.ai import router as ai_router
from api.ai_extended import router as ai_extended_router
from api.rbac import router as rbac_router
from api.invitations import router as invitations_router
from api.notifications import router as notifications_router
from api.activity import router as activity_router
from api.attachments import router as attachments_router
from api.search import router as search_router
from api.profile import router as profile_router
from api.events import router as events_router
from api.contact import router as contact_router
from middleware.logging import LoggingMiddleware
from middleware.rate_limit import RateLimitMiddleware
import os

# Create database tables (development only; production uses Alembic migrations)
if settings.is_development:
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DevBoard AI",
    description="AI-Powered Project Management API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

# Routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(ai_router)
app.include_router(ai_extended_router)
app.include_router(rbac_router)
app.include_router(invitations_router)
app.include_router(notifications_router)
app.include_router(activity_router)
app.include_router(attachments_router)
app.include_router(search_router)
app.include_router(profile_router)
app.include_router(events_router)
app.include_router(contact_router)

# Mount uploads directory for serving files
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/")
def root():
    return {
        "message": "Welcome to DevBoard AI API",
        "version": "2.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }

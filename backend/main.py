from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database.connection import engine, Base
from api.auth import router as auth_router
from api.projects import router as projects_router
from api.tasks import router as tasks_router
from api.ai import router as ai_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DevBoard AI",
    description="AI-Powered Project Management API",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to DevBoard AI API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

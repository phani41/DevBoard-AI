from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database.connection import get_db
from models.user import User
from services.auth_service import get_current_user_optional
from config import settings

router = APIRouter(prefix="/api", tags=["Contact"])


class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str


class ContactResponse(BaseModel):
    message: str


@router.post("/contact", response_model=ContactResponse)
def submit_contact(
    contact: ContactRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Submit a contact form message.

    In production, this would send an email or store the message.
    For now, it validates and acknowledges the submission.
    """
    # Validate inputs
    if len(contact.name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
    if len(contact.subject) < 5:
        raise HTTPException(status_code=400, detail="Subject must be at least 5 characters")
    if len(contact.message) < 20:
        raise HTTPException(status_code=400, detail="Message must be at least 20 characters")

    # In production: send email notification to admin, or store in database
    # For now, log to server output
    print(f"[CONTACT] From: {contact.name} <{contact.email}>")
    print(f"[CONTACT] Subject: {contact.subject}")
    print(f"[CONTACT] Message: {contact.message}")

    return ContactResponse(
        message="Thank you for your message! We'll get back to you as soon as possible."
    )

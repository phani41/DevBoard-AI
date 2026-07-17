from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import secrets
from database.connection import get_db
from models.user import User
from models.project import Project
from models.rbac import Invitation, ProjectMemberRole, ProjectRole
from schemas.invitation import InvitationCreate, InvitationCreateBatch, InvitationResponse, InvitationPublicResponse
from services.auth_service import get_current_user
from services.rbac_service import rbac_service
from services.email_service import email_service
from services.activity_service import activity_service
from services.notification_service import notification_service
from config import settings

router = APIRouter(prefix="/api/invitations", tags=["Invitations"])


@router.post("/projects/{project_id}", response_model=List[InvitationResponse], status_code=status.HTTP_201_CREATED)
def create_invitations(
    project_id: int,
    invitation_data: InvitationCreateBatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send invitations to a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "member:invite")

    invitations = []
    for inv in invitation_data.invitations:
        # Check if user already exists and is a member
        existing_user = db.query(User).filter(User.email == inv.email).first()
        if existing_user and existing_user in project.members:
            continue

        # Check for pending invitation
        existing_invite = db.query(Invitation).filter(
            Invitation.project_id == project_id,
            Invitation.email == inv.email,
            Invitation.status == "pending",
        ).first()
        if existing_invite:
            continue

        token = secrets.token_urlsafe(48)
        expires_at = datetime.utcnow() + timedelta(days=7)

        invitation = Invitation(
            project_id=project_id,
            email=inv.email,
            role=inv.role,
            token=token,
            expires_at=expires_at,
            status="pending",
            inviter_id=current_user.id,
        )
        db.add(invitation)
        db.commit()
        db.refresh(invitation)

        # Send email invitation
        email_service.send_invitation_email(
            to_email=inv.email,
            inviter_name=current_user.full_name or current_user.username,
            project_name=project.name,
            invite_token=token,
        )

        invitations.append(invitation)

        activity_service.log(
            db=db,
            action="invitation_sent",
            user_id=current_user.id,
            project_id=project_id,
            description=f"Sent invitation to {inv.email}",
        )

    return invitations


@router.get("/pending/{project_id}", response_model=List[InvitationResponse])
def get_pending_invitations(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get pending invitations for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "member:view")

    invitations = db.query(Invitation).filter(
        Invitation.project_id == project_id,
        Invitation.status == "pending",
    ).all()

    return invitations


@router.post("/accept/{token}")
def accept_invitation(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Accept a project invitation."""
    invitation = db.query(Invitation).filter(
        Invitation.token == token,
        Invitation.status == "pending",
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation")

    if invitation.expires_at < datetime.utcnow():
        invitation.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="Invitation has expired")

    # Verify email matches
    if invitation.email != current_user.email:
        raise HTTPException(
            status_code=403,
            detail="This invitation was sent to a different email address",
        )

    project = db.query(Project).filter(Project.id == invitation.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Add user to project
    if current_user not in project.members:
        project.members.append(current_user)

    # Set role
    role_assignment = rbac_service.set_user_role(
        db, invitation.project_id, current_user.id, invitation.role, project.owner_id
    )

    # Mark invitation as accepted
    invitation.status = "accepted"
    db.commit()

    activity_service.log(
        db=db,
        action="invitation_accepted",
        user_id=current_user.id,
        project_id=invitation.project_id,
        description=f"{current_user.username} accepted the invitation",
    )

    return {"message": "Invitation accepted", "project_id": invitation.project_id, "role": invitation.role}


@router.delete("/{invitation_id}")
def cancel_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel a pending invitation."""
    invitation = db.query(Invitation).filter(
        Invitation.id == invitation_id,
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    project = db.query(Project).filter(Project.id == invitation.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "member:invite")

    invitation.status = "cancelled"
    db.commit()

    return {"message": "Invitation cancelled"}


@router.post("/{invitation_id}/resend")
def resend_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Resend a pending invitation."""
    invitation = db.query(Invitation).filter(
        Invitation.id == invitation_id,
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Can only resend pending invitations")

    project = db.query(Project).filter(Project.id == invitation.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rbac_service.ensure_project_access(project, current_user, db, "member:invite")

    email_service.send_invitation_email(
        to_email=invitation.email,
        inviter_name=current_user.full_name or current_user.username,
        project_name=project.name,
        invite_token=invitation.token,
    )

    return {"message": "Invitation resent"}


@router.get("/my-invitations", response_model=List[InvitationPublicResponse])
def get_my_invitations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all pending invitations for the current user."""
    invitations = db.query(Invitation).filter(
        Invitation.email == current_user.email,
        Invitation.status == "pending",
        Invitation.expires_at > datetime.utcnow(),
    ).all()

    result = []
    for inv in invitations:
        project = db.query(Project).filter(Project.id == inv.project_id).first()
        inviter = db.query(User).filter(User.id == inv.inviter_id).first()
        result.append(InvitationPublicResponse(
            id=inv.id,
            project_id=inv.project_id,
            project_name=project.name if project else None,
            email=inv.email,
            role=inv.role,
            inviter_name=inviter.full_name or inviter.username if inviter else None,
            expires_at=inv.expires_at,
            status=inv.status,
        ))

    return result

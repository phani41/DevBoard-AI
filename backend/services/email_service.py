"""
Email service using Resend API for transactional emails.

Provides methods for sending password reset, welcome, and invitation emails
with clean HTML templates and plain text fallbacks.

Environment-aware sender address:
- Development: auto-uses `onboarding@resend.dev` (Resend's default sender,
  no domain verification needed in development)
- Production: uses FROM_EMAIL from environment variables
  (requires a verified domain in Resend)

Safety guarantees:
- Never crashes the FastAPI application
- Never exposes the API key in logs or error messages
- Gracefully handles missing configuration
"""

from typing import Optional
import logging
import resend
from config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Production-grade email service using Resend API.

    Configured via environment variables (RESEND_API_KEY, FROM_NAME, etc.).
    Gracefully handles failures without crashing the API.

    The sender address (from_email) is auto-selected based on ENVIRONMENT:
    - development -> onboarding@resend.dev  (no domain setup needed)
    - production  -> FROM_EMAIL from .env    (verified domain required)
    """

    def __init__(self) -> None:
        self.api_key: str = settings.RESEND_API_KEY
        self.from_email: str = settings.effective_from_email
        self.from_name: str = settings.FROM_NAME
        self.frontend_url: str = settings.FRONTEND_URL.rstrip("/")
        self.enabled: bool = bool(self.api_key and self.from_email)

        if self.enabled:
            resend.api_key = self.api_key
            logger.info(
                "Resend email service initialized (from: %s, env: %s)",
                self.from_email,
                settings.ENVIRONMENT,
            )
        else:
            missing = []
            if not self.api_key:
                missing.append("RESEND_API_KEY")
            if not self.from_email:
                missing.append("FROM_EMAIL")
            logger.warning(
                "Resend email service disabled — missing: %s",
                ", ".join(missing),
            )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _send(
        self,
        to_email: str,
        subject: str,
        html: str,
        text: str = "",
    ) -> bool:
        """Low-level send wrapper. Returns True on success, False on failure.

        Never crashes the API — all exceptions are caught and logged.
        Never exposes the API key in logs or error messages.
        """
        if not self.enabled:
            logger.info(
                "Email not sent (service disabled): to=%s, subject=%s",
                to_email,
                subject,
            )
            return False

        try:
            params: resend.Emails.SendParams = {
                "from": f"{self.from_name} <{self.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html,
                "text": text or None,
            }
            response = resend.Emails.send(params)
            logger.info(
                "Email sent successfully: to=%s, id=%s, subject=%s",
                to_email,
                response.get("id"),
                subject,
            )
            return True
        except resend.exceptions.ResendError as exc:
            logger.error(
                "Resend API error sending email to %s: %s",
                to_email,
                exc,
            )
            return False
        except Exception as exc:
            logger.error(
                "Unexpected error sending email to %s: %s",
                to_email,
                exc,
            )
            return False

    def _build_html_template(self, body_html: str) -> str:
        """Wrap body HTML in a reusable email template."""
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           background-color: #f4f4f5; padding: 24px; }}
    .container {{ max-width: 480px; margin: 0 auto; }}
    .card {{ background: #ffffff; border-radius: 16px; padding: 40px 32px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.06); }}
    .logo {{ width: 48px; height: 48px; border-radius: 12px;
            background: linear-gradient(135deg, #7c3aed, #6366f1);
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 20px; }}
    .logo-text {{ color: #fff; font-size: 24px; font-weight: 700; }}
    h1 {{ font-size: 22px; color: #1a1a2e; text-align: center; margin-bottom: 8px; }}
    p {{ color: #52525b; line-height: 1.65; text-align: center; margin-bottom: 16px; }}
    .btn-wrapper {{ text-align: center; margin: 28px 0; }}
    .btn {{ display: inline-block; padding: 14px 36px;
            background: linear-gradient(135deg, #7c3aed, #6366f1);
            color: #ffffff !important; text-decoration: none;
            border-radius: 10px; font-weight: 600; font-size: 15px; }}
    .divider {{ height: 1px; background: #e4e4e7; margin: 24px 0; }}
    .footer {{ text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px; }}
    .footer a {{ color: #a1a1aa; }}
    .notice {{ text-align: center; font-size: 13px; color: #71717a; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo"><span class="logo-text">D</span></div>
      {body_html}
      <div class="divider"></div>
      <div class="footer">
        <p>DevBoard AI &bull; AI-Powered Project Management</p>
        <p style="margin-top:4px">
          <a href="{self.frontend_url}" style="color:#a1a1aa;">{self.frontend_url}</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>"""

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """Send a password reset email with a secure link.

        Args:
            to_email: Recipient email address.
            reset_token: The secure token to embed in the reset URL.

        Returns:
            True if the email was sent successfully, False otherwise.
        """
        reset_url = f"{self.frontend_url}/reset-password?token={reset_token}"
        expiry_minutes = settings.RESET_TOKEN_EXPIRE_MINUTES

        subject = "Reset your DevBoard AI password"

        html_body = f"""
        <h1>Reset your password</h1>
        <p>We received a request to reset your DevBoard AI password. Click the button below to set a new password.</p>
        <div class="btn-wrapper">
          <a href="{reset_url}" class="btn">Reset Password</a>
        </div>
        <p style="font-size:14px;color:#a1a1aa;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <p class="notice">This link expires in {expiry_minutes} minutes and can only be used once.</p>
        """

        plain_text = (
            f"Reset your DevBoard AI password\n\n"
            f"We received a request to reset your password. Click the link below to set a new password:\n\n"
            f"{reset_url}\n\n"
            f"This link expires in {expiry_minutes} minutes and can only be used once.\n\n"
            f"If you didn't request this, you can safely ignore this email.\n\n"
            f"---\nDevBoard AI | {self.frontend_url}"
        )

        return self._send(to_email, subject, self._build_html_template(html_body), plain_text)

    def send_welcome_email(self, to_email: str, username: str) -> bool:
        """Send a welcome email after successful registration.

        Args:
            to_email: Recipient email address.
            username: The user's display name.

        Returns:
            True if the email was sent successfully, False otherwise.
        """
        subject = f"Welcome to DevBoard AI, {username}! 🎉"

        html_body = f"""
        <h1>Welcome to DevBoard AI! 🎉</h1>
        <p>Hey {username},</p>
        <p>You're all set! Start managing your projects with AI-powered tools — task breakdowns, bug analysis, documentation generation, and more.</p>
        <div class="btn-wrapper">
          <a href="{self.frontend_url}/dashboard" class="btn">Go to Dashboard</a>
        </div>
        <p class="notice">Need help? Just reply to this email.</p>
        """

        plain_text = (
            f"Welcome to DevBoard AI, {username}! 🎉\n\n"
            f"You're all set! Start managing your projects with AI-powered tools.\n\n"
            f"Go to your dashboard: {self.frontend_url}/dashboard\n\n"
            f"---\nDevBoard AI | {self.frontend_url}"
        )

        return self._send(to_email, subject, self._build_html_template(html_body), plain_text)

    def send_invitation_email(
        self,
        to_email: str,
        inviter_name: str,
        project_name: str,
        invite_token: str,
    ) -> bool:
        """Send a project invitation email (prepared for future use).

        Args:
            to_email: Recipient email address.
            inviter_name: Name of the user who sent the invitation.
            project_name: Name of the project the user is invited to.
            invite_token: Secure token for accepting the invitation.

        Returns:
            True if the email was sent successfully, False otherwise.
        """
        accept_url = f"{self.frontend_url}/invite?token={invite_token}"

        subject = f"{inviter_name} invited you to {project_name} on DevBoard AI"

        html_body = f"""
        <h1>You're invited!</h1>
        <p><strong>{inviter_name}</strong> has invited you to join the project <strong>{project_name}</strong> on DevBoard AI.</p>
        <div class="btn-wrapper">
          <a href="{accept_url}" class="btn">Accept Invitation</a>
        </div>
        <p class="notice">If you weren't expecting this invitation, you can ignore this email.</p>
        """

        plain_text = (
            f"{inviter_name} invited you to {project_name} on DevBoard AI\n\n"
            f"Accept the invitation: {accept_url}\n\n"
            f"If you weren't expecting this invitation, you can ignore this email.\n\n"
            f"---\nDevBoard AI | {self.frontend_url}"
        )

        return self._send(to_email, subject, self._build_html_template(html_body), plain_text)


# Singleton instance for FastAPI dependency injection
email_service = EmailService()

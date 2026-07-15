import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings


def _expiry_minutes():
    return settings.RESET_TOKEN_EXPIRE_MINUTES


class EmailService:
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
        self.enabled = bool(self.host and self.user and self.password)

    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send an email via SMTP. Returns True if successful, False otherwise."""
        if not self.enabled:
            print(f"[EmailService] SMTP not configured. Would send email to {to_email}: {subject}")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email
            msg["Subject"] = subject

            part = MIMEText(html_content, "html")
            msg.attach(part)

            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.sendmail(self.from_email, to_email, msg.as_string())

            print(f"[EmailService] Email sent to {to_email}")
            return True
        except Exception as e:
            print(f"[EmailService] Failed to send email to {to_email}: {e}")
            return False

    def send_password_reset_email(self, to_email: str, reset_url: str) -> bool:
        """Send a password reset email with a reset link."""
        expiry_minutes = _expiry_minutes()
        subject = "Reset your DevBoard AI password"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
                .card {{ background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
                .logo {{ width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #6366f1); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }}
                .logo-text {{ color: #fff; font-size: 24px; font-weight: bold; }}
                h1 {{ font-size: 24px; color: #1a1a2e; text-align: center; margin-bottom: 8px; }}
                p {{ color: #64748b; line-height: 1.6; text-align: center; margin-bottom: 24px; }}
                .btn {{ display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed, #6366f1); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 auto; }}
                .btn-wrapper {{ text-align: center; margin: 32px 0; }}
                .footer {{ text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px; }}
                .footer a {{ color: #94a3b8; }}
                .expiry {{ text-align: center; color: #94a3b8; font-size: 13px; margin-top: 16px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="logo">
                        <span class="logo-text">D</span>
                    </div>
                    <h1>Reset your password</h1>
                    <p>We received a request to reset your DevBoard AI password. Click the button below to set a new password.</p>
                    <div class="btn-wrapper">
                        <a href="{reset_url}" class="btn">Reset Password</a>
                    </div>
                    <p style="font-size: 14px; color: #94a3b8;">If you didn't request this, you can safely ignore this email.</p>
                    <div class="expiry">This link expires in {expiry_minutes} minutes.</div>
                </div>
                <div class="footer">
                    <p>DevBoard AI &bull; Project Management &amp; AI</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self.send_email(to_email, subject, html_content)


email_service = EmailService()

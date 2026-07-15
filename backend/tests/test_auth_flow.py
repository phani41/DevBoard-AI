"""
Tests for the password reset flow (forgot-password and reset-password endpoints).

Covers:
  - Forgot password → valid user  (token saved, email "sent")
  - Forgot password → unknown user (same response, no email enumeration)
  - Reset password → valid token  (password changed, token cleared)
  - Reset password → expired token (rejected)
  - Reset password → invalid token (rejected)
  - Reset password → already used token (rejected)
  - Login with new password after reset (end-to-end)
"""

import secrets
from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from models.user import User
from services.auth_service import verify_password, get_password_hash

# ---------------------------------------------------------------------------
# Forgot Password Tests
# ---------------------------------------------------------------------------


class TestForgotPassword:
    """Tests for POST /api/forgot-password"""

    ENDPOINT = "/api/forgot-password"

    def test_forgot_password_with_valid_user(self, client: TestClient, test_user: User, db_session: Session):
        """A registered user receives a reset token saved in the database."""
        response = client.post(self.ENDPOINT, json={"email": test_user.email})

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "sent" in data["message"].lower()

        # Verify the token was saved in the database
        db_session.refresh(test_user)
        assert test_user.reset_token is not None, "Reset token should be stored"
        assert test_user.reset_token_expires is not None, "Token expiry should be stored"
        assert test_user.reset_token_expires > datetime.utcnow(), "Token should not be expired"

    def test_forgot_password_with_unknown_user(self, client: TestClient):
        """An unknown email gets the same response (prevents email enumeration)."""
        response = client.post(
            self.ENDPOINT,
            json={"email": "nonexistent@example.com"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        # The message should be the same as for valid users
        assert "sent" in data["message"].lower()

    def test_forgot_password_response_identical_for_known_and_unknown(
        self, client: TestClient, test_user: User
    ):
        """The response message is intentionally identical to prevent enumeration."""
        # Request with valid user
        resp_known = client.post(self.ENDPOINT, json={"email": test_user.email})
        # Request with unknown user
        resp_unknown = client.post(self.ENDPOINT, json={"email": "unknown@example.com"})

        assert resp_known.status_code == 200
        assert resp_unknown.status_code == 200
        assert resp_known.json()["message"] == resp_unknown.json()["message"]

    def test_forgot_password_with_empty_email(self, client: TestClient):
        """An empty email is accepted (not validated at schema level) and returns 200."""
        response = client.post(self.ENDPOINT, json={"email": ""})
        # The schema accepts any string, so empty string is valid
        assert response.status_code == 200


# ---------------------------------------------------------------------------
# Reset Password Tests
# ---------------------------------------------------------------------------


class TestResetPassword:
    """Tests for POST /api/reset-password"""

    ENDPOINT = "/api/reset-password"

    def test_reset_password_with_valid_token(self, client: TestClient, user_with_reset_token: User, db_session: Session):
        """A valid token should allow the user to reset their password."""
        new_password = "NewSecurePass456!"
        token = user_with_reset_token.reset_token

        response = client.post(
            self.ENDPOINT,
            json={"token": token, "password": new_password},
        )

        assert response.status_code == 200
        data = response.json()
        assert "successfully" in data["message"].lower()

        # Verify the password was changed
        db_session.refresh(user_with_reset_token)
        assert verify_password(new_password, user_with_reset_token.hashed_password), \
            "Password should be updated to the new value"

        # Verify the token was cleared (single-use)
        assert user_with_reset_token.reset_token is None, "Token should be cleared after use"
        assert user_with_reset_token.reset_token_expires is None, "Expiry should be cleared after use"

    def test_reset_password_with_invalid_token(self, client: TestClient):
        """An invalid token should be rejected."""
        response = client.post(
            self.ENDPOINT,
            json={"token": "invalid-token-that-does-not-exist", "password": "NewPass123!"},
        )

        assert response.status_code == 400
        data = response.json()
        assert "invalid" in data["detail"].lower() or "expired" in data["detail"].lower()

    def test_reset_password_with_expired_token(self, client: TestClient, user_with_expired_token: User):
        """An expired token should be rejected."""
        token = user_with_expired_token.reset_token

        response = client.post(
            self.ENDPOINT,
            json={"token": token, "password": "NewPass456!"},
        )

        assert response.status_code == 400
        data = response.json()
        assert "expired" in data["detail"].lower() or "invalid" in data["detail"].lower()

    def test_reset_password_token_single_use(self, client: TestClient, user_with_reset_token: User, db_session: Session):
        """A used token should be invalid for subsequent requests."""
        token = user_with_reset_token.reset_token
        new_password = "FirstReset123!"

        # First use — should succeed
        resp1 = client.post(
            self.ENDPOINT,
            json={"token": token, "password": new_password},
        )
        assert resp1.status_code == 200

        # Second use with the same token — should fail
        resp2 = client.post(
            self.ENDPOINT,
            json={"token": token, "password": "AnotherPass789!"},
        )
        assert resp2.status_code == 400
        data = resp2.json()
        assert "invalid" in data["detail"].lower() or "expired" in data["detail"].lower()

    def test_reset_password_token_tampered(self, client: TestClient, user_with_reset_token: User):
        """A slightly modified token should be rejected."""
        original_token = user_with_reset_token.reset_token
        # Flip one character to simulate tampering
        tampered_token = list(original_token)
        tampered_token[0] = "A" if tampered_token[0] != "A" else "B"
        tampered_token = "".join(tampered_token)

        response = client.post(
            self.ENDPOINT,
            json={"token": tampered_token, "password": "NewPass789!"},
        )

        assert response.status_code == 400
        data = response.json()
        assert "invalid" in data["detail"].lower() or "expired" in data["detail"].lower()


# ---------------------------------------------------------------------------
# End-to-End Password Reset Flow
# ---------------------------------------------------------------------------


class TestPasswordResetEndToEnd:
    """Full end-to-end tests for the password reset flow."""

    def test_full_password_reset_flow(self, client: TestClient, test_user: User, db_session: Session):
        """
        Complete password reset flow:
          1. Request forgot-password
          2. Extract token from the database
          3. Reset the password
          4. Login with the new password
        """
        # Step 1: Request a password reset
        resp_forgot = client.post("/api/forgot-password", json={"email": test_user.email})
        assert resp_forgot.status_code == 200

        # Step 2: Extract the token from the database
        db_session.refresh(test_user)
        token = test_user.reset_token
        assert token is not None, "Token should be stored in the database"

        # Step 3: Reset the password
        new_password = "EndToEndTest789!"
        resp_reset = client.post(
            "/api/reset-password",
            json={"token": token, "password": new_password},
        )
        assert resp_reset.status_code == 200
        assert "successfully" in resp_reset.json()["message"].lower()

        # Step 4: Login with the new password
        resp_login = client.post(
            "/api/login",
            json={"email": test_user.email, "password": new_password},
        )
        assert resp_login.status_code == 200
        login_data = resp_login.json()
        assert "access_token" in login_data
        assert login_data["token_type"] == "bearer"
        assert login_data["user"]["email"] == test_user.email

        # Verify old password no longer works
        resp_old_login = client.post(
            "/api/login",
            json={"email": test_user.email, "password": "SecurePass123!"},
        )
        assert resp_old_login.status_code == 401, "Old password should be invalid"

    def test_reset_token_missing_in_db(self, client: TestClient, test_user: User):
        """A user without a reset token cannot reset."""
        # Make sure the user has no token
        assert test_user.reset_token is None

        # Try to reset with a random token
        response = client.post(
            "/api/reset-password",
            json={"token": secrets.token_urlsafe(48), "password": "RandomPass123!"},
        )
        assert response.status_code == 400

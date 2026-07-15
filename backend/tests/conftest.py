"""
Test configuration and fixtures for DevBoard AI backend tests.

Sets up an in-memory SQLite database for isolated testing
and provides reusable fixtures for users, auth tokens, etc.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import secrets

from database.connection import Base, get_db
from main import app
from config import settings
from models.user import User
from services.auth_service import get_password_hash

# ---------------------------------------------------------------------------
# In-memory SQLite engine for tests
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override the FastAPI dependency with test database session."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    """Remove test.db after all tests complete."""
    yield
    import os
    # Dispose the engine first so all connections are closed
    engine.dispose()
    db_path = "test.db"
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except PermissionError:
            pass  # Windows may still hold a lock
    # Also remove SQLite WAL and SHM files if they exist
    for ext in ["-wal", "-shm"]:
        path = db_path + ext
        if os.path.exists(path):
            try:
                os.remove(path)
            except PermissionError:
                pass


@pytest.fixture
def db_session():
    """Provide a clean database session for the test."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    """Provide a FastAPI TestClient with overridden DB dependency."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create and return a test user."""
    user = User(
        email="testuser@example.com",
        username="testuser",
        hashed_password=get_password_hash("SecurePass123!"),
        full_name="Test User",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def user_with_reset_token(db_session, test_user):
    """Create a user with a valid reset token."""
    test_user.reset_token = secrets.token_urlsafe(48)
    test_user.reset_token_expires = datetime.utcnow() + timedelta(minutes=30)
    db_session.commit()
    db_session.refresh(test_user)
    return test_user


@pytest.fixture
def user_with_expired_token(db_session, test_user):
    """Create a user with an expired reset token."""
    test_user.reset_token = secrets.token_urlsafe(48)
    test_user.reset_token_expires = datetime.utcnow() - timedelta(minutes=1)
    db_session.commit()
    db_session.refresh(test_user)
    return test_user

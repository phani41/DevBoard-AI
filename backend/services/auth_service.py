from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from config import settings
from database.connection import get_db
from models.user import User
from schemas.user import TokenResponse, UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/login", auto_error=False)

# Argon2id password hasher — the modern, memory-hard algorithm
# recommended by OWASP and the FastAPI ecosystem.
# Eliminates bcrypt's native 72-byte password length limit.
_password_hash = PasswordHash.recommended()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash.

    First tries pwdlib (Argon2id / bcrypt). Falls back to raw bcrypt
    for legacy hashes created by older deployments.
    """
    try:
        return _password_hash.verify(plain_password, hashed_password)
    except UnknownHashError:
        # Fallback: try bcrypt directly — handles hashes from older Render deploys
        pass
    except Exception:
        return False

    try:
        import bcrypt as _bcrypt

        return _bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using Argon2id via pwdlib."""
    return _password_hash.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    # Ensure sub is a string (python-jose requires string subject)
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = int(sub)
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Like get_current_user but returns None instead of raising when unauthenticated.

    Uses auto_error=False so unauthenticated requests pass through.
    Useful for public endpoints that optionally personalize the response.
    """
    if token is None:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            return None
        user = db.query(User).filter(User.id == int(sub)).first()
        return user
    except JWTError:
        return None


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(db: Session, email: str, username: str, password: str, full_name: Optional[str] = None) -> User:
    existing = db.query(User).filter((User.email == email) | (User.username == username)).first()
    if existing:
        if existing.email == email:
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed = get_password_hash(password)
    user = User(
        email=email,
        username=username,
        hashed_password=hashed,
        full_name=full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def build_token_response(user: User) -> TokenResponse:
    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )

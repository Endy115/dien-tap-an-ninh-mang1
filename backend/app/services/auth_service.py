from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin


def register_user(db: Session, payload: UserCreate) -> User:
    existing = User.get_by_username(db, payload.username)
    if existing:
        raise ValueError("Username already registered")

    if payload.email:
        existing_email = User.get_by_email(db, payload.email)
        if existing_email:
            raise ValueError("Email already registered")

    return User.create(
        db,
        username=payload.username,
        password_hash=hash_password(payload.password),
        email=payload.email,
    )


def authenticate_user(db: Session, payload: UserLogin) -> User | None:
    return User.authenticate(db, payload.username, payload.password)


def is_username_available(db: Session, username: str) -> bool:
    return User.get_by_username(db, username) is None


def is_email_available(db: Session, email: str) -> bool:
    return User.get_by_email(db, email) is None


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return User.get_by_id(db, user_id)

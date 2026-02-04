from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from sqlalchemy.orm import Session
from app.core.security import verify_password


class User(Base):
    __tablename__ = "user"

    user_id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(120), unique=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    hosted_sessions = relationship("Session", back_populates="host", foreign_keys="Session.admin_user_id")

    participations = relationship("SessionParticipant", back_populates="user")

    @classmethod
    def get_all(cls, db: Session):
        return db.query(cls).all()

    @classmethod
    def get_by_username(cls, db: Session, username: str):
        return db.query(cls).filter(cls.username == username).first()

    @classmethod
    def get_by_email(cls, db: Session, email: str):
        return db.query(cls).filter(cls.email == email).first()

    @classmethod
    def get_by_id(cls, db: Session, user_id: int):
        return db.query(cls).filter(cls.user_id == user_id).first()

    @classmethod
    def create(cls, db: Session, *, username: str, password_hash: str, email: str | None = None):
        user = cls(username=username, password_hash=password_hash, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @classmethod
    def authenticate(cls, db: Session, username: str, password: str):
        user = cls.get_by_username(db, username)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

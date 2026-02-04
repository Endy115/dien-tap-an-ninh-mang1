from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class SessionAssignment(Base):
    __tablename__ = "session_assignment"

    assignment_id: Mapped[int] = mapped_column(primary_key=True)

    session_id: Mapped[int] = mapped_column(
        ForeignKey("session.session_id", ondelete="CASCADE"),
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.user_id", ondelete="CASCADE"),
        nullable=False
    )

    role_id: Mapped[int | None] = mapped_column(
        ForeignKey("scenario_role.role_id", ondelete="SET NULL")
    )

    status: Mapped[str] = mapped_column(String(20), default="assigned", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("Session", back_populates="assignments")

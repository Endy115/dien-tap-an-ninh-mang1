from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Boolean, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Session(Base):
    __tablename__ = "session"

    session_id: Mapped[int] = mapped_column(primary_key=True)

    # SESSION – SCENARIO N:1
    scenario_id: Mapped[int] = mapped_column(
        ForeignKey("scenario.scenario_id", ondelete="RESTRICT"),
        nullable=False
    )

    # USER – SESSION 1:N
    admin_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.user_id", ondelete="SET NULL")
    )

    room_code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="waiting", nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime)

    host = relationship("User", back_populates="hosted_sessions", foreign_keys=[admin_user_id])
    scenario = relationship("Scenario")

    # USER – SESSION_PARTICIPANT 1:N (và SESSION – PARTICIPANT 1:N)
    participants = relationship("SessionParticipant", back_populates="session", cascade="all, delete-orphan")

    # SESSION – RESULT 1:1
    result = relationship("SessionResult", back_populates="session", uselist=False, cascade="all, delete-orphan")

    # SESSION – ACTION/LOG/STATE/ASSIGNMENT/SCORE 1:N
    assignments = relationship("SessionAssignment", back_populates="session", cascade="all, delete-orphan")
    actions = relationship("SessionAction", back_populates="session", cascade="all, delete-orphan")
    event_logs = relationship("SessionEventLog", back_populates="session", cascade="all, delete-orphan")
    network_states = relationship("SessionNetworkState", back_populates="session", cascade="all, delete-orphan")
    scores = relationship("UserScore", back_populates="session", cascade="all, delete-orphan")


class SessionParticipant(Base):
    __tablename__ = "session_participant"

    participant_id: Mapped[int] = mapped_column(primary_key=True)
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

    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    is_host: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    session = relationship("Session", back_populates="participants")
    user = relationship("User", back_populates="participations")


class SessionResult(Base):
    __tablename__ = "session_result"

    # 1:1 -> dùng session_id làm PK luôn
    session_id: Mapped[int] = mapped_column(
        ForeignKey("session.session_id", ondelete="CASCADE"),
        primary_key=True
    )

    total_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    min_pass_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    result: Mapped[str] = mapped_column(String(10), nullable=False)  # pass/fail
    evaluation: Mapped[str | None] = mapped_column(Text)

    session = relationship("Session", back_populates="result")

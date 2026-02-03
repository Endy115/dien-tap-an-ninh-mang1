import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(12), unique=True, index=True, nullable=False)
    host_user_id = Column(UUID(as_uuid=True), nullable=False)
    status = Column(String(20), default="lobby")
    scenario_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)

    members = relationship("RoomMember", back_populates="room", cascade="all, delete-orphan")


class RoomMember(Base):
    __tablename__ = "room_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    role_assigned = Column(String(80), nullable=True)
    status = Column(String(20), default="invited")
    joined_at = Column(DateTime, nullable=True)

    room = relationship("Room", back_populates="members")

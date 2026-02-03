import uuid
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(30), default="medium")
    tags = Column(JSONB, default=list)
    content = Column(JSONB, default=dict)

    questions = relationship("Question", back_populates="scenario", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scenario_id = Column(UUID(as_uuid=True), nullable=False)
    type = Column(String(20), nullable=False)
    text = Column(Text, nullable=False)
    options = Column(JSONB, default=list)
    correct_index = Column(Integer, nullable=True)
    malware_trigger_index = Column(Integer, nullable=True)
    context_title = Column(String(200), nullable=False)
    context_text = Column(Text, nullable=False)

    scenario = relationship("Scenario", back_populates="questions")

from sqlalchemy import String, Text, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base


class Scenario(Base):
    __tablename__ = "scenario"

    scenario_id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    time_limit_seconds: Mapped[int | None] = mapped_column(Integer)
    tags: Mapped[str | None] = mapped_column(String(255))
    difficulty: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # SCENARIO – ROLE 1:N
    roles = relationship("ScenarioRole", back_populates="scenario", cascade="all, delete-orphan")

    # SCENARIO – NODE 1:N
    nodes = relationship("ScenarioNode", back_populates="scenario", cascade="all, delete-orphan")

    # SCENARIO – TOPOLOGY 1:N
    topologies = relationship("Topology", back_populates="scenario", cascade="all, delete-orphan")

    @classmethod
    def get_all(cls, db: Session):
        return db.query(cls).all()


class ScenarioRole(Base):
    __tablename__ = "scenario_role"

    role_id: Mapped[int] = mapped_column(primary_key=True)
    scenario_id: Mapped[int] = mapped_column(
        ForeignKey("scenario.scenario_id", ondelete="CASCADE"),
        nullable=False
    )

    role_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role_description: Mapped[str | None] = mapped_column(Text)

    scenario = relationship("Scenario", back_populates="roles")


class ScenarioNode(Base):
    __tablename__ = "scenario_node"

    node_id: Mapped[int] = mapped_column(primary_key=True)
    scenario_id: Mapped[int] = mapped_column(
        ForeignKey("scenario.scenario_id", ondelete="CASCADE"),
        nullable=False
    )

    node_type: Mapped[str] = mapped_column(String(50), nullable=False)  # scene/question/end/...
    is_start: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    context_text: Mapped[str | None] = mapped_column(Text)

    topo_id: Mapped[int | None] = mapped_column(
        ForeignKey("topology.topo_id", ondelete="SET NULL")
    )

    screen_id: Mapped[int | None] = mapped_column(
        ForeignKey("screen_payload.screen_id", ondelete="SET NULL")
    )

    scenario = relationship("Scenario", back_populates="nodes")
    topology = relationship("Topology")
    screen = relationship("ScreenPayload")

    # NODE – QUESTION 1:N
    questions = relationship("Question", back_populates="node", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "question"

    question_id: Mapped[int] = mapped_column(primary_key=True)

    # NODE – QUESTION 1:N (FK nằm ở question)
    node_id: Mapped[int] = mapped_column(
        ForeignKey("scenario_node.node_id", ondelete="CASCADE"),
        nullable=False
    )

    # (optional) giữ scenario_id để query nhanh (có thể bỏ nếu muốn chuẩn hoá tuyệt đối)
    scenario_id: Mapped[int] = mapped_column(
        ForeignKey("scenario.scenario_id", ondelete="CASCADE"),
        nullable=False
    )

    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    node = relationship("ScenarioNode", back_populates="questions")
    scenario = relationship("Scenario")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answer"

    answer_id: Mapped[int] = mapped_column(primary_key=True)
    question_id: Mapped[int] = mapped_column(
        ForeignKey("question.question_id", ondelete="CASCADE"),
        nullable=False
    )

    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    feedback_text: Mapped[str | None] = mapped_column(Text)

    impact_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    impact_topology: Mapped[dict | None] = mapped_column(JSONB)

    question = relationship("Question", back_populates="answers")

    # ANSWER – TRANSITION 1:N
    transitions = relationship("Transition", back_populates="answer", cascade="all, delete-orphan")


class Transition(Base):
    __tablename__ = "transition"

    transition_id: Mapped[int] = mapped_column(primary_key=True)

    # ANSWER – TRANSITION 1:N (FK nằm ở transition)
    answer_id: Mapped[int] = mapped_column(
        ForeignKey("answer.answer_id", ondelete="CASCADE"),
        nullable=False
    )

    # TRANSITION – NODE N:1 (destination)
    destination_node_id: Mapped[int | None] = mapped_column(
        ForeignKey("scenario_node.node_id", ondelete="SET NULL"),
        nullable=True
    )

    trigger_type: Mapped[str | None] = mapped_column(String(50))  # answer/timer/...
    condition: Mapped[str | None] = mapped_column(Text)
    delay_seconds: Mapped[int | None] = mapped_column(Integer)

    answer = relationship("Answer", back_populates="transitions")
    destination_node = relationship("ScenarioNode", foreign_keys=[destination_node_id])

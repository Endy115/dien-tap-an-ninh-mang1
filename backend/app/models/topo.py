import uuid
from sqlalchemy import Boolean, Column, Float, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class TopologyNode(Base):
    __tablename__ = "topo_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), nullable=False)
    node_id = Column(String(40), nullable=False)
    label = Column(String(120), nullable=False)
    type = Column(String(20), nullable=False)
    up = Column(Boolean, default=True)
    cpu = Column(Float, default=0.0)
    infected = Column(Boolean, default=False)


class TopologyLink(Base):
    __tablename__ = "topo_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), nullable=False)
    link_id = Column(String(40), nullable=False)
    from_node = Column(String(40), nullable=False)
    to_node = Column(String(40), nullable=False)
    up = Column(Boolean, default=True)
    rtt_ms = Column(Float, default=0.0)

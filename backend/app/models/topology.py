from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base


class Topology(Base):
    __tablename__ = "topology"

    topo_id: Mapped[int] = mapped_column(primary_key=True)
    scenario_id: Mapped[int] = mapped_column(
        ForeignKey("scenario.scenario_id", ondelete="CASCADE"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    layout: Mapped[dict | None] = mapped_column(JSONB)

    scenario = relationship("Scenario", back_populates="topologies")

    devices = relationship("Device", back_populates="topology", cascade="all, delete-orphan")


class Device(Base):
    __tablename__ = "device"

    device_id: Mapped[int] = mapped_column(primary_key=True)
    topo_id: Mapped[int] = mapped_column(
        ForeignKey("topology.topo_id", ondelete="CASCADE"),
        nullable=False
    )

    role_id: Mapped[int | None] = mapped_column(
        ForeignKey("scenario_role.role_id", ondelete="SET NULL")
    )

    device_type: Mapped[str] = mapped_column(String(50), nullable=False)
    hostname: Mapped[str] = mapped_column(String(120), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(50))
    meta: Mapped[dict | None] = mapped_column(JSONB)

    topology = relationship("Topology", back_populates="devices")

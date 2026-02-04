from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class ScreenPayload(Base):
    __tablename__ = "screen_payload"

    screen_id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(30), nullable=False)  # MAIL/TERMINAL/...

    content1: Mapped[str | None] = mapped_column(Text)
    content2: Mapped[str | None] = mapped_column(Text)
    content3: Mapped[str | None] = mapped_column(Text)
    content4: Mapped[str | None] = mapped_column(Text)

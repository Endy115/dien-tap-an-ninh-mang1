from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class EventOut(BaseModel):
    id: UUID
    room_id: UUID
    type: str
    message: str
    created_at: datetime

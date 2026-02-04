from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SessionEventLogCreate(BaseModel):
    session_id: int
    actor_user_id: int | None = None
    event_type: str
    target_type: str | None = None
    target_id: int | None = None
    payload: dict | None = None

class SessionEventLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: int
    session_id: int
    actor_user_id: int | None = None
    event_type: str
    target_type: str | None = None
    target_id: int | None = None
    payload: dict | None = None
    created_at: datetime

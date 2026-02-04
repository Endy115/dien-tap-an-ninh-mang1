from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SessionActionCreate(BaseModel):
    session_id: int
    actor_user_id: int | None = None
    action_type: str
    payload: dict | None = None

class SessionActionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action_id: int
    session_id: int
    actor_user_id: int | None = None
    action_type: str
    payload: dict | None = None
    created_at: datetime

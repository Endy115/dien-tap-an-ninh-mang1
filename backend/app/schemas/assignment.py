from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SessionAssignmentCreate(BaseModel):
    session_id: int
    user_id: int
    role_id: int | None = None
    status: str = "assigned"

class SessionAssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    assignment_id: int
    session_id: int
    user_id: int
    role_id: int | None = None
    status: str
    created_at: datetime

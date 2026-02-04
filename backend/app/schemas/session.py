from datetime import datetime
from pydantic import BaseModel, ConfigDict

# ===== Session =====
class SessionCreate(BaseModel):
    scenario_id: int
    room_code: str

class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: int
    scenario_id: int
    admin_user_id: int | None = None
    room_code: str
    status: str
    started_at: datetime | None = None
    ended_at: datetime | None = None


# ===== Participant =====
class SessionParticipantCreate(BaseModel):
    session_id: int
    user_id: int
    role_id: int | None = None
    is_host: bool = False

class SessionParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    participant_id: int
    session_id: int
    user_id: int
    role_id: int | None = None
    joined_at: datetime
    is_host: bool

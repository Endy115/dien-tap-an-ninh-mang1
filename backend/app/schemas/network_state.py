from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SessionNetworkStateCreate(BaseModel):
    session_id: int
    network_snapshot: dict

class SessionNetworkStateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    state_id: int
    session_id: int
    network_snapshot: dict
    created_at: datetime

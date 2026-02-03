from pydantic import BaseModel
from uuid import UUID


class RoomCreate(BaseModel):
    scenario_id: UUID | None = None


class RoomOut(BaseModel):
    id: UUID
    code: str
    host_user_id: UUID
    status: str
    scenario_id: UUID | None

    class Config:
        from_attributes = True


class InviteIn(BaseModel):
    user_id: UUID
    role_assigned: str | None = None


class InviteRespondIn(BaseModel):
    accept: bool

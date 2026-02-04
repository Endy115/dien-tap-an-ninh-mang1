from datetime import datetime
from pydantic import BaseModel, ConfigDict

class UserCreate(BaseModel):
    username: str
    password: str
    email: str | None = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    username: str
    email: str | None = None
    created_at: datetime


class UsernameCheckOut(BaseModel):
    available: bool


class EmailCheckOut(BaseModel):
    available: bool


class AuthMeOut(BaseModel):
    username: str
    role: str

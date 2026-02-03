from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserOut(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    role: str
    is_banned: bool

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"


class UserUpdate(BaseModel):
    role: str | None = None
    is_banned: bool | None = None
    password: str | None = None

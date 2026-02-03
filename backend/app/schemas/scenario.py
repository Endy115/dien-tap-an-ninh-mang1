from pydantic import BaseModel
from uuid import UUID


class ScenarioOut(BaseModel):
    id: UUID
    title: str
    description: str
    difficulty: str
    tags: list

    class Config:
        from_attributes = True


class ScenarioCreate(BaseModel):
    title: str
    description: str
    difficulty: str = "medium"
    tags: list = []

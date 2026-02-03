from pydantic import BaseModel
from uuid import UUID


class QuestionOut(BaseModel):
    id: UUID
    type: str
    text: str
    options: list
    correct_index: int | None = None
    malware_trigger_index: int | None = None
    context_title: str
    context_text: str

    class Config:
        from_attributes = True

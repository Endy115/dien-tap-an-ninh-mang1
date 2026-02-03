from pydantic import BaseModel
from uuid import UUID


class AnswerIn(BaseModel):
    question_id: UUID
    selected_index: int | None = None
    raw_command: str | None = None


class AnswerOut(BaseModel):
    id: UUID
    room_id: UUID
    question_id: UUID
    user_id: UUID
    selected_index: int | None
    is_correct: bool

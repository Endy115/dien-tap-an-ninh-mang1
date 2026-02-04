from pydantic import BaseModel, ConfigDict

class SessionResultCreate(BaseModel):
    session_id: int
    total_score: int = 0
    min_pass_score: int = 0
    result: str  # pass/fail
    evaluation: str | None = None

class SessionResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: int
    total_score: int
    min_pass_score: int
    result: str
    evaluation: str | None = None

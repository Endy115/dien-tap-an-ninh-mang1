from pydantic import BaseModel, ConfigDict

class UserScoreCreate(BaseModel):
    session_id: int
    user_id: int
    score: int = 0

class UserScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_score_id: int
    session_id: int
    user_id: int
    score: int

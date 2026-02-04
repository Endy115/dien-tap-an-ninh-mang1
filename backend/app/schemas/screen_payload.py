from pydantic import BaseModel, ConfigDict

class ScreenPayloadCreate(BaseModel):
    type: str
    content1: str | None = None
    content2: str | None = None
    content3: str | None = None
    content4: str | None = None

class ScreenPayloadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    screen_id: int
    type: str
    content1: str | None = None
    content2: str | None = None
    content3: str | None = None
    content4: str | None = None

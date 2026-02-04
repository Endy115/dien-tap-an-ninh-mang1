from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.scenario import ScenarioOut
from app.services import room_service


router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get("/scenarios", response_model=list[ScenarioOut])
def list_scenarios(db: Session = Depends(get_db)):
    return room_service.list_scenarios(db)

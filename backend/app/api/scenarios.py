from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.scenario import Scenario
from app.schemas.scenario import ScenarioOut

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("", response_model=list[ScenarioOut])
async def list_scenarios(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Scenario))
    return result.scalars().all()


@router.get("/{scenario_id}", response_model=ScenarioOut)
async def get_scenario(scenario_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Scenario).where(Scenario.id == scenario_id))
    return result.scalar_one_or_none()

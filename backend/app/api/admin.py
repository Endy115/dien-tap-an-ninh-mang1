from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update, delete

from app.core.deps import require_admin
from app.core.security import hash_password
from app.db.session import get_db
from app.models.user import User
from app.models.scenario import Scenario
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.schemas.scenario import ScenarioOut, ScenarioCreate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
async def list_users(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(User))
    return result.scalars().all()


@router.post("/users", response_model=UserOut)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str, payload: UserUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = {}
    if payload.role is not None:
        data["role"] = payload.role
    if payload.is_banned is not None:
        data["is_banned"] = payload.is_banned
    if payload.password:
        data["password_hash"] = hash_password(payload.password)

    if data:
        await db.execute(update(User).where(User.id == user_id).values(**data))
        await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()
    return {"ok": True}


@router.get("/scenarios", response_model=list[ScenarioOut])
async def list_scenarios(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(Scenario))
    return result.scalars().all()


@router.post("/scenarios", response_model=ScenarioOut)
async def create_scenario(payload: ScenarioCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    scenario = Scenario(
        title=payload.title,
        description=payload.description,
        difficulty=payload.difficulty,
        tags=payload.tags,
    )
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)
    return scenario

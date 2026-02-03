from datetime import datetime, timedelta, timezone
import hashlib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password, decode_token
from app.db.session import get_db
from app.models.user import User, RefreshToken
from app.schemas.auth import LoginIn, RegisterIn, TokenOut, RefreshIn

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/register", response_model=TokenOut)
async def register(payload: RegisterIn, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == payload.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username exists")
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email exists")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="user",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access = create_access_token(str(user.id), user.role)
    refresh = create_refresh_token(str(user.id))
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_exp_days)
    await db.execute(
        insert(RefreshToken).values(user_id=user.id, token_hash=_hash_token(refresh), expires_at=expires_at)
    )
    await db.commit()
    return TokenOut(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == payload.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.is_banned:
        raise HTTPException(status_code=403, detail="User banned")

    access = create_access_token(str(user.id), user.role)
    refresh = create_refresh_token(str(user.id))
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_exp_days)
    await db.execute(
        insert(RefreshToken).values(user_id=user.id, token_hash=_hash_token(refresh), expires_at=expires_at)
    )
    await db.commit()
    return TokenOut(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenOut)
async def refresh_token(body: RefreshIn, db: AsyncSession = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub")
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.token_hash == _hash_token(body.refresh_token),
            RefreshToken.revoked.is_(False),
        )
    )
    token_row = result.scalar_one_or_none()
    if not token_row:
        raise HTTPException(status_code=401, detail="Refresh token revoked")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    role = user.role if user else "user"
    access = create_access_token(user_id, role)
    new_refresh = create_refresh_token(user_id)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_exp_days)

    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.id == token_row.id)
        .values(revoked=True)
    )
    await db.execute(
        insert(RefreshToken).values(user_id=user_id, token_hash=_hash_token(new_refresh), expires_at=expires_at)
    )
    await db.commit()
    return TokenOut(access_token=access, refresh_token=new_refresh)


@router.post("/logout")
async def logout(body: RefreshIn, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(RefreshToken).where(RefreshToken.token_hash == _hash_token(body.refresh_token))
        .values(revoked=True)
    )
    await db.commit()
    return {"ok": True}

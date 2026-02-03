from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(sub: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.access_token_exp_minutes)
    payload = {"sub": sub, "role": role, "type": "access", "iat": now, "exp": exp}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def create_refresh_token(sub: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(days=settings.refresh_token_exp_days)
    payload = {"sub": sub, "type": "refresh", "iat": now, "exp": exp}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except Exception:
        return None

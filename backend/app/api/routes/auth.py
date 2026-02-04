from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services import auth_service
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserOut,
    UsernameCheckOut,
    EmailCheckOut,
    AuthMeOut,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    try:
        return auth_service.register_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/login", response_model=UserOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, payload)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return user


@router.get("/me", response_model=AuthMeOut)
def me(
    user_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    if user_id is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = auth_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return AuthMeOut(username=user.username, role="Người chơi")


@router.get("/check-username", response_model=UsernameCheckOut)
def check_username(
    username: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    return UsernameCheckOut(available=auth_service.is_username_available(db, username))


@router.get("/check-email", response_model=EmailCheckOut)
def check_email(
    email: str = Query(..., min_length=3),
    db: Session = Depends(get_db),
):
    return EmailCheckOut(available=auth_service.is_email_available(db, email))

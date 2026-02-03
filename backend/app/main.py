from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.api import auth, rooms, scenarios, gameplay, admin, ws


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    if settings.auto_create_db:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await conn.execute(text("SELECT 1"))


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(rooms.router, prefix=settings.api_prefix)
app.include_router(scenarios.router, prefix=settings.api_prefix)
app.include_router(gameplay.router, prefix=settings.api_prefix)
app.include_router(admin.router, prefix=settings.api_prefix)
app.include_router(ws.router)

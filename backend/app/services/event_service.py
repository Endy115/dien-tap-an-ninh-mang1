from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
from datetime import datetime, timezone

from app.models.event_log import EventLog
from app.workers.realtime import room_hub


async def add_event(db: AsyncSession, room_id: str, event_type: str, message: str):
    data = {
        "room_id": room_id,
        "type": event_type,
        "message": message,
        "created_at": datetime.now(timezone.utc),
    }
    await db.execute(insert(EventLog).values(**data))
    await db.commit()

    await room_hub.broadcast(
        room_id,
        {
            "type": "event_log_append",
            "event": {"type": event_type, "message": message, "created_at": data["created_at"].isoformat()},
        },
    )

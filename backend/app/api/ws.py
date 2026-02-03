from fastapi import APIRouter, WebSocket
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.topo import TopologyNode, TopologyLink
from app.models.event_log import EventLog
from app.workers.realtime import room_hub

router = APIRouter()


@router.websocket("/ws/rooms/{room_id}")
async def room_ws(ws: WebSocket, room_id: str):
    await room_hub.connect(room_id, ws)
    try:
        async with AsyncSessionLocal() as db:  # type: AsyncSession
            nodes = (await db.execute(select(TopologyNode).where(TopologyNode.room_id == room_id))).scalars().all()
            links = (await db.execute(select(TopologyLink).where(TopologyLink.room_id == room_id))).scalars().all()
            events = (await db.execute(select(EventLog).where(EventLog.room_id == room_id))).scalars().all()
            await ws.send_json(
                {
                    "type": "snapshot",
                    "topo": {
                        "nodes": [
                            {
                                "node_id": n.node_id,
                                "label": n.label,
                                "type": n.type,
                                "up": n.up,
                                "cpu": n.cpu,
                                "infected": n.infected,
                            }
                            for n in nodes
                        ],
                        "links": [
                            {
                                "link_id": l.link_id,
                                "from": l.from_node,
                                "to": l.to_node,
                                "up": l.up,
                                "rtt": l.rtt_ms,
                            }
                            for l in links
                        ],
                    },
                    "events": [
                        {"message": e.message, "type": e.type, "created_at": e.created_at.isoformat()}
                        for e in events
                    ],
                }
            )

        while True:
            await ws.receive_text()
    except Exception:
        room_hub.disconnect(room_id, ws)

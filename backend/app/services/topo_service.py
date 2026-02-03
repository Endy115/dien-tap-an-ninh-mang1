from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.topo import TopologyNode
from app.workers.realtime import room_hub


async def apply_answer_to_topo(db: AsyncSession, room_id: str, is_malware: bool):
    result = await db.execute(select(TopologyNode).where(TopologyNode.room_id == room_id))
    nodes = result.scalars().all()
    if not nodes:
        return

    infected_ids = {n.node_id for n in nodes[:3]} if is_malware else set()

    for node in nodes:
        await db.execute(
            update(TopologyNode)
            .where(TopologyNode.id == node.id)
            .values(infected=node.node_id in infected_ids)
        )
    await db.commit()

    await room_hub.broadcast(
        room_id,
        {
            "type": "topo_update",
            "nodes": [
                {
                    "node_id": n.node_id,
                    "label": n.label,
                    "type": n.type,
                    "up": n.up,
                    "cpu": n.cpu,
                    "infected": n.node_id in infected_ids,
                }
                for n in nodes
            ],
        },
    )

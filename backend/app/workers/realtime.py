from typing import Dict, List
from fastapi import WebSocket


class RoomHub:
    def __init__(self) -> None:
        self.connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self.connections.setdefault(room_id, []).append(ws)

    def disconnect(self, room_id: str, ws: WebSocket) -> None:
        if room_id in self.connections and ws in self.connections[room_id]:
            self.connections[room_id].remove(ws)
            if not self.connections[room_id]:
                self.connections.pop(room_id, None)

    async def broadcast(self, room_id: str, payload: dict) -> None:
        conns = self.connections.get(room_id, [])
        for ws in list(conns):
            try:
                await ws.send_json(payload)
            except Exception:
                self.disconnect(room_id, ws)


room_hub = RoomHub()

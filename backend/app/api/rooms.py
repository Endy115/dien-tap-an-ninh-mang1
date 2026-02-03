import random
import string
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.room import Room, RoomMember
from app.schemas.room import RoomCreate, RoomOut, InviteIn, InviteRespondIn
from app.services.event_service import add_event
from app.models.topo import TopologyNode, TopologyLink

router = APIRouter(prefix="/rooms", tags=["rooms"])


def _room_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


@router.post("", response_model=RoomOut)
async def create_room(
    payload: RoomCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)
):
    code = _room_code()
    room = Room(code=code, host_user_id=user.id, scenario_id=payload.scenario_id)
    db.add(room)
    await db.commit()
    await db.refresh(room)

    nodes = [
        TopologyNode(room_id=room.id, node_id="r1", label="Gateway", type="router", cpu=28),
        TopologyNode(room_id=room.id, node_id="sw1", label="Core SW", type="switch", cpu=22),
        TopologyNode(room_id=room.id, node_id="web", label="Web (DMZ)", type="server", cpu=35),
        TopologyNode(room_id=room.id, node_id="db", label="DB (LAN)", type="server", cpu=40),
        TopologyNode(room_id=room.id, node_id="siem", label="SIEM", type="siem", cpu=30),
        TopologyNode(room_id=room.id, node_id="client", label="Client VLAN", type="pc", cpu=18),
    ]
    links = [
        TopologyLink(room_id=room.id, link_id="r1-sw1", from_node="r1", to_node="sw1", rtt_ms=1.5),
        TopologyLink(room_id=room.id, link_id="sw1-web", from_node="sw1", to_node="web", rtt_ms=3.2),
        TopologyLink(room_id=room.id, link_id="sw1-db", from_node="sw1", to_node="db", rtt_ms=4.6),
        TopologyLink(room_id=room.id, link_id="sw1-siem", from_node="sw1", to_node="siem", rtt_ms=5.1),
        TopologyLink(room_id=room.id, link_id="sw1-client", from_node="sw1", to_node="client", rtt_ms=1.8),
    ]
    db.add_all(nodes + links)
    await db.commit()
    await add_event(db, str(room.id), "system", f"Phòng {code} được tạo.")
    return room


@router.get("/{room_id}", response_model=RoomOut)
async def get_room(room_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.post("/{room_id}/join")
async def join_room(room_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    result = await db.execute(
        select(RoomMember).where(RoomMember.room_id == room.id, RoomMember.user_id == user.id)
    )
    member = result.scalar_one_or_none()
    if member:
        await db.execute(
            update(RoomMember)
            .where(RoomMember.id == member.id)
            .values(status="joined", joined_at=datetime.now(timezone.utc))
        )
    else:
        await db.execute(
            insert(RoomMember).values(
                room_id=room.id, user_id=user.id, status="joined", joined_at=datetime.now(timezone.utc)
            )
        )
    await db.commit()
    await add_event(db, str(room.id), "join", f"{user.username} đã vào phòng.")
    return {"ok": True}


@router.post("/{room_id}/invite")
async def invite_player(
    room_id: str,
    payload: InviteIn,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if str(room.host_user_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Host required")

    await db.execute(
        insert(RoomMember).values(
            room_id=room.id,
            user_id=payload.user_id,
            role_assigned=payload.role_assigned,
            status="invited",
        )
    )
    await db.commit()
    await add_event(db, str(room.id), "invite", f"Đã mời người chơi {payload.user_id}.")
    return {"ok": True}


@router.post("/{room_id}/invite/respond")
async def respond_invite(
    room_id: str,
    payload: InviteRespondIn,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(
        select(RoomMember).where(RoomMember.room_id == room_id, RoomMember.user_id == user.id)
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Invite not found")

    status = "joined" if payload.accept else "declined"
    await db.execute(update(RoomMember).where(RoomMember.id == member.id).values(status=status))
    await db.commit()
    await add_event(
        db,
        room_id,
        "invite",
        f"{user.username} {'đã chấp nhận' if payload.accept else 'đã từ chối'} lời mời.",
    )
    return {"ok": True}


@router.post("/{room_id}/start")
async def start_room(room_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if str(room.host_user_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Host required")
    await db.execute(
        update(Room)
        .where(Room.id == room_id)
        .values(status="running", started_at=datetime.now(timezone.utc))
    )
    await db.commit()
    await add_event(db, room_id, "system", "Phòng bắt đầu phiên.")
    return {"ok": True}


@router.post("/{room_id}/end")
async def end_room(room_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if str(room.host_user_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Host required")
    await db.execute(
        update(Room)
        .where(Room.id == room_id)
        .values(status="finished", ended_at=datetime.now(timezone.utc))
    )
    await db.commit()
    await add_event(db, room_id, "system", "Phòng kết thúc phiên.")
    return {"ok": True}

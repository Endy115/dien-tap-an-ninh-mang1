from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.room import Room
from app.models.scenario import Question
from app.models.answer import Answer
from app.models.topo import TopologyNode
from app.schemas.question import QuestionOut
from app.schemas.answer import AnswerIn
from app.services.event_service import add_event
from app.services.topo_service import apply_answer_to_topo

router = APIRouter(prefix="/gameplay", tags=["gameplay"])


@router.get("/rooms/{room_id}/questions", response_model=list[QuestionOut])
async def room_questions(room_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room or not room.scenario_id:
        raise HTTPException(status_code=404, detail="Room or scenario not found")
    result = await db.execute(select(Question).where(Question.scenario_id == room.scenario_id))
    return result.scalars().all()


@router.post("/rooms/{room_id}/answer")
async def submit_answer(
    room_id: str, payload: AnswerIn, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)
):
    result = await db.execute(select(Question).where(Question.id == payload.question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = payload.selected_index == question.correct_index if question.correct_index is not None else False
    await db.execute(
        insert(Answer).values(
            room_id=room_id,
            question_id=payload.question_id,
            user_id=user.id,
            selected_index=payload.selected_index,
            raw_command=payload.raw_command,
            is_correct=is_correct,
        )
    )
    await db.commit()

    await add_event(db, room_id, "answer", f"{user.username} đã trả lời câu hỏi.")

    is_malware = payload.selected_index == question.malware_trigger_index if question.malware_trigger_index is not None else False
    await apply_answer_to_topo(db, room_id, is_malware)

    if is_malware:
        result = await db.execute(select(TopologyNode).where(TopologyNode.room_id == room_id))
        nodes = result.scalars().all()
        infected = [n.label for n in nodes if n.infected]
        if infected:
            await add_event(db, room_id, "topo", f"Thiết bị nhiễm mã độc: {', '.join(infected)}.")
    return {"ok": True}

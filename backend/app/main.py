from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from sqlmodel import Session, SQLModel, select

from app.database import engine, get_session
from app.models import (
    Exercise,
    WorkoutDetail,
    WorkoutSession,
    WorkoutSessionCreate,
    WorkoutSessionRead,
)
from app.services.trainer import make_response
from app.trainings import TRAININGS, TRAININGS_BY_ID


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーション起動時にテーブルを作成"""
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/gemini")
async def make_gemini_response(input: str):
    response = make_response(input)
    return {"response": response}


@app.get("/exercises")
def get_exercises() -> list[Exercise]:
    """種目一覧の取得"""
    return TRAININGS


@app.post("/sessions")
def create_session(
    workout_session: WorkoutSessionCreate,
    session: Annotated[Session, Depends(get_session)],
) -> WorkoutSession:
    """日々の記録の登録(WorkoutSessionと複数のWorkoutDetailを一度のトランザクションでDBに保存)"""
    for detail in workout_session.details:
        if detail.exercise_id not in TRAININGS_BY_ID:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown exercise_id: {detail.exercise_id}",
            )

    # WorkoutSessionを作成
    db_session = WorkoutSession(
        session_date=workout_session.session_date,
        condition=workout_session.condition,
    )
    session.add(db_session)
    session.flush()  # session.idを取得するためにflush
    if db_session.id is None:
        raise HTTPException(status_code=500, detail="Failed to allocate session id")
    session_id = db_session.id

    # WorkoutDetailを作成
    for detail in workout_session.details:
        db_detail = WorkoutDetail(
            session_id=session_id,
            exercise_id=detail.exercise_id,
            weight=detail.weight,
            reps=detail.reps,
            sets=detail.sets,
        )
        session.add(db_detail)

    session.commit()
    session.refresh(db_session)
    return db_session


@app.get("/sessions")
def get_sessions(
    session: Annotated[Session, Depends(get_session)],
) -> list[WorkoutSessionRead]:
    """記録一覧の取得(WorkoutSessionに紐づくdetailsと、そのexercise情報もネストして返す)"""
    statement = select(WorkoutSession)
    sessions = session.exec(statement).all()

    # ネストしたデータを構築
    result = []
    for ws in sessions:
        if ws.id is None:
            raise HTTPException(status_code=500, detail="Session id is missing")
        workout_session_id = ws.id
        # detailsとexerciseをロード
        details_data = []
        for detail in ws.details:
            exercise = TRAININGS_BY_ID.get(detail.exercise_id)
            if exercise is None:
                raise HTTPException(
                    status_code=500,
                    detail=f"Unknown exercise_id in session data: {detail.exercise_id}",
                )
            details_data.append(
                {
                    "id": detail.id,
                    "exercise_id": detail.exercise_id,
                    "weight": detail.weight,
                    "reps": detail.reps,
                    "sets": detail.sets,
                    "exercise": exercise,
                }
            )

        result.append(
            WorkoutSessionRead(
                id=workout_session_id,
                session_date=ws.session_date,
                condition=ws.condition,
                details=details_data,
            )
        )

    return result

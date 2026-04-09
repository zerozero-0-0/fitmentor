from datetime import date
from typing import Literal

from sqlmodel import Field, Relationship, SQLModel

TrainingType = Literal["aerobic", "anaerobic"]


class Exercise(SQLModel):
    """固定種目データ"""
    id: int
    name: str
    training_type: TrainingType
    target_muscles: list[str] = Field(min_length=1)


class WorkoutSession(SQLModel, table=True):
    """日々の記録"""
    id: int | None = Field(default=None, primary_key=True)
    session_date: date = Field(index=True)
    condition: int = Field(ge=1, le=5)

    details: list["WorkoutDetail"] = Relationship(
        back_populates="session",
        cascade_delete=True,
    )


class WorkoutDetail(SQLModel, table=True):
    """詳細記録"""
    id: int | None = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="workoutsession.id", index=True)
    exercise_id: int = Field(index=True)
    weight: float = Field(ge=0)
    reps: int = Field(ge=1)
    sets: int = Field(ge=1)

    session: WorkoutSession | None = Relationship(back_populates="details")


class WorkoutDetailCreate(SQLModel):
    """詳細記録作成用スキーマ"""
    exercise_id: int
    weight: float = Field(ge=0)
    reps: int = Field(ge=1)
    sets: int = Field(ge=1)


class WorkoutSessionCreate(SQLModel):
    """セッション作成用スキーマ(詳細レコードを含む)"""
    session_date: date
    condition: int = Field(ge=1, le=5)
    details: list[WorkoutDetailCreate]


class WorkoutDetailRead(SQLModel):
    """詳細記録読み取り用スキーマ(Exercise情報を含む)"""
    id: int
    exercise_id: int
    weight: float
    reps: int
    sets: int
    exercise: Exercise


class WorkoutSessionRead(SQLModel):
    """セッション読み取り用スキーマ(詳細レコードを含む)"""
    id: int
    session_date: date
    condition: int
    details: list[WorkoutDetailRead]

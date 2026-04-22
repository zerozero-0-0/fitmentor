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
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class WorkoutDetail(SQLModel, table=True):
    """詳細記録"""
    id: int | None = Field(default=None, primary_key=True)
    session_id: int = Field(
        foreign_key="workoutsession.id",
        index=True,
    )
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
    sets: int = Field(default=1, ge=1)


class WorkoutSessionCreate(SQLModel):
    """セッション作成用スキーマ(詳細レコードを含む)"""
    session_date: date
    condition: int = Field(default=3, ge=1, le=5)
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


class SuggestedExercise(SQLModel):
    """Geminiが提案する1種目"""
    exercise_id: int
    name: str
    training_type: TrainingType = Field(
        description="有酸素種目は'aerobic'、無酸素種目は'anaerobic'"
    )
    sets: int = Field(ge=1, description="セット数(1以上)。有酸素種目は1を設定すること")
    reps: int = Field(
        ge=1,
        description=(
            "有酸素種目は運動時間(分)を設定すること(例: 20分なら20)。"
            "無酸素種目は1セットあたりの回数(1以上)を設定すること"
        ),
    )
    weight: float = Field(ge=0,
        description=(
            "使用重量(kg)。有酸素種目は0。"
            "無酸素種目は履歴を参考に設定し、"
            "履歴がなければ初心者レベルの値"
            "(例: チェストプレス=30、ラットプルダウン=30、レッグプレス=40)"
            "を必ず設定すること。0にしてはいけない。"
        )
    )


class SuggestRequest(SQLModel):
    """メニュー提案リクエスト"""
    condition: int = Field(ge=1, le=5)
    available_hours: int = Field(ge=1, le=3)


class SuggestResponse(SQLModel):
    """Geminiによるメニュー提案レスポンス"""
    reasoning: str
    exercises: list[SuggestedExercise]
    estimated_duration: int

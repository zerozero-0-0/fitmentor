# ruff: noqa: RUF001, E501
from app.models import Exercise, WorkoutSessionRead


def build_suggest_prompt(
    condition: int,
    available_hours: int,
    recent_sessions: list[WorkoutSessionRead],
    exercises: list[Exercise],
) -> str:
    history_lines = _format_history(recent_sessions)
    exercise_lines = _format_exercises(exercises)

    return f"""あなたは経験豊富なパーソナルトレーナーです。
以下の情報をもとに、今日のトレーニングメニューをJSON形式で提案してください。

## 今日のコンディション
{condition}/5（1=最悪、5=絶好調）

## 今日の運動可能時間
{available_hours}時間

## 直近の運動履歴
{history_lines}

## 利用可能な種目
{exercise_lines}

## 指示
- コンディションと直近の疲労度を考慮し、適切な負荷を設定してください
- 同じ部位を連日鍛えすぎないよう、バランスを取ってください
- 利用可能時間に収まるメニューを組んでください（1種目あたり約10〜15分を想定）
- 有酸素と無酸素の配分も時間と目的に応じて調整してください
- weightは直近の記録を参考に現実的な値を設定してください
- 有酸素種目（ランニングマシン・バイク・クロストレーナー）はweight=0にしてください
- 無酸素種目で直近の記録がない場合でも、必ず0より大きい初心者レベルの重量を設定してください（例: チェストプレス=30kg、ラットプルダウン=30kg、ショルダープレス=20kg、レッグプレス=40kg、レッグエクステンション=20kg、レッグカール=20kg、アダプター=20kg、アブダクター=20kg、アブドミナルクランチ=10kg）
- 提案する種目は必ず上記「利用可能な種目」の中から選んでください
"""


def _format_history(sessions: list[WorkoutSessionRead]) -> str:
    if not sessions:
        return "（記録なし）"

    lines = []
    for s in sessions:
        detail_parts = []
        for d in s.details:
            detail_parts.append(
                f"{d.exercise.name} {d.weight}kg×{d.reps}回 {d.sets}セット"
            )
        details_str = "、".join(detail_parts) if detail_parts else "（種目なし）"
        lines.append(
            f"- {s.session_date}（コンディション {s.condition}/5）: {details_str}"
        )

    return "\n".join(lines)


def _format_exercises(exercises: list[Exercise]) -> str:
    aerobic = [e for e in exercises if e.training_type == "aerobic"]
    anaerobic = [e for e in exercises if e.training_type == "anaerobic"]

    aerobic_str = "、".join(
        f"{e.name}（id={e.id}）" for e in aerobic
    )
    anaerobic_str = "、".join(
        f"{e.name}（id={e.id}、対象筋: {'/'.join(e.target_muscles)}）"
        for e in anaerobic
    )

    return f"有酸素: {aerobic_str}\n無酸素: {anaerobic_str}"

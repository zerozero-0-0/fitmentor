from app.models import Exercise

TRAININGS: list[Exercise] = [
    Exercise(
        id=1,
        name="ランニングマシン",
        training_type="aerobic",
        target_muscles=["大腿四頭筋", "ハムストリングス", "大臀筋", "下腿三頭筋"],
    ),
    Exercise(
        id=2,
        name="バイク",
        training_type="aerobic",
        target_muscles=["大腿四頭筋", "ハムストリングス", "大臀筋", "下腿三頭筋"],
    ),
    Exercise(
        id=3,
        name="クロストレーナー",
        training_type="aerobic",
        target_muscles=["大腿四頭筋", "ハムストリングス", "大臀筋", "広背筋", "三角筋"],
    ),
    Exercise(
        id=4,
        name="アブドミナルクランチ",
        training_type="anaerobic",
        target_muscles=["腹直筋"],
    ),
    Exercise(
        id=5,
        name="チェストプレス",
        training_type="anaerobic",
        target_muscles=["大胸筋", "三角筋前部", "上腕三頭筋"],
    ),
    Exercise(
        id=6,
        name="ラットプルダウン",
        training_type="anaerobic",
        target_muscles=["広背筋", "僧帽筋", "上腕二頭筋"],
    ),
    Exercise(
        id=7,
        name="ショルダープレス",
        training_type="anaerobic",
        target_muscles=["三角筋", "上腕三頭筋"],
    ),
    Exercise(
        id=8,
        name="レッグプレス",
        training_type="anaerobic",
        target_muscles=["大腿四頭筋", "ハムストリングス", "大臀筋"],
    ),
    Exercise(
        id=9,
        name="レッグエクステンション",
        training_type="anaerobic",
        target_muscles=["大腿四頭筋"],
    ),
    Exercise(
        id=10,
        name="レッグカール",
        training_type="anaerobic",
        target_muscles=["ハムストリングス"],
    ),
    Exercise(
        id=11,
        name="アダプター",
        training_type="anaerobic",
        target_muscles=["内転筋群", "下腹部"],
    ),
    Exercise(
        id=12,
        name="アブダクター",
        training_type="anaerobic",
        target_muscles=["中臀筋", "小臀筋"],
    ),
]

TRAININGS_BY_ID: dict[int, Exercise] = {training.id: training for training in TRAININGS}

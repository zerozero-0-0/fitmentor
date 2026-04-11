import type { TouchEvent } from "react";
import { useMemo, useRef, useState } from "react";

import type { Exercise, TrainingType } from "@/features/trainings/types";

const TRAINING_TYPE_LABEL: Record<TrainingType, string> = {
	aerobic: "有酸素",
	anaerobic: "無酸素",
};

type TrainingSelectorProps = {
	exercises: Exercise[];
};

export function TrainingSelector({ exercises }: TrainingSelectorProps) {
	const [activeType, setActiveType] = useState<TrainingType>("anaerobic");
	const touchStartX = useRef<number | null>(null);
	const touchStartY = useRef<number | null>(null);

	const groupedExercises = useMemo(
		() => ({
			aerobic: exercises.filter(
				(exercise) => exercise.trainingType === "aerobic",
			),
			anaerobic: exercises.filter(
				(exercise) => exercise.trainingType === "anaerobic",
			),
		}),
		[exercises],
	);

	const visibleExercises = groupedExercises[activeType];

	const switchTypeBySwipe = (deltaX: number) => {
		if (Math.abs(deltaX) < 40) {
			return;
		}

		setActiveType((current) => {
			if (deltaX < 0 && current === "anaerobic") {
				return "aerobic";
			}

			if (deltaX > 0 && current === "aerobic") {
				return "anaerobic";
			}

			return current;
		});
	};

	const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
		const touch = event.changedTouches[0];
		touchStartX.current = touch.clientX;
		touchStartY.current = touch.clientY;
	};

	const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
		if (touchStartX.current === null || touchStartY.current === null) {
			return;
		}

		const touch = event.changedTouches[0];
		const deltaX = touch.clientX - touchStartX.current;
		const deltaY = touch.clientY - touchStartY.current;

		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			switchTypeBySwipe(deltaX);
		}

		touchStartX.current = null;
		touchStartY.current = null;
	};

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold">トレーニング選択</h1>
				<p className="text-sm text-zinc-600">
					実施した種目を1つずつ追加してください。
				</p>
			</header>

			<div className="inline-flex w-fit rounded-lg border border-zinc-200 p-1">
				{(["anaerobic", "aerobic"] as TrainingType[]).map((trainingType) => (
					<button
						key={trainingType}
						type="button"
						onClick={() => setActiveType(trainingType)}
						className={`rounded-md px-4 py-2 text-sm font-medium transition ${
							activeType === trainingType
								? "bg-zinc-900 text-white"
								: "text-zinc-700 hover:bg-zinc-100"
						}`}
						aria-pressed={activeType === trainingType}
					>
						{TRAINING_TYPE_LABEL[trainingType]}
					</button>
				))}
			</div>

			<section
				className="space-y-3"
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			>
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-medium">
						{TRAINING_TYPE_LABEL[activeType]}
					</h2>
					<p className="text-xs text-zinc-500">
						モバイルでは左右スワイプで切替
					</p>
				</div>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{visibleExercises.map((exercise) => (
						<button
							type="button"
							key={exercise.id}
							className="rounded-lg border border-zinc-200 p-4 text-left transition hover:border-zinc-300"
						>
							<p className="font-medium">{exercise.name}</p>
							<p className="mt-2 text-sm text-zinc-600">
								対象: {exercise.targetMuscles.join(" / ")}
							</p>
						</button>
					))}
				</div>
			</section>
		</div>
	);
}

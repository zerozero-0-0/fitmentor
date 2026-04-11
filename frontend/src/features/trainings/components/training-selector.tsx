import type { TouchEvent } from "react";
import { useMemo, useRef, useState } from "react";

import bikeMachineIcon from "@/assets/icons/exercises/bike-machine.svg";
import chestPressIcon from "@/assets/icons/exercises/chest-press.svg";
import chinUpAndDownIcon from "@/assets/icons/exercises/chin-up-and-down.svg";
import latPullDownIcon from "@/assets/icons/exercises/lat-pull-down.svg";
import legCurlIcon from "@/assets/icons/exercises/leg-curl.svg";
import legExtensionIcon from "@/assets/icons/exercises/leg-extension.svg";
import legPressIcon from "@/assets/icons/exercises/leg-press.svg";
import runningMachineIcon from "@/assets/icons/exercises/running-machine.svg";
import shoulderPressIcon from "@/assets/icons/exercises/shoulder-press.svg";
import type { Exercise, TrainingType } from "@/features/trainings/types";

const TRAINING_TYPE_LABEL: Record<TrainingType, string> = {
	aerobic: "有酸素",
	anaerobic: "無酸素",
};

type TrainingSelectorProps = {
	exercises: Exercise[];
};

const EXERCISE_ICON_BY_ID: Partial<Record<number, string>> = {
	1: runningMachineIcon,
	2: bikeMachineIcon,
	3: chinUpAndDownIcon,
	5: chestPressIcon,
	6: latPullDownIcon,
	7: shoulderPressIcon,
	8: legPressIcon,
	9: legExtensionIcon,
	10: legCurlIcon,
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
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{visibleExercises.map((exercise) => (
						<button
							type="button"
							key={exercise.id}
							className="rounded-lg border border-zinc-200 p-4 text-left transition hover:border-zinc-300"
						>
							<p className="font-medium">{exercise.name}</p>
							<div className="mt-3 flex h-28 w-full items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-3">
								{EXERCISE_ICON_BY_ID[exercise.id] ? (
									<img
										src={EXERCISE_ICON_BY_ID[exercise.id]}
										alt={`${exercise.name} icon`}
										className="h-full w-full object-contain"
										loading="lazy"
									/>
								) : (
									<span className="text-xs text-zinc-500">アイコン準備中</span>
								)}
							</div>
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

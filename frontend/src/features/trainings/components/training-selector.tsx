import { ChevronDown, ChevronRight } from "lucide-react";
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

type BodyGroup = "腕" | "胸" | "背中" | "足";

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

const BODY_GROUP_ORDER: BodyGroup[] = ["腕", "胸", "背中", "足"];

const BODY_GROUP_BANNER_STYLE: Record<BodyGroup, string> = {
	腕: "border-amber-300 bg-amber-100 text-amber-900",
	胸: "border-rose-300 bg-rose-100 text-rose-900",
	背中: "border-emerald-300 bg-emerald-100 text-emerald-900",
	足: "border-blue-300 bg-blue-100 text-blue-900",
};

const EXERCISE_CARD_ACCENT_STYLE_BY_GROUP: Record<
	BodyGroup,
	Array<{ border: string; text: string }>
> = {
	腕: [
		{ border: "border-amber-300", text: "text-amber-700" },
		{ border: "border-amber-400", text: "text-amber-800" },
		{ border: "border-orange-300", text: "text-orange-700" },
	],
	胸: [
		{ border: "border-rose-300", text: "text-rose-700" },
		{ border: "border-pink-300", text: "text-pink-700" },
		{ border: "border-rose-400", text: "text-rose-800" },
	],
	背中: [
		{ border: "border-emerald-300", text: "text-emerald-700" },
		{ border: "border-teal-300", text: "text-teal-700" },
		{ border: "border-emerald-400", text: "text-emerald-800" },
	],
	足: [
		{ border: "border-blue-300", text: "text-blue-700" },
		{ border: "border-indigo-300", text: "text-indigo-700" },
		{ border: "border-blue-400", text: "text-blue-800" },
	],
};

function classifyBodyGroup(firstMuscle: string): BodyGroup {
	if (firstMuscle.includes("上腕") || firstMuscle.includes("三角筋")) {
		return "腕";
	}
	if (firstMuscle.includes("大胸筋") || firstMuscle.includes("腹")) {
		return "胸";
	}
	if (firstMuscle.includes("広背筋") || firstMuscle.includes("僧帽筋")) {
		return "背中";
	}
	if (
		firstMuscle.includes("大腿") ||
		firstMuscle.includes("ハムストリングス") ||
		firstMuscle.includes("下腿") ||
		firstMuscle.includes("臀") ||
		firstMuscle.includes("内転")
	) {
		return "足";
	}
	return "胸";
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
	const bodyGroup = classifyBodyGroup(exercise.targetMuscles[0] ?? "");
	const accentCandidates = EXERCISE_CARD_ACCENT_STYLE_BY_GROUP[bodyGroup];
	const accentStyle = accentCandidates[exercise.id % accentCandidates.length];

	return (
		<button
			type="button"
			className={`mx-2 my-2 flex aspect-square w-full max-w-xs flex-col rounded-3xl border-2 bg-white/90 p-4 text-center shadow-sm transition ${accentStyle.border}`}
		>
			<p className={`text-sm font-medium ${accentStyle.text}`}>
				{exercise.name}
			</p>
			<div className="mt-3 flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
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
		</button>
	);
}

export function TrainingSelector({ exercises }: TrainingSelectorProps) {
	const [activeType, setActiveType] = useState<TrainingType>("anaerobic");
	const [expandedBodyGroup, setExpandedBodyGroup] = useState<BodyGroup | null>(
		null,
	);
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

	const anaerobicByBodyGroup = useMemo(() => {
		const grouped: Record<BodyGroup, Exercise[]> = {
			腕: [],
			胸: [],
			背中: [],
			足: [],
		};
		for (const exercise of groupedExercises.anaerobic) {
			const firstMuscle = exercise.targetMuscles[0] ?? "";
			grouped[classifyBodyGroup(firstMuscle)].push(exercise);
		}
		return grouped;
	}, [groupedExercises.anaerobic]);

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

	const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
		const touch = event.changedTouches[0];
		touchStartX.current = touch.clientX;
		touchStartY.current = touch.clientY;
	};

	const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
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
			<div className="inline-flex w-fit rounded-2xl border border-zinc-200 bg-zinc-50 p-1.5">
				{(["anaerobic", "aerobic"] as TrainingType[]).map((trainingType) => (
					<button
						key={trainingType}
						type="button"
						onClick={() => setActiveType(trainingType)}
						className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
							activeType === trainingType
								? trainingType === "anaerobic"
									? "bg-rose-600 text-white"
									: "bg-sky-600 text-white"
								: "text-zinc-700 hover:bg-zinc-100"
						}`}
						aria-pressed={activeType === trainingType}
					>
						{TRAINING_TYPE_LABEL[trainingType]}
					</button>
				))}
			</div>

			<section
				className="space-y-2"
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			>
				{activeType === "anaerobic" ? (
					<div className="space-y-2">
						{BODY_GROUP_ORDER.map((bodyGroup) => (
							<div key={bodyGroup} className="space-y-1">
								<button
									type="button"
									onClick={() =>
										setExpandedBodyGroup((current) =>
											current === bodyGroup ? null : bodyGroup,
										)
									}
									className={`w-full rounded-2xl border px-4 py-3.5 text-left text-base font-semibold transition ${BODY_GROUP_BANNER_STYLE[bodyGroup]}`}
									aria-expanded={expandedBodyGroup === bodyGroup}
								>
									<div className="flex w-full items-center justify-between">
										<span className="leading-none">{bodyGroup}</span>
										<span
											aria-hidden="true"
											className="inline-flex h-10 w-10 shrink-0 items-center justify-center"
										>
											{expandedBodyGroup === bodyGroup ? (
												<ChevronDown className="h-9 w-9" />
											) : (
												<ChevronRight className="h-9 w-9" />
											)}
										</span>
									</div>
								</button>
								{expandedBodyGroup === bodyGroup ? (
									<div className="flex flex-col items-center gap-2">
										{anaerobicByBodyGroup[bodyGroup].map((exercise) => (
											<ExerciseCard key={exercise.id} exercise={exercise} />
										))}
									</div>
								) : null}
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center gap-2">
						{groupedExercises.aerobic.map((exercise) => (
							<ExerciseCard key={exercise.id} exercise={exercise} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}

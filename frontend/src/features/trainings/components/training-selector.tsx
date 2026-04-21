import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import type { FormEvent, TouchEvent } from "react";
import { useMemo, useRef, useState } from "react";
import type { components } from "@/api/schema";
import { SuggestionModal } from "./suggestion-modal";

type SuggestResponse = components["schemas"]["SuggestResponse"];
type SuggestedExercise = components["schemas"]["SuggestedExercise"];

import { toast } from "sonner";

import bikeMachineIcon from "@/assets/icons/exercises/bike-machine.svg";
import chestPressIcon from "@/assets/icons/exercises/chest-press.svg";
import chinUpAndDownIcon from "@/assets/icons/exercises/chin-up-and-down.svg";
import latPullDownIcon from "@/assets/icons/exercises/lat-pull-down.svg";
import legCurlIcon from "@/assets/icons/exercises/leg-curl.svg";
import legExtensionIcon from "@/assets/icons/exercises/leg-extension.svg";
import legPressIcon from "@/assets/icons/exercises/leg-press.svg";
import runningMachineIcon from "@/assets/icons/exercises/running-machine.svg";
import shoulderPressIcon from "@/assets/icons/exercises/shoulder-press.svg";
import { Button } from "@/components/ui/button";
import type {
	ApiErrorResponse,
	Exercise,
	TrainingType,
	WorkoutSessionCreatePayload,
} from "@/features/trainings/types";

const TRAINING_TYPE_LABEL: Record<TrainingType, string> = {
	aerobic: "有酸素",
	anaerobic: "無酸素",
};

type TrainingSelectorProps = {
	exercises: Exercise[];
};

type BodyGroup = "腕" | "胸" | "背中" | "足";

type ExerciseRecord = {
	weight: string;
	reps: string;
};

const EMPTY_EXERCISE_RECORD: ExerciseRecord = {
	weight: "",
	reps: "",
};

const WEIGHT_OPTIONS = Array.from({ length: 81 }, (_, index) =>
	(index * 2.5).toFixed(1),
);
const REPS_OPTIONS = Array.from({ length: 20 }, (_, index) => `${index + 1}`);

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

function getApiBaseUrl(): string {
	return "";
}

function getTodayLocalDateString(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = `${now.getMonth() + 1}`.padStart(2, "0");
	const day = `${now.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
}

const DEFAULT_SESSION_CONDITION = 3;

function roundToNearest2_5(value: number): string {
	return (Math.round(value / 2.5) * 2.5).toFixed(1);
}

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

function ExerciseCard({
	exercise,
	latestRecord,
	onSelect,
}: {
	exercise: Exercise;
	latestRecord?: ExerciseRecord;
	onSelect: (exercise: Exercise) => void;
}) {
	const bodyGroup = classifyBodyGroup(exercise.targetMuscles[0] ?? "");
	const accentCandidates = EXERCISE_CARD_ACCENT_STYLE_BY_GROUP[bodyGroup];
	const accentStyle = accentCandidates[exercise.id % accentCandidates.length];

	return (
		<button
			type="button"
			onClick={() => onSelect(exercise)}
			className={`mx-2 my-2 flex aspect-square w-full max-w-xs flex-col rounded-3xl border-2 bg-white/90 p-4 text-center shadow-sm transition ${accentStyle.border}`}
		>
			<p className={`text-sm font-medium ${accentStyle.text}`}>
				{exercise.name}
			</p>
			{latestRecord?.weight || latestRecord?.reps ? (
				<p className="mt-1 text-xs text-zinc-500">
					前回: {latestRecord.weight || "-"}kg / {latestRecord.reps || "-"}回
				</p>
			) : null}
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

function PickerColumn({
	label,
	options,
	selectedValue,
	onSelect,
}: {
	label: string;
	options: string[];
	selectedValue: string;
	onSelect: (value: string) => void;
}) {
	return (
		<div className="space-y-2">
			<p className="text-base font-semibold text-zinc-800">{label}</p>
			<div className="overflow-x-auto overflow-y-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
				<div className="flex w-max gap-2.5">
					{options.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => onSelect(option)}
							className={`min-h-14 min-w-20 shrink-0 rounded-xl border px-5 py-3 text-lg font-semibold transition ${
								selectedValue === option
									? "border-sky-600 bg-sky-600 text-white"
									: "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
							}`}
							aria-pressed={selectedValue === option}
						>
							{option}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

export function TrainingSelector({ exercises }: TrainingSelectorProps) {
	const [activeType, setActiveType] = useState<TrainingType>("anaerobic");
	const [expandedBodyGroup, setExpandedBodyGroup] = useState<BodyGroup | null>(
		null,
	);
	const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
		null,
	);
	const [exerciseRecords, setExerciseRecords] = useState<
		Partial<Record<number, ExerciseRecord>>
	>({});
	const [recordForm, setRecordForm] = useState<ExerciseRecord>(
		EMPTY_EXERCISE_RECORD,
	);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [showSuggestionModal, setShowSuggestionModal] = useState(false);
	const [acceptedSuggestion, setAcceptedSuggestion] =
		useState<SuggestResponse | null>(null);
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

	const handleAcceptSuggestion = (suggestion: SuggestResponse) => {
		setAcceptedSuggestion(suggestion);
		setShowSuggestionModal(false);
	};

	const openRecordPopup = (exercise: Exercise, prefill?: SuggestedExercise) => {
		setSaveError(null);
		setSelectedExercise(exercise);
		if (prefill) {
			setRecordForm({
				weight: roundToNearest2_5(prefill.weight),
				reps: String(prefill.reps),
			});
		} else {
			setRecordForm(exerciseRecords[exercise.id] ?? EMPTY_EXERCISE_RECORD);
		}
	};

	const closeRecordPopup = () => {
		setSaveError(null);
		setSelectedExercise(null);
		setRecordForm(EMPTY_EXERCISE_RECORD);
	};

	const handleSaveRecord = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedExercise) {
			return;
		}
		if (!recordForm.weight || !recordForm.reps) {
			setSaveError("重量と回数を選択してください。");
			return;
		}

		setSaveError(null);
		setIsSaving(true);

		const payload: WorkoutSessionCreatePayload = {
			session_date: getTodayLocalDateString(),
			condition: DEFAULT_SESSION_CONDITION,
			details: [
				{
					exercise_id: selectedExercise.id,
					weight: Number(recordForm.weight),
					reps: Number(recordForm.reps),
					sets: 1,
				},
			],
		};

		try {
			const response = await fetch(`${getApiBaseUrl()}/sessions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorBody = (await response
					.json()
					.catch(() => null)) as ApiErrorResponse | null;
				const detail = errorBody?.detail;
				if (typeof detail === "string") {
					throw new Error(detail);
				}
				if (Array.isArray(detail) && detail[0]?.msg) {
					throw new Error(detail[0].msg);
				}
				throw new Error("記録の保存に失敗しました。");
			}

			setExerciseRecords((current) => ({
				...current,
				[selectedExercise.id]: recordForm,
			}));
			closeRecordPopup();
			toast.success("成功しました！");
		} catch (error) {
			setSaveError(
				error instanceof Error ? error.message : "記録の保存に失敗しました。",
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
			{/* AIメニュー提案ボタン */}
			<button
				type="button"
				onClick={() => setShowSuggestionModal(true)}
				className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 py-3.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
			>
				<Sparkles className="h-4 w-4" />
				今日のメニューをAIに提案してもらう
			</button>

			{/* 提案メニュー表示 */}
			{acceptedSuggestion && (
				<section className="space-y-3">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-zinc-700">
							今日の提案メニュー
						</h2>
						<button
							type="button"
							onClick={() => setAcceptedSuggestion(null)}
							className="text-xs text-zinc-400 hover:text-zinc-600"
						>
							クリア
						</button>
					</div>
					<div className="space-y-2">
						{acceptedSuggestion.exercises.map((ex) => {
							const exercise = exercises.find((e) => e.id === ex.exercise_id);
							const isDone = Boolean(exerciseRecords[ex.exercise_id]);
							return (
								<button
									key={ex.exercise_id}
									type="button"
									disabled={!exercise}
									onClick={() => exercise && openRecordPopup(exercise, ex)}
									className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
										isDone
											? "border-emerald-200 bg-emerald-50"
											: "border-zinc-200 bg-white hover:bg-zinc-50"
									}`}
								>
									<span
										className={`font-medium ${isDone ? "text-emerald-700" : "text-zinc-900"}`}
									>
										{isDone ? "✓ " : ""}
										{ex.name}
									</span>
									<span className="text-sm text-zinc-500">
										{ex.weight > 0 ? `${ex.weight}kg × ` : ""}
										{ex.reps}回 × {ex.sets}セット
									</span>
								</button>
							);
						})}
					</div>
					<p className="text-right text-xs text-zinc-400">
						目安: 約{acceptedSuggestion.estimated_duration}分
					</p>
				</section>
			)}

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
											<ExerciseCard
												key={exercise.id}
												exercise={exercise}
												latestRecord={exerciseRecords[exercise.id]}
												onSelect={openRecordPopup}
											/>
										))}
									</div>
								) : null}
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center gap-2">
						{groupedExercises.aerobic.map((exercise) => (
							<ExerciseCard
								key={exercise.id}
								exercise={exercise}
								latestRecord={exerciseRecords[exercise.id]}
								onSelect={openRecordPopup}
							/>
						))}
					</div>
				)}
			</section>

			{selectedExercise ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<button
						type="button"
						className="absolute inset-0 bg-black/50"
						onClick={closeRecordPopup}
						aria-label="記録ポップアップを閉じる"
					/>
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="exercise-record-title"
						className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl"
					>
						<h2
							id="exercise-record-title"
							className="text-lg font-semibold text-zinc-900"
						>
							{selectedExercise.name}を記録
						</h2>
						<form onSubmit={handleSaveRecord} className="mt-4 space-y-4">
							<div className="space-y-3">
								<PickerColumn
									label="重量 (kg)"
									options={WEIGHT_OPTIONS}
									selectedValue={recordForm.weight}
									onSelect={(weight) =>
										setRecordForm((current) => ({
											...current,
											weight,
										}))
									}
								/>
								<PickerColumn
									label="回数 (回)"
									options={REPS_OPTIONS}
									selectedValue={recordForm.reps}
									onSelect={(reps) =>
										setRecordForm((current) => ({
											...current,
											reps,
										}))
									}
								/>
							</div>
							{saveError ? (
								<p className="text-sm font-medium text-rose-600">{saveError}</p>
							) : null}
							<div className="flex justify-center">
								<Button
									type="submit"
									size="lg"
									disabled={isSaving}
									className="h-12 w-full rounded-xl bg-sky-600 text-base font-semibold text-white hover:bg-sky-700"
								>
									{isSaving ? "保存中..." : "保存"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			) : null}

			{showSuggestionModal && (
				<SuggestionModal
					onAccept={handleAcceptSuggestion}
					onClose={() => setShowSuggestionModal(false)}
				/>
			)}
		</div>
	);
}

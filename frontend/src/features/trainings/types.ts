export type TrainingType = "aerobic" | "anaerobic";

export type Exercise = {
	id: number;
	name: string;
	trainingType: TrainingType;
	targetMuscles: string[];
};

export type WorkoutDetailCreatePayload = {
	exercise_id: number;
	weight: number;
	reps: number;
	sets: number;
};

export type WorkoutSessionCreatePayload = {
	session_date: string;
	condition: number;
	details: WorkoutDetailCreatePayload[];
};

export type ApiErrorResponse = {
	detail?: string | { msg?: string }[];
};

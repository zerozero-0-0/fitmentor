export type TrainingType = "aerobic" | "anaerobic";

export type Exercise = {
	id: number;
	name: string;
	trainingType: TrainingType;
	targetMuscles: string[];
};

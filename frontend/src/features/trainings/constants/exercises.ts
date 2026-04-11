import type { Exercise } from "@/features/trainings/types";

export const EXERCISES: Exercise[] = [
	{
		id: 1,
		name: "ランニングマシン",
		trainingType: "aerobic",
		targetMuscles: ["大腿四頭筋", "ハムストリングス", "大臀筋", "下腿三頭筋"],
	},
	{
		id: 2,
		name: "バイク",
		trainingType: "aerobic",
		targetMuscles: ["大腿四頭筋", "ハムストリングス", "大臀筋", "下腿三頭筋"],
	},
	{
		id: 3,
		name: "クロストレーナー",
		trainingType: "aerobic",
		targetMuscles: [
			"大腿四頭筋",
			"ハムストリングス",
			"大臀筋",
			"広背筋",
			"三角筋",
		],
	},
	{
		id: 4,
		name: "アブドミナルクランチ",
		trainingType: "anaerobic",
		targetMuscles: ["腹直筋"],
	},
	{
		id: 5,
		name: "チェストプレス",
		trainingType: "anaerobic",
		targetMuscles: ["大胸筋", "三角筋前部", "上腕三頭筋"],
	},
	{
		id: 6,
		name: "ラットプルダウン",
		trainingType: "anaerobic",
		targetMuscles: ["広背筋", "僧帽筋", "上腕二頭筋"],
	},
	{
		id: 7,
		name: "ショルダープレス",
		trainingType: "anaerobic",
		targetMuscles: ["三角筋", "上腕三頭筋"],
	},
	{
		id: 8,
		name: "レッグプレス",
		trainingType: "anaerobic",
		targetMuscles: ["大腿四頭筋", "ハムストリングス", "大臀筋"],
	},
	{
		id: 9,
		name: "レッグエクステンション",
		trainingType: "anaerobic",
		targetMuscles: ["大腿四頭筋"],
	},
	{
		id: 10,
		name: "レッグカール",
		trainingType: "anaerobic",
		targetMuscles: ["ハムストリングス"],
	},
	{
		id: 11,
		name: "アダプター",
		trainingType: "anaerobic",
		targetMuscles: ["内転筋群", "下腹部"],
	},
	{
		id: 12,
		name: "アブダクター",
		trainingType: "anaerobic",
		targetMuscles: ["中臀筋", "小臀筋"],
	},
];

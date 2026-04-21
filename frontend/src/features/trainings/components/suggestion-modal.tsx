import { useState } from "react";
import type { components } from "@/api/schema";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "./training-selector";

type SuggestRequest = components["schemas"]["SuggestRequest"];
type SuggestResponse = components["schemas"]["SuggestResponse"];

type Props = {
	onAccept: (suggestion: SuggestResponse) => void;
	onClose: () => void;
};

const CONDITION_LABELS: Record<number, string> = {
	1: "最悪",
	2: "悪い",
	3: "普通",
	4: "良い",
	5: "絶好調",
};

export function SuggestionModal({ onAccept, onClose }: Props) {
	const [condition, setCondition] = useState<number | null>(null);
	const [availableHours, setAvailableHours] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [suggestion, setSuggestion] = useState<SuggestResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFetch = async () => {
		if (condition === null || availableHours === null) return;
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(`${getApiBaseUrl()}/suggest`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					condition,
					available_hours: availableHours,
				} satisfies SuggestRequest),
			});
			if (!res.ok) throw new Error("提案の取得に失敗しました");
			setSuggestion((await res.json()) as SuggestResponse);
		} catch (e) {
			setError(e instanceof Error ? e.message : "エラーが発生しました");
		} finally {
			setIsLoading(false);
		}
	};

	const canFetch = condition !== null && availableHours !== null && !isLoading;

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
			<button
				type="button"
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				aria-label="閉じる"
			/>
			<div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
				<div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
					<h2 className="text-base font-semibold text-zinc-900">
						{suggestion ? "今日の提案メニュー" : "メニューを提案してもらう"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-sm text-zinc-400 hover:text-zinc-600"
					>
						閉じる
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-5">
					{!suggestion ? (
						<div className="space-y-6">
							{/* コンディション */}
							<div className="space-y-2">
								<p className="text-sm font-semibold text-zinc-700">
									今日のコンディション
								</p>
								<div className="flex gap-2">
									{([1, 2, 3, 4, 5] as const).map((v) => (
										<button
											key={v}
											type="button"
											onClick={() => setCondition(v)}
											className={`flex flex-1 flex-col items-center rounded-xl border py-2.5 text-sm font-medium transition ${
												condition === v
													? "border-sky-600 bg-sky-600 text-white"
													: "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
											}`}
										>
											<span className="text-base font-bold">{v}</span>
											<span className="text-xs">{CONDITION_LABELS[v]}</span>
										</button>
									))}
								</div>
							</div>

							{/* 運動可能時間 */}
							<div className="space-y-2">
								<p className="text-sm font-semibold text-zinc-700">
									運動可能時間
								</p>
								<div className="flex gap-2">
									{([1, 2, 3] as const).map((h) => (
										<button
											key={h}
											type="button"
											onClick={() => setAvailableHours(h)}
											className={`flex flex-1 items-center justify-center rounded-xl border py-3 text-base font-semibold transition ${
												availableHours === h
													? "border-sky-600 bg-sky-600 text-white"
													: "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
											}`}
										>
											{h}時間
										</button>
									))}
								</div>
							</div>

							{error && <p className="text-sm text-rose-600">{error}</p>}

							<Button
								type="button"
								onClick={handleFetch}
								disabled={!canFetch}
								className="h-12 w-full rounded-xl bg-sky-600 text-base font-semibold text-white hover:bg-sky-700 disabled:opacity-40"
							>
								{isLoading ? "Geminiに相談中..." : "提案を取得"}
							</Button>
						</div>
					) : (
						<div className="space-y-5">
							{/* 理由 */}
							<p className="rounded-2xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
								{suggestion.reasoning}
							</p>

							{/* 種目一覧 */}
							<div className="space-y-2">
								{suggestion.exercises.map((ex) => (
									<div
										key={ex.exercise_id}
										className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3"
									>
										<span className="font-medium text-zinc-900">{ex.name}</span>
										<span className="text-sm text-zinc-500">
											{ex.weight > 0 ? `${ex.weight}kg × ` : ""}
											{ex.reps}回 × {ex.sets}セット
										</span>
									</div>
								))}
							</div>

							<p className="text-right text-xs text-zinc-400">
								目安: 約{suggestion.estimated_duration}分
							</p>

							<Button
								type="button"
								onClick={() => onAccept(suggestion)}
								className="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700"
							>
								このメニューで開始
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

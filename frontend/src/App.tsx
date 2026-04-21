import { Toaster } from "sonner";

import { TrainingSelector } from "@/features/trainings/components/training-selector";
import { EXERCISES } from "@/features/trainings/constants/exercises";

function App() {
	return (
		<>
			<TrainingSelector exercises={EXERCISES} />
			<Toaster position="top-center" richColors />
		</>
	);
}

export default App;

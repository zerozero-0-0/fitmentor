import { TrainingSelector } from "@/features/trainings/components/training-selector";
import { EXERCISES } from "@/features/trainings/constants/exercises";

function App() {
	return <TrainingSelector exercises={EXERCISES} />;
}

export default App;

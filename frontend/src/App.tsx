import { Textarea } from "@/components/ui/textarea";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<Textarea placeholder="Type your message here..." />
		</QueryClientProvider>
	);
}

export default App;

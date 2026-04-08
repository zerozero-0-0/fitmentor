import { Textarea } from "@/components/ui/textarea";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Textarea placeholder="Type your message here..." />
		</QueryClientProvider>
	);
}

export default App;

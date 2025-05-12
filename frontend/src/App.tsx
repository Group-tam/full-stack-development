import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRoutes.tsx";
import { store } from "./redux/store.ts";
import { Provider } from "react-redux";
import { useEffect } from "react";

function App() {
	useEffect(() => {
		let worker: Worker | null = null;
		
		const handleWorker = () => {
			const excludedPaths = ['/', '/login', '/register'];
			const currentPath = window.location.pathname;

			if (!excludedPaths.includes(currentPath)) {
				if (!worker) {
					console.log('Starting worker for path:', currentPath);
					worker = new Worker('/notificationWorker.js');
					worker.postMessage({ command: 'start' });
					
					worker.addEventListener('message', () => {
						console.log('Worker triggered update');
						window.dispatchEvent(new Event('notifications-update'));
					});
				}
			} else {
				if (worker) {
					console.log('Stopping worker for path:', currentPath);
					worker.postMessage({ command: 'stop' });
					worker = null;
				}
			}
		};

		// Initial check
		handleWorker();

		// Listen for route changes
		const observer = new MutationObserver(() => {
			handleWorker();
		});

		observer.observe(document.documentElement, {
			childList: true,
			subtree: true
		});

		return () => {
			if (worker) {
				worker.postMessage({ command: 'stop' });
				worker = null;
			}
			observer.disconnect();
		};
	}, []);

	return (
		<Provider store={store}>
			<RouterProvider router={router} />
		</Provider>
	);
}

export default App;
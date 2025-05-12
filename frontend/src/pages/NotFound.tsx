import { useNavigate } from 'react-router-dom';
import ghost404 from '../assets/404window.png'; 

function NotFound() {
	const navigate = useNavigate();

	function handleGoBack() {
		// go back one entry in the history stack
		navigate(-1);
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-8 text-center">
			<h1 className="text-4xl font-semibold text-gray-800 mb-6 leading-snug">
				Oops! This is awkward…  
				You are looking for something that doesn’t exist.
			</h1>
			<img
				src={ghost404}
				alt="404 friendly"
				className="w-64 max-w-full mb-8"
			/>
			<button
				onClick={handleGoBack}
				className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-2xl shadow-lg transition duration-200"
			>
				Go back
			</button>
		</div>
	);
}

export default NotFound;

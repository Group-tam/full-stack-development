
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div className="min-h-screen bg-[#f4d03f] flex flex-col items-center justify-center px-4">
            <div>
            <div className="max-w-3xl text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 flex-col">
                    <div className="flex justify-center">
                        <img
                            src="/AppNameCard.svg"
                            alt="AppNameCard"
                            className="h-16 w-auto mb-6"
                        />
                    </div>
                    <br/>
                    <div className="text-gray-900">not a simple platform for event planning</div>
                </h1>
                <p className="text-lg md:text-xl text-gray-800 bg-[#f7dc6f] p-6 rounded-lg">
                    We are not simply a platform for event planning. We are a community of event organizers,
                    attendees, and enthusiasts who believe in creating meaningful connections through events.
                </p>
            </div>
                <div>

                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    to="/login"
                    className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors"
                >
                    Already a member?
                </Link>
                <Link
                    to="/register"
                    className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold transition-colors"
                >
                    Join Us Now
                </Link>
            </div>
        </div>

    // Adding sidebar
    );
}

export default HomePage;
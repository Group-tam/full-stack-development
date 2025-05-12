import LoginCard from "../components/login/LoginCard.tsx";
import {Link} from "react-router-dom";

export default function LoginPage() {
    return (
        <>
            <div className="min-h-screen bg-amber-100 pt-1 flex flex-col">
                    <div className="bg-amber-100 mt-5 w-full flex justify-center">
                    <Link to="/" className="inline-block">
                        <img
                            src="/AppNameCard.svg"
                            alt="AppNameCard"
                            className="h-16 w-auto"
                        />
                    </Link>
                    </div>
                <div className="flex-1 flex items-center justify-center">
                    <LoginCard/>
                </div>
            </div>
        </>
    )
}
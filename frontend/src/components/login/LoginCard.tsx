import {Link, useNavigate} from "react-router-dom";
import {FormEvent, useState} from "react";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../redux/store.ts";
import {login} from "../../redux/auth/authSlice.ts";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginCard() {
    const [show, setShow] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [message, showMessage] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        const resultAction = await dispatch(login({username, password}))
        if (login.fulfilled.match(resultAction)) {
            navigate("/public-events");
        } else if (login.rejected.match(resultAction)) {
            const errorCode = resultAction.payload as number;

            if (errorCode === 404) {
                setErrorMessage("There is no such user in the database.")
            } else if (errorCode === 401) {
                setErrorMessage("Invalid password.");
            } else {
                setErrorMessage("There has been an error");
            }
        }
    }

    return (
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg my-6">
            <h2 className="font-bold text-3xl">Welcome back</h2>
            <p className="text-1xl text-gray-500">Please enter your details</p>
            {/*Login Form*/}
            <form className="space-y-4 mt-8" onSubmit={handleLogin}>
                {/*Username input*/}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                    </label>

                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                {/*Password input*/}
                <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <div className="relative">
                    <input
                        type={show ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     <button type="button" className="absolute top-1/2 right-3 -translate-y-1/2 transform " onClick={() => {setShow(prev => !prev)}}>
                        {show ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                            <EyeIcon className="h-5 w-5 text-gray-500" />
                        )}
                    </button>
                </div>
                    {message && (
                        <h1 className="mt-4 text-xl font-bold text-red-600 p-4 text-center">
                            {errorMessage}
                        </h1>
                    )}
                </div>
                {/*Login button*/}
                <div className="mt-10">
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition duration-200" onClick={() => showMessage(true)}>
                        Sign in
                    </button>
                </div>
            </form>
            {/*Redirect to register page button*/}
            <div className="flex items-center mt-6">
                <span className="w-full flex justify-center items-center border border-gray-300 rounded-xl py-2">
                <span className="text-gray-700 text-sm whitespace-nowrap">New to <span className="font-bold">SEROMEET</span> community?</span>
                    <Link to="/register">
                        <span className="font-bold underline ml-1 text-blue-900">Sign Up</span>
                    </Link>
                </span>
            </div>
        </div>
    )
}
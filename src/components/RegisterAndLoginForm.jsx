import { useState } from "react";
import axios from "axios";
import { useUserContext } from "../context/UserContext";

export default function RegisterAndLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isLoginOrRegister, setIsLoginOrRegister] = useState('signin');
    const { setUsername: setLoggedInUsername, setId } = useUserContext();

    async function handleSubmit(ev) {
        ev.preventDefault();
        const url = isLoginOrRegister === 'register' ? 'register' : 'signin';
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/${url}`, { email, password }, { withCredentials: true });    //with-credentials: to store cookie(as cors origin used in backend)
        setLoggedInUsername(response.data.username);
        setId(response.data.id);
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input value={email}
                    onChange={ev => setEmail(ev.target.value)}
                    type="email" placeholder="email"
                    className="block w-full rounded-sm p-2 mb-2 border" />
                <input value={password}
                    onChange={ev => setPassword(ev.target.value)}
                    type="password"
                    placeholder="password"
                    className="block w-full rounded-sm p-2 mb-2 border" />
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
                    {`${isLoginOrRegister === 'register' ? 'Signup' : 'Login'}`}
                </button>

                <div className="text-center mt-2">
                    {isLoginOrRegister === 'register' ? (
                        <div>
                            Already a member?
                            <button className="ml-1" onClick={() => setIsLoginOrRegister('login')}>
                                Login here
                            </button>
                        </div>
                    ) : (
                        <div>
                            Don't have an account?
                            <button className="ml-1" onClick={() => setIsLoginOrRegister('register')}>
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
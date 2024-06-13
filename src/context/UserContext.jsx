import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react'

const UserContext = createContext({});

export const UserProvider = ({ children }) => {
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/get`, { withCredentials: true });
                setUsername(response.data.username);
                setId(response.data.id);
            } catch (error) {
                console.log("Error fetching user");
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    return (
        <UserContext.Provider value={{ username, setUsername, id, setId, loading }}>
            {children}
        </UserContext.Provider>
    )
}

//custom hook
export const useUserContext = () => useContext(UserContext);
import React from 'react'
import RegisterAndLoginForm from '../components/RegisterAndLoginForm'
import { useUserContext } from '../context/UserContext'
import Chat from '../components/Chat';

const Routes = () => {
    const { username, id, loading } = useUserContext();

    if(loading){
        return "loading..."
    }

    if (username) {
        return <Chat />;
    }

    return (
        <RegisterAndLoginForm />
    )
}

export default Routes
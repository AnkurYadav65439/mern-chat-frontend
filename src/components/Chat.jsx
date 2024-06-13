import React, { useEffect, useRef, useState } from 'react'
import Logo from './Logo';
import { useUserContext } from '../context/UserContext';
import { uniqBy } from "lodash";
import axios from 'axios';
import Contact from './Contact';

const Chat = () => {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { id, setUsername, setId, username } = useUserContext();
    const [newMessageText, setNewMessageText] = useState('');    //to send
    const [messages, setMessages] = useState([]);
    const [isLogout, setIsLogout] = useState(false);

    const selectedUserIdRef = useRef(selectedUserId);    //used due to a problem(closures), selectedUserId set to null in handleMessage
    const isLogoutRef = useRef(isLogout);    //used due to same problem

    const divUnderMessages = useRef();

    const messagesWithoutDupes = uniqBy(messages, '_id');

    useEffect(() => {
        connectToWS();
    }, []);

    const connectToWS = () => {
        const socket = new WebSocket(`${import.meta.env.VITE_SOCKET_PROTOCOL}://${(import.meta.env.VITE_API_BASE_URL).toString().split("//")[1]}`);
        setWs(socket);
        socket.addEventListener('message', handleMessage);
        socket.addEventListener('close', handleSocketClose);
    }

    const handleSocketClose = (e) => {
        if (!isLogoutRef) {
            setTimeout(() => {
                console.log('Trying to reconnect...')
                connectToWS();
                console.log("readystate in econnect", ws.readyState);
            }, 3000);
        }
    }

    const handleMessage = (e) => {
        e.preventDefault();
        const messageData = JSON.parse(e.data);

        if ('online' in messageData) {
            console.log("online recieved ", messageData.online);
            showOnlinePeople(messageData.online);
        } else if ('text' in messageData) {
            console.log("message erecieved")
            if (selectedUserIdRef.current === messageData.sender)
                setMessages(prev => ([...prev, { ...messageData }]));
        }

    }

    const showOnlinePeople = (peopleArr) => {
        //get unique people
        const people = {};
        peopleArr.forEach(({ userId, username }) => {
            if (userId === id)
                return;
            people[userId] = username;
        });

        setOnlinePeople(people);
    }

    const sendMessage = (e) => {
        e.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText
        }));
        setMessages(prev => ([...prev, {
            text: newMessageText,
            sender: id,
            recipient: selectedUserId,
            _id: Date.now()
        }]));
        setNewMessageText('');
    }

    //scrolling to latest
    useEffect(() => {
        const div = divUnderMessages.current;
        if (div) {
            div.scrollIntoView({ behaviour: 'smooth', block: 'end' });
        }
    }, [messages]);

    //getting convers. of selecteduser
    useEffect(() => {
        if (selectedUserId) {
            const getConversation = async () => {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/messages/${selectedUserId}`, { withCredentials: true });
                setMessages(response.data);
            }
            getConversation();
        }
        selectedUserIdRef.current = selectedUserId;
    }, [selectedUserId]);

    useEffect(() => {
        isLogoutRef.current = isLogout;
    }, [isLogout]);

    //get offline people (db)
    useEffect(() => {
        const getAllContacts = async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/contacts`, { withCredentials: true });
            //set all contacts excluding online
            const contacts = {};
            const onlinePeopleIdArr = Object.keys(onlinePeople);
            res.data.filter(p => !onlinePeopleIdArr.includes(p._id))
                .forEach(({ _id, username }) => {
                    if (_id === id)
                        return;
                    contacts[_id] = username;
                })

            setOfflinePeople(contacts);
        }
        getAllContacts();
    }, [onlinePeople]);

    const handleLogout = () => {
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/logout`, { withCredentials: true });
        setIsLogout(true);
        ws.close();
        // setWs(null);    //need??
        setUsername(null);
        setId(null);
        console.log("vaue of ws ", ws);
    }

    return (
        <div className='flex h-screen'>
            <div className='bg-white w-1/3 flex flex-col'>
                <div className='flex-grow'>
                    <Logo />
                    {Object.keys(onlinePeople).map(userId => (
                        <Contact
                            key={userId}
                            username={onlinePeople[userId]}
                            userId={userId}
                            selected={selectedUserId === userId}
                            setSelectedUserId={() => setSelectedUserId(userId)}
                            online={true}
                        />
                    ))}
                    {Object.keys(offlinePeople).map(userId => (
                        <Contact
                            key={userId}
                            username={offlinePeople[userId]}
                            userId={userId}
                            selected={selectedUserId === userId}
                            setSelectedUserId={() => setSelectedUserId(userId)}
                            online={false}
                        />
                    ))}
                </div>

                <div className='p-2 flex justify-between'>
                    <div className='flex gap-1'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                        </svg>
                        <span>{username}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className='bg-blue-100 py-1 px-2 rounded-sm text-sm text-gray-500 cursor-pointer hover:bg-blue-200'
                    >Logout
                    </button>
                </div>
            </div>

            <div className='flex flex-col bg-blue-50 w-2/3 p-2'>
                <div className="flex-grow">
                    {!selectedUserId ? (
                        <span className='h-full flex items-center justify-center text-gray-400'>
                            &larr; Select a person from sidebar to start conversation
                        </span>
                    ) : (
                        <div className='relative h-full'>
                            <div className='overflow-y-scroll absolute top-0 left-0 right-0 bottom-2'>
                                {messagesWithoutDupes.map((message) => (
                                    <div key={message._id} className={`${message.sender === id ? 'text-right' : 'text-left'} `}>
                                        <div className={`text-left inline-block p-2 my-2 rounded-md text-sm ${message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}>
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMessages}></div>
                            </div>
                        </div>
                    )}
                </div>

                {selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            placeholder='Type your message here'
                            className='bg-white flex-grow border rounded-sm p-2'
                        />
                        <label className='bg-blue-200 p-2 text-gray-500 rounded-sm '>
                            <input type="file" className='hidden' />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                            </svg>
                        </label>
                        <button type="submit" disabled={!newMessageText} className='bg-blue-500 p-2 text-white rounded-sm'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Chat
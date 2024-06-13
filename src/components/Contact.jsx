import React from 'react'
import Avatar from './Avatar'

const Contact = ({ username, userId, selected, setSelectedUserId, online }) => {
    
    return (
        <div
            key={userId}
            className={`border-b border-gray-100 flex gap-2 items-center cursor-pointer  ${selected && 'bg-blue-50'}`}
            onClick={() => setSelectedUserId(userId)}
        >
            {selected && (
                <div className='w-2 h-12 bg-blue-500 rounded-r-md'></div>
            )}
            <div className='flex gap-2 py-2 items-center px-4'>
                <Avatar online={online} userId={userId} username={username} />
                <span className='text-gray-800'>{username}</span>
            </div>
        </div>
    )
}

export default Contact
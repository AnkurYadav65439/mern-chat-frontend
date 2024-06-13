import React from 'react'

const Avatar = ({ userId, username, online = false }) => {
    const colors = ['bg-purple-200', 'bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-teal-200'];

    const userIdBase10 = parseInt(userId, 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];

    return (
        <div className={`w-8 h-8 ${color} relative rounded-full flex items-center justify-center`}>
            <span className='opacity-70'>
                {username[0]}
            </span>
            {online && (
                <div className='h-3 w-3 bg-green-300 rounded-full absolute bottom-0 right-0 border border-white'></div>
            )}
        </div>
    )
}

export default Avatar
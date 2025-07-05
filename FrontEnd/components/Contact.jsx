import React from 'react'
import { Avatar } from './Avatar'

export const Contact = ({id,username,onClick,selected,online,mode}) => {
  // console.log(selected);
  return (
    <div key={id} onClick={() =>  onClick(id)} 
        className={`border-b  flex items-center gap-2 cursor-pointer ${selected ? (mode ? 'bg-blue-700' : 'bg-blue-300'):''} ${mode ?"text-red-600 border-black" : "text-gray-800 border-gray-100"}`}>
            {selected && (
                <div className={`w-1 h-12 rounded-r-md ${mode ? 'bg-amber-200' :'bg-blue-600'  }`}></div>
            )}
        <div className='py-2 pl-4 flex gap-2 items-center'>
            <Avatar online={online} username={username} mode={mode} userId={id}/>
            <span className={`${mode ?"text-white" : "text-gray-800"}`}>{username}</span>
        </div>
    </div>  
  )
}

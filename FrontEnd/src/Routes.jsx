import React from 'react'
import { Register } from '../components/Register'
import { useContext } from 'react'
import { UserContext } from '../components/userContext'
import { Chat } from '../components/Chat'

export const Routes = () => {
    const{username,id} = useContext(UserContext)
    if(username) {
        return <Chat/>
    }
  return (
    <Register />
  )
}

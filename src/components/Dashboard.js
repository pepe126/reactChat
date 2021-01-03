import React from 'react'
import { useEffect } from 'react'
import { checkUser } from '../actions/authActions'
import { connect } from 'react-redux'
import Chats from './frontpage/Chats'
import Friends from './frontpage/Friends'
import Settings from './frontpage/Settings'

function Dashboard(props) {
    useEffect(()=>{
        props.checkUser()
    },[])
    
    return (
        <div className='visual row p-2 pl-4'>
            <Friends/>
            <Chats/>
            <Settings/>
        </div>
    )
}

export default  connect(null, {checkUser})(Dashboard)
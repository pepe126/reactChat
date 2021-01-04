import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import{ useSelector } from 'react-redux' 

//private route per la dashboard, solo utenti autenticati possono accedervi
export default function PrivateRoute({ component: Component, ...rest}) {
    const  currentUser  = useSelector(state=>state.auth.user)
    
    return (
        <Route
            {...rest}
            render = {props => {
                return currentUser ? <Component {...props}/> : <Redirect to = "/login" />
            }}
        >

        </Route>
    )
}

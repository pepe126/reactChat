import React, { useRef, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { signup } from '../../actions/authActions'
import { useEffect } from 'react'
import{ useSelector } from 'react-redux' 
import firebase from "firebase/app";
import "firebase/database";

function SignUp(props) {
    const emailRef = useRef()
    const passwordRef = useRef()
    const usernameRef = useRef()
    const passwordConfirmRef = useRef()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const history = useHistory()
    const [usernames, setUsernames] = useState([])
    const currentUser = useSelector(state=>state.auth.user)

    useEffect(()=>{
        retrieveUsernames()
        if(currentUser){
            history.push('/')
        }

    },[currentUser])
    
    function retrieveUsernames(){
        var users = firebase.database().ref('users/');
        users.on('value', (snapshot) => {
            let results = []
            for(var key in snapshot.val()){
                if(snapshot.val().hasOwnProperty(key)){
                    results.push(snapshot.val()[key].username)
                }
            }
            setUsernames(usernames => results)
        })
    }

    async function handleSubmit(e){
        e.preventDefault()
        if (passwordRef.current.value !== passwordConfirmRef.current.value){
            return setError('Password do not match')
        } else if (usernames.includes(usernameRef.current.value)) {
            return setError('Username already taken')
        }
        try{
            setError('')
            setLoading(true)
            props.signup({
                email: emailRef.current.value,
                password: passwordRef.current.value,
                username: usernameRef.current.value
            })
     
        } catch {
            setError('Failed to create an account')
        }
        setLoading(false)
    }

        return (
            <div className="App container d-flex align-items-center justify-content-center">
                <div className ="w-100" style = {{maxWidth: "500px"}}>
                    <div className = "authComp card mt-5">
                         <h2 className = "text-center mb-4">Sign Up</h2>
                         {error && <div className = "alert alert-danger">{error}</div>}
                         <form onSubmit = {handleSubmit}>
                             <label htmlFor = "email" className="form-label">Email</label>
                             <input ref = {emailRef} className="form-control" type="email" id="email" required/>
   
                             <label htmlFor = "username" className="form-label">Userame</label>
                             <input ref = {usernameRef} className="form-control" type="text" id="username" required/>
   
                             <label htmlFor = "password" className="form-label">Password</label>
                             <input ref = {passwordRef} className="form-control" type="password" id="password" required/>
   
                             <label htmlFor = "passwordConfirm" className="form-label">Password Confirmation</label>
                             <input ref = {passwordConfirmRef} className="form-control" type="password" id="passwordConfirm" required/>
   
                             <button disabled = {loading} className="btn mt-3 w-100 authBtn">SIGN UP</button>
                         </form>
                     </div>
                     <div className = "authScritte w-100 text-center mt-2">
                         Already have an account? <Link className='link' to = "/login">Login</Link>
                     </div>
                </div>
            </div>
           
        )
    }


export default connect(null, { signup })(SignUp)
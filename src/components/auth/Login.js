import React, { useRef, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { login } from '../../actions/authActions'
import { useEffect } from 'react'
import { useSelector } from 'react-redux' 


function Login(props) {
    const emailRef = useRef()
    const passwordRef = useRef()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const history = useHistory()
    const currentUser = useSelector(state=>state.auth.user)

    useEffect(()=>{
        if(currentUser){
            history.push('/')
        }

    },[currentUser])
    
    async function handleSubmit(e){
        e.preventDefault()

        try{
            setError('')
            setLoading(true)
            await props.login({
                email: emailRef.current.value,
                password: passwordRef.current.value    
            })
            
        }catch{
            setError('Failed to sign in')
        }
        setLoading(false)
    }

        return (
            <div className="App container d-flex align-items-center justify-content-center ">
                <div className ="w-100" style = {{maxWidth: "500px"}}>
                    <div className = "card mt-5 authComp">
                         <h2 className = "text-center mb-4">Login</h2>
                         {error && <div className = "alert alert-danger">{error}</div>}
                         <form onSubmit = {handleSubmit}>
                             <label htmlFor = "email" className="form-label">Email</label>
                             <input ref = {emailRef} className="form-control" type="email" id="email" required/>
   
                             <label htmlFor = "password" className="form-label">Password</label>
                             <input ref = {passwordRef} className="form-control" type="password" id="password" required/>
   
                             <button disabled = {loading} className="btn mt-3 w-100 authBtn">LOGIN</button>
                         </form>
                     </div>
                     <div className = "authScritte w-100 text-center mt-2">
                         Need an Account? <Link className='link' to = "/signup">SignUp</Link>
                     </div>
                </div>
            </div>
           
        )
    }


export default connect(null, { login })(Login)
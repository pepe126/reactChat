import { CHECK_USER, LOGIN, LOGOUT, SIGNUP } from './types';
import firebase from "firebase/app";
import "firebase/database"
import { auth } from '../firebase'

//azioni per login-logout-signup
//restituiscono il current user (ad eccezione del logout)
export const login = loginData => dispatch => {
    auth.signInWithEmailAndPassword(loginData.email, loginData.password)
    .then(user => dispatch({
        type: LOGIN,
        payload: user
    }))
}


export const logout = () => dispatch => {
    auth.signOut().then(dispatch({
        type: LOGOUT,
        payload: {}
    }))
}


export const signup = signupData => dispatch => {
    auth.createUserWithEmailAndPassword(signupData.email, signupData.password).then((data)=>{
        firebase.database().ref('users/' + data.user.uid).set({
            username: signupData.username,
        })
    }).then(user => dispatch(
        {
            type: SIGNUP,
            payload: user
        }
    ))
}

export const checkUser = () => dispatch => {
    auth.onAuthStateChanged(user => dispatch({
        type: CHECK_USER,
        payload: user
    }))
}
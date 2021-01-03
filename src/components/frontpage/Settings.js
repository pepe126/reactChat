import React from 'react'
import { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { logout } from '../../actions/authActions'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux' 
import firebase from "firebase/app";
import "firebase/database";

 function Settings(props) {
    const history = useHistory()
    const [username, setUsername] = useState(''); //username current user
    const [friendRequests, setFriendRequests] = useState([])
    const currentUser = useSelector(state=>state.auth.user)

    useEffect(()=>{
        if(currentUser){
            retrieveUsername()
            retrievRequests()
        }
    },[currentUser])

    function retrieveUsername(){
        var userData = firebase.database().ref('users/' + currentUser.uid)
        userData.on('value', (snapshot) => {
            if(snapshot.val()){
                setUsername(snapshot.val().username)
            }
        })
    }

    async function handleLogout(e){
        e.preventDefault()
        await props.logout()
        history.push('/login')
    }

    function retrievRequests(){
        var requests = firebase.database().ref('users/' + currentUser.uid + '/requests');
        requests.on('value', (snapshot)=>{
            let req = []
            for(var key in snapshot.val()){
                var objReq = {
                    rid: key, //request id
                    username: snapshot.val()[key].username,
                    urid: snapshot.val()[key].userAsking  //user requesting id
                }
                req.push(objReq)
            }
            setFriendRequests(friendRequests => req)
        })
    }

    function handleAddFriend(props){
        var friendsList = firebase.database().ref('users/'+ currentUser.uid+'/friends');
        friendsList.push({friendID: props.urid, friendUsername: props.username}) //aggiunge l'amico che ha fatto la richiesta agli amici del current
        var requesterFriendsList = firebase.database().ref('users/'+ props.urid+'/friends');
        requesterFriendsList.push({friendID: currentUser.uid, friendUsername: username})
        var req = firebase.database().ref('users/'+currentUser.uid+'/requests/'+props.rid)
        req.remove()
        window.location.reload();
    }


    function handleDeclineFriend(props){
        var req = firebase.database().ref('users/'+currentUser.uid+'/requests/'+props.rid)
        req.remove()
        window.location.reload();
    }

    return (
        <div className='col chats m-1 '>
            <h3 className='mt-2'><i className="far fa-user fa-sm"></i> {username}</h3>
            <h5>Friend requests: {friendRequests.length}</h5>
            
            {friendRequests.map(friendRequest => {
                return (
                    <div>
                        {friendRequest.username}
                        <i onClick={()=>handleAddFriend(friendRequest)} className='mx-2 my-3 fas fa-check fa-lg clickable greenIcon'></i>
                        <i onClick={()=>handleDeclineFriend(friendRequest)} className='mx-2 my-3 fas fa-times fa-lg clickable redIcon'></i>
                    </div>
                )
            })}

            <button className='btn redBtn w-100 mt-3' onClick={handleLogout}>Logout</button>
        </div>
    )
}

export default connect(null, {logout})(Settings)
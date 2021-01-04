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
    const [username, setUsername] = useState('');               //username current user
    const [friendRequests, setFriendRequests] = useState([])    //Richieste d'amicizia ricevute
    const currentUser = useSelector(state=>state.auth.user)     //current user da store redux

    //Attende che il current user venga caricato per poi chiamare le funzioni per recuperare l'username
    //e le richieste del current user
    useEffect(()=>{
        if(currentUser){
            retrieveUsername()
            retrievRequests()
        }
    },[currentUser])

    //funzione che recupera dal database l'username del current user
    function retrieveUsername(){
        var userData = firebase.database().ref('users/' + currentUser.uid)
        userData.on('value', (snapshot) => {
            if(snapshot.val()){
                setUsername(snapshot.val().username)
            }
        })
    }

    //funzione per logout (da redux actions)
    async function handleLogout(e){
        e.preventDefault()
        await props.logout()
        history.push('/login')
    }

    //Recupera le richieste d'amicizia arrivate al current user
    function retrievRequests(){
        //richieste da users->currentUser->richieste
        var requests = firebase.database().ref('users/' + currentUser.uid + '/requests');
        requests.on('value', (snapshot)=>{
            let req = [] //array temporaneo per storare le richieste
            for(var key in snapshot.val()){
                //loop delle richieste e creazione di un oggetto per ognuna di esse
                var objReq = {
                    rid: key, //request id
                    username: snapshot.val()[key].username, //user requesting username
                    urid: snapshot.val()[key].userAsking  //user requesting id
                }
                //oggetto viene pushato nell'array temporaneo
                req.push(objReq)
            }
            //array temporaneo viene pushato nello stato
            setFriendRequests(friendRequests => req)
        })
    }

    //funzione che controlla l'accettazione di una richiesta d'amicizia
    //prop-> arriva da stato friendRequests, la cui struttura degli oggetti è descritta nella funzione retrievRequests
    function handleAddFriend(props){
        //ref agli amici del current user users->currentuser->friends
        var friendsList = firebase.database().ref('users/'+ currentUser.uid+'/friends');
        friendsList.push({friendID: props.urid, friendUsername: props.username})                //aggiunge l'amico che ha fatto la richiesta agli amici del current
        //ref agli amici dell'utente che sta chiedendo
        var requesterFriendsList = firebase.database().ref('users/'+ props.urid+'/friends');
        requesterFriendsList.push({friendID: currentUser.uid, friendUsername: username})        //aggiunge il current user agli amici del richiedente
        //ref alla richiesta
        var req = firebase.database().ref('users/'+currentUser.uid+'/requests/'+props.rid)
        req.remove() //rimozione della richiesta
        window.location.reload();
    }

    //Funzione che controlla il rifiuto della richiesta
    //stesso prop di handleAddFriend
    function handleDeclineFriend(props){
        //ref alla richiesta 
        var req = firebase.database().ref('users/'+currentUser.uid+'/requests/'+props.rid)
        //rimozione della richiesta
        req.remove()
        window.location.reload();
    }

    return (
        <div className='col chats m-1 '>
            <h3 className='mt-2'><i className="far fa-user fa-sm"></i> {username}</h3>
            <h5>Friend requests: {friendRequests.length}</h5>
            {/*map attraverso le richieste retriviati al caricamento del component */}
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
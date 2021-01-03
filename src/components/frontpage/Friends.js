import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux' 
import firebase from "firebase/app";
import "firebase/database";

export default function Friends() {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([])
    const [username, setUsername] = useState(''); //current user id
    const currentUser = useSelector(state=>state.auth.user)
    const [friendList, setFriendList] = useState([])
    const [chats, setChats] = useState([]) //amici che hanno già una chat con current

    useEffect(()=>{
        retrieveUsername()
        retrieveFriends()
        retrieveChats()
        if(search){
            handleSearch()
        }
    },[search, currentUser])

    //retrieve current use id
    function retrieveUsername(){
        var userData = firebase.database().ref('users/' + currentUser.uid)
        userData.on('value', (snapshot) => {
            if(snapshot.val()){
                setUsername(snapshot.val().username)
            }
        })
    }

    function handleSearch(){
        var users = firebase.database().ref('users/');
        users.on('value', (snapshot) => {
            let results = []
            for(var key in snapshot.val()){
                if(snapshot.val().hasOwnProperty(key)){
                    if(snapshot.val()[key].username.includes(search)){
                        var match = {
                            uid: key,
                            username: snapshot.val()[key].username,
                            requests: snapshot.val()[key].requests,
                            friends: snapshot.val()[key].friends
                        }
                        results.push(match)
                    }
                }
            }
            setSearchResults(searchResults => results)
        })
    }

    function retrieveFriends(){
        var friends = firebase.database().ref('users/'+ currentUser.uid + '/friends')
        let frnd = []
        friends.on('value', (snapshot)=>{
            for(var key in snapshot.val()){
                var currentFriend = {
                    id: snapshot.val()[key].friendID,
                    username: snapshot.val()[key].friendUsername
                }
                frnd.push(currentFriend)
            }
            setFriendList(friendList => frnd)
        })
    }

    function retrieveChats(){
        var chats = firebase.database().ref('chats/')
        chats.on('value', (snapshot)=>{
            let chatsTemp = []
            for(var key in snapshot.val()){
                if(currentUser.uid === snapshot.val()[key].user1){
                    chatsTemp.push(snapshot.val()[key].user2)
                } else if(currentUser.uid === snapshot.val()[key].user2){
                    chatsTemp.push(snapshot.val()[key].user1)
                }
            }
            setChats(chats=>chatsTemp)
        })
    }

    function handleChange(e){
        setSearch(e.target.value)
    }

    function handleAdd(props){
        var user = firebase.database().ref('users/'+ props.uid +'/requests/');
        user.push({
            userAsking: currentUser.uid, 
            username: username
        })
    }

    function newChat(props){
        var chats = firebase.database().ref('/chats/')
        chats.push({
            user1: currentUser.uid, 
            user2: props.id,
            user1username: username,
            user2username: props.username
        })
    }
    
    return (
        <div className='col chats m-1'>
            
            <form className='mt-4 d-flex justify-content-center'>
                <input  placeholder='Search friends...' type='text' className='w-75 searchFriends' value={search} onChange={handleChange} />
            </form>
            {/*visualizza lista amici quando non si sta effettuando una ricerca */}
            {!search && <h2 className='mx-auto mt-3'> <i className="far fa-address-book fa-sm"> </i> Friends List</h2>}
            {!search && friendList && friendList.map(friend=>{
                var isChatting = false
                chats.map(chat=>{
                    if(chat === friend.id){
                        isChatting=true
                    } 
                })
                if(isChatting){
                    return <p className='mx-auto my-3'>{friend.username} <i className="greenIcon fas fa-comments fa-lg"></i></p>
                }else{
                    return <p className='mx-auto my-3'>{friend.username} <i onClick={()=>newChat(friend)} className='far fa-comments fa-lg clickable'></i></p>
                }
            })}
            {/*Visualizza ricerca onChange dell'input */}
            {search && searchResults.map(result => {
                if(result.username !== username){
                    for(var key in result.requests){
                        if(result.requests[key].userAsking === currentUser.uid){
                            //return in caso si sia inviata la richiesta all'utente
                            return(
                                <div className='m-2'>
                                    <p >
                                        {result.username} <i className="greenIcon fas fa-paper-plane fa-lg"></i>
                                    </p>
                                </div>

                            )
                        }
                    }
                    for(var key in result.friends){
                        var isFriend = false
                        friendList.map(friend=>{
                            if(friend.id === result.uid){
                                isFriend = true
                                
                            }
                        })
                        if(isFriend){
                            //return in caso l'utente sia già amico
                            return(
                            <div className='m-2'>
                                <p>
                                    {result.username} <i className="greenIcon far fa-handshake fa-lg"></i>
                                </p>
                            </div>
                        )}
                    }
                    //return normale con possibilità di aggiungere agli amici
                    return (
                        <div  className='m-2'>
                            <p >
                                {result.username} <i onClick={()=>handleAdd(result)} className="greenIcon clickable far fa-paper-plane fa-lg"></i>
                            </p>
                        </div>
                    )
                }
            })}
        </div>
    )
}

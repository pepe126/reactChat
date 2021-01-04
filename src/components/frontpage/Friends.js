import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux' 
import firebase from "firebase/app";
import "firebase/database";

export default function Friends() {
    const [search, setSearch] = useState('');               //ricerca che viene settata onchange dell'input
    const [searchResults, setSearchResults] = useState([])  //risultati della ricerca
    const [username, setUsername] = useState('');           //current user username
    const currentUser = useSelector(state=>state.auth.user) //current user dallo store redux
    const [friendList, setFriendList] = useState([])        //lista degli amici
    const [chats, setChats] = useState([])                  //amici che hanno già una chat con current

    //useEffect triggerato quando avviene una ricerca
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

    //viene chiamata questa funzione nell'useEffect quando è presente una ricerca
    function handleSearch(){
        //ref degli utenti nel db, visto che la ricerca avviene per username
        var users = firebase.database().ref('users/');
        users.on('value', (snapshot) => {
            let results = [] //array temporaneo dei risultati
            //loop atraverso tutti gli utenti
            for(var key in snapshot.val()){
                if(snapshot.val().hasOwnProperty(key)){
                    //si controlla se l'username dell'utente che si sta controllando includa la ricerca
                    if(snapshot.val()[key].username.includes(search)){
                        //in caso si salva l'utente trovato in un oggetto temporaneo
                        var match = {
                            uid: key,                               //id del risultato
                            username: snapshot.val()[key].username, //username del risultato
                            requests: snapshot.val()[key].requests, //richieste del risultato (per controllare se la richiesta è già stata inviata)
                            friends: snapshot.val()[key].friends    //amici del risultato (per controllare se è già amico di current user)
                        }
                        //l'oggetto viene pushato nell'array temporaneo
                        results.push(match)
                    }
                }
            }
            //l'array temporaneo viene passato come stato
            setSearchResults(searchResults => results)
        })
    }

    //funzione per caricare gli utenti già amici
    function retrieveFriends(){
        //ref agli amici del current user
        var friends = firebase.database().ref('users/'+ currentUser.uid + '/friends')
        let frnd = [] //array temporaneo degli amici del current user
        friends.on('value', (snapshot)=>{
            //loop attraverso gli amici
            for(var key in snapshot.val()){
                //oggetto temporanto che rappresenta l'amico
                var currentFriend = {
                    id: snapshot.val()[key].friendID,               //id dell'amico
                    username: snapshot.val()[key].friendUsername    //username dell'amico
                }
                //push dell'oggetto temporaneo nell'array temporaneo
                frnd.push(currentFriend)
            }
            //setto lo stato con l'array temporaneo degli amici
            setFriendList(friendList => frnd)
        })
    }

    //Funzione per recuperare le chat
    function retrieveChats(){
        //ref alle chat nel db
        var chats = firebase.database().ref('chats/')
        chats.on('value', (snapshot)=>{
            let chatsTemp = [] //array temporaneo per le chat
            //ogni chat ha: un id(key della chat), user1 e user2, che sarebbero gli utenti che stanno chattanto, i loro usernames e un array di messaggi
            for(var key in snapshot.val()){
                //se l'id del current user corrisponde all'id di uno dei due utenti della chat, vuol dire che la chat gli appartiene
                //Viene pushato nell'array temporano l'id dell'utente con il quale il current user sta chattanto
                if(currentUser.uid === snapshot.val()[key].user1){
                    chatsTemp.push(snapshot.val()[key].user2)
                } else if(currentUser.uid === snapshot.val()[key].user2){
                    chatsTemp.push(snapshot.val()[key].user1)
                }
            }
            //gli utenti con i quali il current user sta chattando vengono quindi storati nello stato chats
            setChats(chats=>chatsTemp)
        })
    }

    //funzione per settare lo stato search col valore dell'input. questo triggera l'useEffect ^
    function handleChange(e){
        setSearch(e.target.value)
    }

    //funzione per mandare richiesta di amicizia (add friend)
    function handleAdd(props){
        //ref alle richieste del target
        var user = firebase.database().ref('users/'+ props.uid +'/requests/');
        //push della richiesta nel db
        user.push({
            userAsking: currentUser.uid, //current user id
            username: username           //current user username
        })
    }

    //funzione per avviare chat con amico
    function newChat(props){
        //ref alle chat
        var chats = firebase.database().ref('/chats/')
        //push della nuova chat
        chats.push({
            //ids e usernames dei due utenti
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
                //si setta una variabile booleana usata per vedere se l'utente e l'amico stiano già chattando
                var isChatting = false
                chats.map(chat=>{
                    //se l'id dell'amico corrisponde a uno degli id salvati nello stato chat --> i due stanno chattando --> non si deve poter avviare un'altra chat
                    if(chat === friend.id){
                        isChatting=true
                    } 
                })
                if(isChatting){
                    //return se i due stanno chattando (nessuna funzione onClick)
                    return <p className='mx-auto my-3'>{friend.username} <i className="greenIcon fas fa-comments fa-lg"></i></p>
                }else{
                    //return se i due non stanno chattando (possibilità di avviare una nuova chat onClick)
                    return <p className='mx-auto my-3'>{friend.username} <i onClick={()=>newChat(friend)} className='far fa-comments fa-lg clickable'></i></p>
                }
            })}
            {/*Visualizza ricerca onChange dell'input */}
            {search && searchResults.map(result => {
                //si esclude il current user dai risultati della ricerca
                if(result.username !== username){
                    for(var key in result.requests){
                        //check per vedere se il current user ha già inviato la richiesta al target
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
                    //check se l'utente sia già amico del current user
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

import React, { useEffect, useState, useRef} from 'react'
import { useSelector } from 'react-redux' 
import firebase from "firebase/app";
import "firebase/database";


export default function Chats() {
    const [chats, setChats] = useState([])                  //chat del current user
    const [isChatting, setIsChatting] = useState(false)     //stato per determinare se si devono visualizzare le chats
    const [currentChat, setCurrentChat] = useState({})      //stato che rappresenta la chat aperta dal current user
    const [messages, setMessages] = useState([])            //messaggi della currentChat
    const [username, setUsername] = useState('');           //username current user
    const textRef = useRef()                                //testo del messaggio che l'utente ha scritto
    const currentUser = useSelector(state=>state.auth.user) //current user da store redux

    //useEffect triggerato ogni volta che si apre/chiude una chat
    useEffect(()=>{
        retrieveUsername()
        retrieveCurrentUserChats()
        if(isChatting){
            retrieveMessages()
        }
    },[currentUser, isChatting])

    //funzione per recuperare le chat del current user
    function retrieveCurrentUserChats(){
        //ref ale chats
        var chatsRef = firebase.database().ref('chats')
        chatsRef.on('value', (snapshot)=>{
            let chatsTemp = []  //array temporaneo per le chat
            //loop attraverso le chat nel db
            for(var key in snapshot.val()){
                //check se il current user è coinvolto nella chat come user1 o user2
                //se l'utente è coinvolto viene pushato nell'array temporaneo un oggetto che rappresenta la chat
                if(snapshot.val()[key].user1 === currentUser.uid ){
                    chatsTemp.push({
                        chatKey: key,                                       //id della chat
                        friendID: snapshot.val()[key].user2,                //id dell'amico con cui si sta chattando
                        friendUsername: snapshot.val()[key].user2username   //username dell'amico con cui si sta chattando
                    })
                } else if(snapshot.val()[key].user2 === currentUser.uid){
                    chatsTemp.push({
                        chatKey: key,
                        friendID: snapshot.val()[key].user1,
                        friendUsername: snapshot.val()[key].user1username
                    })
                }
            }
            //si pusha l'array temp nello stato chats
            setChats(chats=>chatsTemp)
        })
    }

    //funzione per recuperare l'username del current user
    function retrieveUsername(){
        var userData = firebase.database().ref('users/' + currentUser.uid)
        userData.on('value', (snapshot) => {
            if(snapshot.val()){
                setUsername(snapshot.val().username)
            }
        })
    }

    //funzione triggerata dell'apertura di una chat, prende come props la chat aperta
    function openChat(props){
        //si setta lo stato "isChatting" su true per visualizzazione corretta degli elementi
        setIsChatting(true)
        //si setta la currentChat con gli attributi dalla chat aperta
        setCurrentChat({
            idFriendChatting: props.friendID,
            chatID: props.chatKey,
            usernameFriendChatting: props.friendUsername
        })
    }

    //funzione per caricare i messaggi
    function retrieveMessages(){
        //ref alla chat aperta (salvata quindi nello stato currentChat illustrato nella funzione qua sopra ^)
        var messages = firebase.database().ref('chats/'+ currentChat.chatID+'/msgs')
        messages.on('value', (snapshot)=>{
            if(snapshot.val()){
                let msgsTemp = []    //array temporaneo per salvare i messaggi
                for(var key in snapshot.val()){
                    //ogni messaggio ha un suo id (key)
                    //si crea quindi un oggetto per ogni messaggio con il contenuto di esso e chi l'ha inviato
                    var messaggio = {
                        content: snapshot.val()[key].msg,       //contenuto del messaggio
                        sender: snapshot.val()[key].sender,     //username di chi ha mandato il messaggio
                        senderID: snapshot.val()[key].senderID  //id di chi ha mandato il messaggio
                    }
                    //si pusha il messaggio nell'array temporaneo
                    msgsTemp.push(messaggio)
                }
                //si pusha l'array temporaneo nello stato messages
                setMessages(messages=>msgsTemp)
            }
        })
    }

    //Funzione per mandare un messaggio on submit del campo di testo
    async function sendMessage(e){
        //prevent default forse non necessario visto la rimozione del bottone ma funziona quindi ok così, non toccare per ora
        e.preventDefault()
        //si salva il testo del messaggio
        var messaggio = textRef.current.value
        //si svuota il campo di input
        textRef.current.value = ''
        //ref alla chat aperta
        var messages = firebase.database().ref('chats/'+ currentChat.chatID+'/msgs')
        //si pusha il nuovo messaggio nella chat nel db
        await messages.push({
            msg: messaggio,
            sender: username,
            senderID: currentUser.uid
        })
        //update scroll per tenere la chat sempre sull'ultimo messaggio
        updateScroll()
    }

    //funzione per chiudere la current chat e tornare alle chats del current user
    function goBack(){
        //pulizia stati
        setIsChatting(false)
        setMessages([])
    }

    //funzione per cancellare una chat, prende come prop la chat in questione
    function deleteChat(props){
        //ref alla chat stessa e rimozione di essa
        var chat = firebase.database().ref('chats/'+props.chatKey)
        chat.remove()
    }

    //funzione per scrollare, tiene la chat sull'ultimo messaggio all'apertura di essa o quando viene inviato un nuovo messaggio
    function updateScroll(){
        var element = document.getElementById("chat");
        element.scrollTop = element.scrollHeight;
    }

    return (
        <div className='col-6 chats m-2'>
            <h2  className='mx-auto mt-3'><i class="far fa-comments"></i> CHATS</h2>
            {chats && !isChatting && chats.map(chat=>{
                //return delle chats se non si sta chattando
                return (
                    <div className='chatContainer' >
                        <div onClick={()=>openChat(chat)} className='card alreadyChatting w-100 mt-2'>
                            <p className='mx-auto my-2'>{chat.friendUsername}</p>
                        </div>
                        <button onClick={()=>deleteChat(chat)} className='btn redBtn circularBtn mt-2'><i class="far fa-trash-alt"></i></button>
                    </div>
                    
                )
            })}
            {/*Return se si sta chattando, con nome dell'amico con cui si sta chattando */}
                {isChatting && <h5 className = 'm-3'> <i onClick={goBack} class="backBtn fas fa-arrow-circle-left fa-lg"></i> {currentChat.usernameFriendChatting}</h5>}
            {/*chat box dove verranno visualizzati i messaggi */}
            <div className='msgsBox' id='chat'>
                {isChatting && messages.map(msg => {
                    //map attraverso i messaggi retriviati all'apertura della chat
                    if(msg.senderID === currentUser.uid){
                        //return se il current user ha mandato il messaggio (messaggio a destra, di colore #BB86FC)
                        return(
                            <div className='d-flex justify-content-end'>
                                <p className='msg-sender'>{msg.content}</p>
                            </div>
                        )
                    } else {
                        //return se il current user ha ricevuto il messaggio (messaggio a destra, di colore #3700B3)
                        return(
                            <div className='d-flex justify-content-start'>
                                <p className='msg-receiver'>{msg.content}</p>
                            </div>
                        )
                    }
                })
                }
            </div>
            {/*display del form di input per inviare i messaggi se si sta chattando con qualcuno */}
                {isChatting && <form onSubmit={sendMessage} className= 'row  mb-3 d-flex justify-content-center chatinput w-100'>
                    <input placeholder='message...' type='submit' ref={textRef} type='text' className='w-75 messageInput'/>
                </form>}
            
        </div>
    )
}

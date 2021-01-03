import React, { useEffect, useState, useRef} from 'react'
import { useSelector } from 'react-redux' 
import firebase from "firebase/app";
import "firebase/database";


export default function Chats() {
    const [chats, setChats] = useState([])
    const [isChatting, setIsChatting] = useState(false)
    const [currentChat, setCurrentChat] = useState({})
    const [messages, setMessages] = useState([])
    const [username, setUsername] = useState(''); //username current user
    const textRef = useRef()
    const currentUser = useSelector(state=>state.auth.user)

    useEffect(()=>{
        retrieveUsername()
        retrieveCurrentUserChats()
        if(isChatting){
            retrieveMessages()
        }
    },[currentUser, isChatting])

    function retrieveCurrentUserChats(){
        var chatsRef = firebase.database().ref('chats')
        chatsRef.on('value', (snapshot)=>{
            let chatsTemp = []
            for(var key in snapshot.val()){
                if(snapshot.val()[key].user1 === currentUser.uid ){
                    chatsTemp.push({
                        chatKey: key,
                        friendID: snapshot.val()[key].user2,
                        friendUsername: snapshot.val()[key].user2username
                    })
                } else if(snapshot.val()[key].user2 === currentUser.uid){
                    chatsTemp.push({
                        chatKey: key,
                        friendID: snapshot.val()[key].user1,
                        friendUsername: snapshot.val()[key].user1username
                    })
                }
            }
            setChats(chats=>chatsTemp)
        })
    }

    function retrieveUsername(){
        var userData = firebase.database().ref('users/' + currentUser.uid)
        userData.on('value', (snapshot) => {
            if(snapshot.val()){
                setUsername(snapshot.val().username)
            }
        })
    }

    function openChat(props){
        setIsChatting(true)
        setCurrentChat({
            idFriendChatting: props.friendID,
            chatID: props.chatKey,
            usernameFriendChatting: props.friendUsername
        })
    }

    function retrieveMessages(){
        var messages = firebase.database().ref('chats/'+ currentChat.chatID+'/msgs')
        messages.on('value', (snapshot)=>{
            if(snapshot.val()){
                let msgsTemp = []
                for(var key in snapshot.val()){
                    var messaggio = {
                        content: snapshot.val()[key].msg,
                        sender: snapshot.val()[key].sender,
                        senderID: snapshot.val()[key].senderID
                    }
                    msgsTemp.push(messaggio)
                }
                setMessages(messages=>msgsTemp)
            }
        })
    }

    async function sendMessage(e){
        e.preventDefault()
        var messaggio = textRef.current.value
        textRef.current.value = ''
        var messages = firebase.database().ref('chats/'+ currentChat.chatID+'/msgs')
        await messages.push({
            msg: messaggio,
            sender: username,
            senderID: currentUser.uid
        })
        updateScroll()
    }
    function goBack(){
        setIsChatting(false)
    }
    function deleteChat(props){
        var chat = firebase.database().ref('chats/'+props.chatKey)
        chat.remove()
        window.location.reload();
    }

    function updateScroll(){
        var element = document.getElementById("chat");
        element.scrollTop = element.scrollHeight;
    }

    return (
        <div className='col-6 chats m-2'>
            <h2  className='mx-auto mt-3'><i class="far fa-comments"></i> CHATS</h2>
            {chats && !isChatting && chats.map(chat=>{
                return (
                    <div className='chatContainer' >
                        <div onClick={()=>openChat(chat)} className='card alreadyChatting w-100 mt-2'>
                            <p className='mx-auto my-2'>{chat.friendUsername}</p>
                        </div>
                        <button onClick={()=>deleteChat(chat)} className='btn redBtn circularBtn mt-2'><i class="far fa-trash-alt"></i></button>
                    </div>
                    
                )
            })}
                {isChatting && <h5 className = 'm-3'> <i onClick={goBack} class="backBtn fas fa-arrow-circle-left fa-lg"></i> {currentChat.usernameFriendChatting}</h5>}
            <div className='msgsBox' id='chat'>
                {isChatting && messages.map(msg => {
                    if(msg.senderID === currentUser.uid){
                        return(
                            <div className='d-flex justify-content-end'>
                                <p className='msg-sender'>{msg.content}</p>
                            </div>
                        )
                    } else {
                        return(
                            <div className='d-flex justify-content-start'>
                                <p className='msg-receiver'>{msg.content}</p>
                            </div>
                        )
                    }
                })
                }
            </div>
                {isChatting && <form onSubmit={sendMessage} className= 'row  mb-3 d-flex justify-content-center chatinput w-100'>
                    <input placeholder='message...' type='submit' ref={textRef} type='text' className='w-75 messageInput'/>
                </form>}
            
        </div>
    )
}

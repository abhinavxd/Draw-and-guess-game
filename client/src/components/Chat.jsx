import "./../css/chat.css";
import { Fragment, useEffect, useRef } from "react";
const Chat = (props) => {

    const chatScrollDiv = useRef();
    const scrollToBottom = () => {
        if (chatScrollDiv.current) {
            console.log('scroll down!!');
            chatScrollDiv.current.scrollTo(
                0,
                chatScrollDiv.current.scrollHeight
            );
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [props.chatMessages]);

    return (
        <Fragment>
            <div className="chats" ref={chatScrollDiv}>
                {props.chatMessages.length > 0 ? (props.chatMessages.map((item, index) => (
                    <p key={index}>{item}</p>
                ))) :
                    ("")
                }
            </div>
            <form id="chatInput" onSubmit={props.handleNewMessage}>
                <input onChange={props.handleChangeMessage} value={props.inputBarText} className="form-control" id="inputChat" autoComplete="off" type="text" placeholder="Type your guess here.." maxLength="100" />
            </form>
            <div ></div>
        </Fragment>
    )
}

export default Chat;
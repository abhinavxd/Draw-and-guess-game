// import "./../css/chat.css";
import { Fragment, useEffect, useRef } from "react";
const Chat = (props) => {
    const chatScrollDiv = useRef();

    /**
     * Fn to scroll chat div to bottom
     */
    const scrollToBottom = () => {
        if (chatScrollDiv.current) {
            chatScrollDiv.current.scrollTo(
                0,
                chatScrollDiv.current.scrollHeight
            );
        }
    };

    /**
     * Call scrollToBottom function on every new message
     */
    useEffect(() => {
        scrollToBottom();
    }, [props.chatMessages]);

    return (
        <Fragment>
            <div className="chats overflow-y-auto h-80 mb-4" ref={chatScrollDiv}>
                {!!props.chatMessages.length && (props.chatMessages.map((item, index) => (
                    <p key={index}>{item}</p>
                )))}
            </div>
            <form id="chatInput" onSubmit={props.handleNewMessage}>
                <input onChange={props.handleChangeMessage} value={props.inputBarText} className="form-control" id="inputChat" autoComplete="off" type="text" placeholder="Type your guess here.." maxLength="100" />
            </form>
            <div ></div>
        </Fragment>
    )
}

export default Chat;
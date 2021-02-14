import "./../css/chat.css";
import { Fragment, useState, useRef, useEffect } from "react";
const Chat = (props) => {
    let inputField = useRef(null);

    const [chatMessages, setChatMessages] = useState([]);

    const [inputBarText, setInputBarText] = useState("");

    const handleNewMessage = (e) => {
        e.preventDefault();
        props.soc.current.emit('new_message', { 'msg': inputBarText });
        setInputBarText("");
    };

    useEffect(() => {
        if (props.soc.current) {
            props.soc.current.on('new_message', (data) => {
                setChatMessages((prevState) => {
                    let newState = [...prevState];
                    let inputMessage = data.msg;
                    newState.push(inputMessage);
                    return newState;
                });
            });
        }

    }, [props.soc.current])


    const handleChangeMessage = (e) => {
        setInputBarText(e.target.value)
    }

    return (
        <Fragment>
            <div className="chats">
                {chatMessages.length > 0 ? (chatMessages.map((item) => (
                    <p key={Math.floor(Math.random() * 1000) + 1}>{item}</p>
                ))) :
                    ("")
                }
            </div>
            <form id="chatInput" onSubmit={handleNewMessage}>
                <input ref={inputField} onChange={handleChangeMessage} value={inputBarText} className="form-control" id="inputChat" autoComplete="off" type="text" placeholder="Type your guess here.." maxLength="100" />
            </form>
        </Fragment>
    )
}

export default Chat;
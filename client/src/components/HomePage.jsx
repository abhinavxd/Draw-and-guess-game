import "../css/homePage.css";
import Header from "./Header";
import { useState, useRef } from "react";
import PlayArea from "./PlayArea";

const HomePage = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [roomId, setGameRoomId] = useState(undefined);
    const [playerName, setCurrPlayerName] = useState(undefined);
    const [action, setAction] = useState('create');
    const [joinRoom, setJoinRoom] = useState(false);
    const playerRoomId = useRef(undefined)
    const playerNameRef = useRef(undefined);

    /**
     * Handler to start game and socket connection
     */
    const startGameHandler = () => {
        if (playerRoomId.current && playerRoomId.current.value) {
            setGameRoomId(playerRoomId.current.value);
            setAction('join')
        }
        setCurrPlayerName(playerNameRef.current.value);
        setGameStarted(true);
    };

    /**
     * Show/hide input for room-id
     */
    const showJoinRoomInput = () => {
        setJoinRoom(!joinRoom);
    };
    return (
        <div className='container-fluid'>
            <Header />
            {!gameStarted ?
                <div id="menu-container" >
                    <div style={{ marginBottom: '0.8em' }}>
                        <h1>Draw and guess!</h1>
                    </div>
                    <div>
                        <label>
                            Enter your username
                            <input type="text" required='true' ref={playerNameRef}></input>
                        </label>
                    </div>
                    <div>
                        <label>
                            <span style={{ marginRight: 10 }}>Have room-id?</span>
                            <input style={{ padding: 10 }} onClick={showJoinRoomInput} type='checkbox' ></input>
                        </label>
                    </div>
                    {joinRoom && <div>
                        <label>
                            Enter your friends room id
                        <input type="text" name="room-id" ref={playerRoomId} id="player-room-id" />
                        </label>
                    </div>}
                    <button type='button' className='btn btn-success' onClick={startGameHandler}>Play</button>
                    <h5>{process.env.REACT_APP_VER}</h5>
                </div> : <PlayArea roomId={roomId} playerName={playerName} action={action} />}
        </div>
    );
}

export default HomePage;

import "../css/homePage.css";
import Header from "./Header";
import { useState, useRef } from "react";
import PlayArea from "./PlayArea";

const HomePage = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [roomId, setGameRoomId] = useState(undefined);
    const [playerName, setCurrPlayerName] = useState(undefined);
    const [action, setAction] = useState('create');
    const playerRoomId = useRef(undefined)
    const playerNameRef = useRef(undefined);
    const startGameHandler = () => {
        if (playerRoomId.current.value) {
            setGameRoomId(playerRoomId.current.value);
            setAction('join')
        }
        setCurrPlayerName(playerNameRef.current.value);
        setGameStarted(true);
    };
    return (
        <div className='container-fluid'>
            <Header />
            {!gameStarted ?
                <div id="menu-container" >
                    <div className='color-white'>
                        <h1>Welcome!</h1>
                    </div>
                    <div>
                        <input type="text" placeholder='Enter your name' ref={playerNameRef}></input>
                    </div>
                    <div>
                        <input type="text" placeholder='Enter your room id' name="room-id" ref={playerRoomId} id="player-room-id" />
                    </div>
                    <br></br>
                    <button type='button' className='btn btn-success' onClick={startGameHandler}>Play</button>
                </div> : <PlayArea roomId={roomId} playerName={playerName} action={action} />}
        </div>
    );
}

export default HomePage;

import styles from "../css/homePage.module.css";
import { useState, useEffect } from "react";
import PlayArea from "./PlayArea";

const HomePage = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [action, setAction] = useState('create');
    const [joinRoom, setJoinRoom] = useState(false);
    const [error, setError] = useState(false);
    const [playerRoomId, setPlayerRoomId] = useState(undefined)
    const [playerName, setPlayerName] = useState('');

    /**
     * Handler to start game and socket connection
     */
    const startGameHandler = () => {
        if (playerName.length === 0) {
            setError(true);
            return;
        }
        if (playerRoomId) {
            setAction('join')
        }
        setGameStarted(true);
    };

    useEffect(() => {
        const playerRoomFromURL = window.location.pathname.replace("/", "").trim();
        if (playerRoomFromURL.length > 0) {
            setPlayerRoomId(playerRoomFromURL)
            setJoinRoom(true)
        }
    }, [])

    /**
     * Show/hide input for room-id
     */
    const showJoinRoomInput = () => {
        setJoinRoom(!joinRoom);
    };
    return (
        <div className={styles.appContainer}>
            {!gameStarted ?
                <div id={styles.menuContainer} >
                    <div style={{ marginBottom: '0.8em' }}>
                        <h1>Draw and guess!</h1>
                    </div>
                    <div>
                        <label>
                            Enter your username
                            <input type="text" required={true} onChange={(e) => setPlayerName(e.target.value)} ></input>
                        </label>
                        {error && <p className={styles.warn}>Please enter username</p>}
                    </div>
                    <div>
                        <label>
                            <span style={{
                                position: 'relative', top: -1,
                                right: 10
                            }}>Have room-id?</span>
                            <input style={{ padding: 10 }} onChange={showJoinRoomInput} type='checkbox' checked={joinRoom}></input>
                        </label>
                    </div>
                    {joinRoom && <div>
                        <label>
                            Enter your friends room id
                            <input type="text" name="room-id" id="player-room-id" onChange={(e) => setPlayerRoomId(e.target.value)} value={playerRoomId} />
                        </label>
                    </div>}
                    <button type='button' className='btn btn-success' onClick={startGameHandler}>Play</button>
                    <div className={styles.howToPlay}>
                        <h5>
                            How to play?
                        </h5>
                        <span>
                            <div style={{ marginBottom: 15 }}>
                                You need atleast two players to play this game.
                            </div>
                            When its your turn to draw, you will have to visualize the word and draw it in 90 seconds,
                            alternatively when somebody else is drawing you have to type your
                            guess into the chat to gain points.
                        </span>
                    </div>
                </div> : <PlayArea roomId={playerRoomId} playerName={playerName} action={action} />}
        </div>
    );
}

export default HomePage;

// import "../css/homePage.css";
import { useState, useRef } from "react";
import PlayArea from "./PlayArea";

const HomePage = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [roomId, setGameRoomId] = useState(undefined);
    const [playerName, setCurrPlayerName] = useState(undefined);
    const [action, setAction] = useState('create');
    const [joinRoom, setJoinRoom] = useState(false);
    const [error, setError] = useState(false);

    // Input refs
    const playerRoomId = useRef(undefined)
    const playerNameRef = useRef(undefined);

    /**
     * Handler to start game and socket connection
     */
    const startGameHandler = () => {
        if (playerNameRef.current.value.length === 0) {
            setError(true);
            return;
        }
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
        <div className='container'>
            {!gameStarted ?
                <div className="mt-5"> 
                    <div style={{ marginBottom: '0.8em' }}>
                    <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        {/* <span class="block xl:inline">Data to enrich your</span> */}
                        <span class="block text-indigo-600 xl:inline">Draw and guess!s</span>
                    </h1>
                    </div>

                    <div class="w-full max-w-sm">
                        <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Username
                        </label>
                        <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" placeholder="jenny" ref={playerNameRef} />
                        {error && <p className='warn'>Please enter username</p>}
                        </div>

                        <div class="mb-4" >
                        <label class="md:w-2/3 block text-gray-500 font-bold">
                            <input class="mr-2 leading-tight" type="checkbox" onClick={showJoinRoomInput} />
                            <span class="text-sm">
                                Have friend's room-id ?
                            </span>
                            </label>
                        </div>

                        { joinRoom && <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                                Room Id
                        </label>
                        <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-password" type="text" name="room-id" ref={playerRoomId} id="player-room-id" placeholder="asdf53b723rh9bs9d" />
                        </div> }

                        <div class="mb-4">
                        <button class="shadow bg-indigo-500 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button" onClick={startGameHandler} >
                            Lest Play!
                        </button>
                        </div>

                    </div>

                    <div className="homepage-about">
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
                </div> : <PlayArea roomId={roomId} playerName={playerName} action={action} />}
        </div>
    );
}

export default HomePage;

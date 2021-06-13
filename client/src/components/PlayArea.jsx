import { io } from 'socket.io-client';
import { useCallback, useEffect, useRef, useState } from "react";
// import "../css/playArea.css";
import Chat from "./Chat";
import PlayerList from './PlayerList';
import TopGameHeader from './TopGameHeader';
import { STROKE_COLOUR, STROKE_SIZE } from "../utils/Constants";
import IO from "../utils/SocketConnection";

const PlayArea = (props) => {
    // Game state
    const [curGameId, setGameId] = useState(undefined);
    const [currentWord, setCurrentWord] = useState(undefined);
    const [showNewWordOverlay, setshowNewWordOverlay] = useState(false);
    const [playersList, setPlayersList] = useState([]);
    const [scoreBoard, setScoreBoard] = useState([]);
    const [showScoreBoard, setShowScoreBoard] = useState(false);
    const [isGameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    // State to store word which was selected in previous round
    const [roundEndWord, setRoundEndWord] = useState(undefined);

    // Chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [inputBarText, setInputBarText] = useState("");

    let soc = useRef(null);
    let isCurrentPlayersTurn = useRef(false);
    let w = useRef(800);
    let h = useRef(600);
    let canvas = useRef();
    let ctx = useRef();
    let flag = useRef(false);
    let prevX = useRef(0);
    let currX = useRef(0);
    let prevY = useRef(0);
    let currY = useRef(0);
    let dot_flag = useRef(false);

    /**
     * Stoke colour and Size
     */
    let x = useRef(STROKE_COLOUR);
    let y = useRef(STROKE_SIZE);

    const findxy = useCallback((res, e) => {
        if (!isCurrentPlayersTurn.current) {
            return;
        }
        if (res === 'down') {
            prevX.current = currX.current;
            prevY.current = currY.current;

            currX.current = e.clientX - canvas.current.offsetLeft;
            currY.current = e.clientY - canvas.current.offsetTop;

            flag.current = true;
            dot_flag.current = true;
            if (dot_flag.current) {
                ctx.current.beginPath();
                ctx.current.fillStyle = x.current;
                ctx.current.fillRect(currX.current, currY.current, 2, 2);
                ctx.current.closePath();
                dot_flag.current = false;
            }
        }
        if (res === 'up' || res === "out") {
            flag.current = false;
        }
        if (res === 'move') {
            if (flag.current) {
                prevX.current = currX.current;
                prevY.current = currY.current;
                currX.current = e.clientX - canvas.current.offsetLeft;
                currY.current = e.clientY - canvas.current.offsetTop;
                soc.current.emit('cords', { x: currX.current, y: currY.current, prevX: prevX.current, prevY: prevY.current });
                draw();
            }
        }
    }, []);

    const init = useCallback(() => {
        canvas.current = document.getElementById('can');
        ctx.current = document.getElementById('can').getContext("2d");
        canvas.current.addEventListener("mousemove", function (e) {
            findxy('move', e)
        }, false);
        canvas.current.addEventListener("mousedown", function (e) {
            findxy('down', e)
        }, false);
        canvas.current.addEventListener("mouseup", function (e) {
            findxy('up', e)
        }, false);
        canvas.current.addEventListener("mouseout", function (e) {
            findxy('out', e)
        }, false);
    }, [findxy]);

    const draw = () => {
        ctx.current.beginPath();
        ctx.current.moveTo(prevX.current, prevY.current);
        ctx.current.lineTo(currX.current, currY.current);
        ctx.current.strokeStyle = x.current;
        ctx.current.lineWidth = y.current;
        ctx.current.stroke();
        ctx.current.closePath();
    }

    /**
     * Clear canvas drawings
     */
    const erase = () => {
        ctx.current.clearRect(0, 0, w.current, h.current);
    }

    /**
     * Emit erase event to all sockets in this room
     */
    const emitErase = () => {
        soc.current.emit('erase');
        erase();
    };

    useEffect(() => {
        // initialize canvas
        init();
        // create socket connection
        soc.current = IO(props.playerName, props.roomId, props.action)

        /**
         * Listen to Socket events
         */
        soc.current.on('new-word', (data) => {
            if (soc.current.id === data.to_socket_id) {
                isCurrentPlayersTurn.current = true;
            }
            setCurrentWord(data.word);
            setShowScoreBoard(false)
            setshowNewWordOverlay(true)
        });
        soc.current.on('hidden-word', (data) => {
            setCurrentWord(data.word);
        });
        soc.current.on('current-turn', (data) => {
            console.log('Current turn ', data.username);
            isCurrentPlayersTurn.current = false;
            setChatMessages([]);
        });
        soc.current.on('round-over', (data) => {
            setRoundEndWord(data.cur_word)
            setScoreBoard(data.clients);
            setShowScoreBoard(true);
        });
        soc.current.on('cords', (data) => {
            currX.current = data.x;
            currY.current = data.y;
            prevX.current = data.prevX;
            prevY.current = data.prevY;
            draw();
        });
        soc.current.on('erase', () => {
            erase();
        });
        soc.current.on('client-list', (data) => {
            setPlayersList(data.clients)
            if (!gameStarted && data.clients.length >= 2) {
                setGameStarted(true);
            }
        });
        soc.current.on('clear-board-and-current-word', (data) => {
            erase()
            setCurrentWord(undefined);
        });
        soc.current.on('game-over', (data) => {
            setGameOver(true);
            setShowScoreBoard(true);
            setScoreBoard(data.clients);
        });
        soc.current.on('room-id', (data) => {
            setGameId(data.id);
        });
        soc.current.on('new_message', (data) => {
            setChatMessages((prevState) => {
                let newState = [...prevState];
                let inputMessage = data.msg;
                newState.push(inputMessage);
                return newState;
            });
        });
        soc.current.on('correct-answer', data => {
            setChatMessages((prevState) => {
                let newState = [...prevState];
                let inputMessage = data.username;
                inputMessage += " has guessed the word! 🙌 ";
                newState.push(inputMessage);
                return newState;
            });
        });
        soc.current.on('system-message', data => {
            setChatMessages((prevState) => {
                let newState = [...prevState];
                let inputMessage = data.msg
                newState.push(inputMessage);
                return newState;
            });
        });
    }, [init, props.playerName, props.roomId, props.action]);

    const hideOverlay = () => {
        setshowNewWordOverlay(false)
        setShowScoreBoard(false)
    };

    const handleNewMessage = (e) => {
        e.preventDefault();
        soc.current.emit('new_message', { 'msg': inputBarText });
        setInputBarText("");
    };

    const handleChangeMessage = (e) => {
        setInputBarText(e.target.value)
    }

    return (
        <div className='mt-5'>
            {showNewWordOverlay && <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-4 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {currentWord}
                                    </h3>
                                    {/* <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            ----some drawing hints ----  ----some drawing hints ----  ----some drawing hints ----  ----some drawing hints ----
                                        </p>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button onClick={hideOverlay} type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" Name>
                                Let draw and break the canvas!
                            </button>
                        </div>
                    </div>
                </div>
            </div>}
            {showScoreBoard &&
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-4 pb-4 sm:p-6 sm:pb-4">
                                <div className="">
                                    <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left">
                                        <h2 className="text-3xl leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                            The word was <span className="underline">{roundEndWord}</span>
                                        </h2>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            {!isGameOver ? 'Round over' : 'Game over final score board'}
                                        </h3>
                                        <div className="mt-3 grid grid-cols-3 gap-2">
                                            {scoreBoard.map((client, index) => (
                                                <p key={`pop-${index}`} className="text-left mb-0">
                                                    {
                                                        isGameOver
                                                            ? (<span> {index + 1})  {client.username} : {client.score} </span>)
                                                            : (<span> {client.username} : {client.score} </span>)
                                                    }
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button onClick={hideOverlay} type="button" class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" Name>
                                    Let play again!
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            }
            <TopGameHeader gameId={curGameId} currentWord={currentWord} gameStarted={gameStarted} />
            <div className="grid grid-cols-5 mt-3">
                <div id='playerList' className=" p-3 rounded-xl bg-indigo-100 border-indigo-200 border-4">
                    <PlayerList players={playersList} />
                </div>
                <div id='containerCanvas' className="col-span-3 block rounded-xl border-indigo-200 border-4 bg-indigo-100 mx-3 bg-opacity-20">
                    <canvas height={400} width={625} id={'can'} />
                </div>
                <div id="chatContainer" className="p-2 rounded-xl bg-indigo-100 border-indigo-200 border-4 h-full">
                    <Chat chatMessages={chatMessages} inputBarText={inputBarText} handleNewMessage={handleNewMessage} handleChangeMessage={handleChangeMessage}
                    />
                </div>
            </div >
            {isCurrentPlayersTurn.current === true &&
                <div className='flex justify-center mt-3'>
                    <div class="inline-flex rounded-md shadow">
                        <a href="#" onClick={emitErase} class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        Erase and give another shot...
                        </a>
                    </div>
                    {/* <button type='button' className='btn btn-success' onClick={emitErase}>Erase</button> */}
                </div>
            }
        </div>
    );
}

export default PlayArea;

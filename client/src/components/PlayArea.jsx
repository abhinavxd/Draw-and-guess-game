import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../css/playArea.module.css";
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
            setTimeout(() => {
                setshowNewWordOverlay(false)
            }, 3000);
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
            setTimeout(() => {
                setShowScoreBoard(false);
            }, 3000);
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
            setRoundEndWord(data.cur_word);
            setGameOver(true);
            setShowScoreBoard(true);
            setScoreBoard(data.clients);
            setTimeout(() => {
                setShowScoreBoard(false);
            }, 30000);
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
                inputMessage += " has guessed the word!";
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


    const handleNewMessage = (e) => {
        e.preventDefault();
        soc.current.emit('new_message', { 'msg': inputBarText });
        setInputBarText("");
    };

    const handleChangeMessage = (e) => {
        setInputBarText(e.target.value)
    }

    return (
        <div className={styles.gameScreen}>
            {showNewWordOverlay && <div className={styles.overlayContainer}>
                <div className={styles.overlayContent}>
                    <div>
                        Current Word:
                    </div>
                    <div>
                        {currentWord}
                    </div>
                </div>
            </div>}
            {showScoreBoard && <div className={styles.overlayContainer}>
                <div className={styles.overlayContent}>
                    <div>
                        <div>
                            {`The word was ${roundEndWord}`}
                        </div>
                        <div>
                            {!isGameOver ? 'Round over' : 'Game over final score board'}
                        </div>
                        {scoreBoard.map((client, index) => (
                            <div key={index}>
                                {isGameOver ? (
                                    <div>
                                        #{index + 1} {client.username} : {client.score}
                                    </div>
                                ) : (
                                    <div>
                                        {client.username} : {client.score}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>}
            <TopGameHeader gameId={curGameId} currentWord={currentWord} gameStarted={gameStarted} />
            < div className={styles.parentContainer}>
                <div id={styles.playerList}>
                    <PlayerList players={playersList} />
                </div>
                <div id={styles.containerCanvas}>
                    <canvas width={800} height={600} id={'can'} style={{border: '1px solid',
    backgroundColor: 'white'}}/>
                </div>
                <div id={styles.chatContainer}>
                    <Chat chatMessages={chatMessages} inputBarText={inputBarText} handleNewMessage={handleNewMessage} handleChangeMessage={handleChangeMessage}
                    />
                </div>
            </div >
            {isCurrentPlayersTurn.current === true &&
                <div>
                    <button type='button' className='btn btn-success' onClick={emitErase}>Erase</button>
                </div>
            }
        </div>
    );
}

export default PlayArea;

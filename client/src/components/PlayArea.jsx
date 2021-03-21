import { io } from 'socket.io-client';
import { useCallback, useEffect, useRef, useState } from "react";
import "../css/playArea.css";
import Chat from "./Chat";
import PlayerList from './PlayerList';
import TopGameHeader from './TopGameHeader';

const PlayArea = (props) => {
    const [curGameId, setGameId] = useState(undefined);
    const [currentWord, setCurrentWord] = useState(undefined);
    const [showNewWordOverlay, setshowNewWordOverlay] = useState(false);
    const [playersList, setPlayersList] = useState([]);
    const [scoreBoard, setScoreBoard] = useState([]);
    const [showScoreBoard, setShowScoreBoard] = useState(false);
    const [isGameOver, setGameOver] = useState(false);

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

    let x = useRef("black");
    let y = useRef(3);



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

    const erase = () => {
        ctx.current.clearRect(0, 0, w.current, h.current);
    }

    useEffect(() => {
        init();
        soc.current = io(process.env.REACT_APP_API_URL, {
            query: {
                username: props.playerName,
                roomId: props.roomId,
                action: props.action
            }
        });
        soc.current.on('new-word', (data) => {
            if (soc.current.id === data.to_socket_id) {
                console.log('My turn!')
                isCurrentPlayersTurn.current = true;
            }
            setCurrentWord(data.word);
            setShowScoreBoard(false)
            setshowNewWordOverlay(true)
        });
        soc.current.on('current-turn', (data) => {
            console.log('Current turn ', data.username);
            isCurrentPlayersTurn.current = false;
            setChatMessages([]);
        });
        soc.current.on('round-over', (data) => {
            setScoreBoard(data.clients);
            setShowScoreBoard(true);
            setshowNewWordOverlay(false);
        });
    }, [init, props.playerName, props.roomId, props.action]);

    useEffect(() => {
        if (soc.current) {
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
            soc.current.on('newGameCreated', (data) => {
                setGameId(data.gameId);
            });
            soc.current.on('client-list', (data) => {
                setPlayersList(data.clients)
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
        }
    }, [soc])

    useEffect(() => {
        if (props.roomId && props.roomId.length > 0) {
            soc.current.emit("playerJoinGame", { gameId: props.roomId })
            setGameId(props.roomId);
        } else {
            soc.current.on('newGameCreated', (data) => {
                setGameId(data.gameId);
            });
        }
    }, [props.roomId]);

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
        <div className='gameScreen'>
            {showNewWordOverlay && <div className='overlay-container'>
                <div className='overlay-content'>
                    <i onClick={hideOverlay} className='fas fa-times close-overlay'></i>
                    <div>
                        Current Word:
                    </div>
                    <div>
                        {currentWord}
                    </div>
                </div>
            </div>}
            {showScoreBoard && <div className='overlay-container'>
                <div className='overlay-content'>
                    <i onClick={hideOverlay} className='fas fa-times close-overlay'></i>
                    <div>
                        <div>
                            SCORE BOARD
                        </div>
                        {scoreBoard.map((client, index) => (
                            <div key={index}>
                                {isGameOver ? (
                                    <div>
                                        {index + 1} {client.username} : {client.score}
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
            <TopGameHeader gameId={curGameId} currentWord={currentWord} />
            < div className="parentContainer">
                <div id='playerList'>
                    <PlayerList players={playersList} />
                </div>
                <div id='containerCanvas'>
                    <canvas width={800} height={600} id={'can'} />
                </div>
                <div id="chatContainer">
                    <Chat chatMessages={chatMessages} inputBarText={inputBarText} handleNewMessage={handleNewMessage} handleChangeMessage={handleChangeMessage}
                    />
                </div>
                {/* <div className='containerToolBar'>
                    <button onClick={erase}>Erase</button>
                </div> */}
            </div >
        </div>
    );
}

export default PlayArea;

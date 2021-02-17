import { io } from 'socket.io-client';
import { useCallback, useEffect, useRef } from "react";
import "../css/playArea.css";
import Chat from "./Chat";
import PlayerList from './PlayerList';
import TopGameHeader from './TopGameHeader';

const PlayArea = () => {

    let soc = useRef(null);
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

    const color = (obj) => {
        switch (obj.id) {
            case "green":
                x = "green";
                break;
            case "blue":
                x = "blue";
                break;
            case "red":
                x = "red";
                break;
            case "yellow":
                x = "yellow";
                break;
            case "orange":
                x = "orange";
                break;
            case "black":
                x = "black";
                break;
            case "white":
                x = "white";
                break;
            default:

        }
        if (x === "white") y = 14;
        else y = 2;

    }

    function draw() {
        ctx.current.beginPath();
        ctx.current.moveTo(prevX.current, prevY.current);
        ctx.current.lineTo(currX.current, currY.current);
        ctx.current.strokeStyle = x.current;
        ctx.current.lineWidth = y.current;
        ctx.current.stroke();
        ctx.current.closePath();
    }

    function erase() {
        ctx.current.clearRect(0, 0, w.current, h.current);
        soc.current.emit('erase');
    }

    useEffect(() => {
        init();
        soc.current = io(process.env.REACT_APP_API_URL);
    }, [init]);

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

        }
    }, [soc])

    useEffect(() => {
        if (soc.current) {
            soc.current.on('cords', (data) => {
                currX.current = data.x;
                currY.current = data.y;
                draw();
            });
        }

    }, [soc])

    return (
        <div className='gameScreen'>
            <TopGameHeader />
            <div className="parentContainer">
                <div id='playerList'>
                    <PlayerList />
                </div>
                <div id='containerCanvas'>
                    <canvas width={800} height={600} id={'can'} />
                </div>
                <div id="chatContainer">
                    <Chat soc={soc} />
                </div>
                {/* <div className='containerToolBar'>
                    <button onClick={erase}>Erase</button>
                </div> */}
            </div >
        </div>
    );
}

export default PlayArea;

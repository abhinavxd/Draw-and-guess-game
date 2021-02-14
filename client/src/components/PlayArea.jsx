import { io } from 'socket.io-client';
import { useEffect, useRef } from "react";
import "../css/playArea.css";

const PlayArea = () => {

    let soc = useRef(null);

    var w = 800;
    var h = 600;
    var canvas, ctx, flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;

    var x = "black",
        y = 4;

    function init() {
        canvas = document.getElementById('can');
        ctx = canvas.getContext("2d");

        canvas.addEventListener("mousemove", function (e) {
            findxy('move', e)
        }, false);
        canvas.addEventListener("mousedown", function (e) {
            findxy('down', e)
        }, false);
        canvas.addEventListener("mouseup", function (e) {
            findxy('up', e)
        }, false);
        canvas.addEventListener("mouseout", function (e) {
            findxy('out', e)
        }, false);
    }

    function color(obj) {
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
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = x;
        ctx.lineWidth = y;
        ctx.stroke();
        ctx.closePath();
    }

    function erase() {
        ctx.clearRect(0, 0, w, h);
        soc.current.emit('erase');
    }

    function findxy(res, e) {
        if (res === 'down') {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;

            flag = true;
            dot_flag = true;
            if (dot_flag) {
                ctx.beginPath();
                ctx.fillStyle = x;
                ctx.fillRect(currX, currY, 2, 2);
                ctx.closePath();
                dot_flag = false;
            }
        }
        if (res === 'up' || res === "out") {
            flag = false;
        }
        if (res === 'move') {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop;
                soc.current.emit('cords', { x: currX, y: currY, prevX: prevX, prevY: prevY });
                draw();
            }
        }
    }

    useEffect(() => {
        init();
        soc.current = io(process.env.REACT_APP_API_URL);
    }, []);

    useEffect(() => {
        if (soc.current) {
            soc.current.on('cords', (data) => {
                currX = data.x;
                currY = data.y;
                prevX = data.prevX;
                prevY = data.prevY;
                draw();
            });
            soc.current.on('erase', () => {
                erase();
            });
        }
    }, [soc])

    useEffect(() => {
        if (soc.current) {
            soc.current.on('connect', () => {
                console.log(soc.current.id);
            });
            soc.current.on('cords', (data) => {
                currX = data.x;
                currY = data.y;
                draw();
            });
        }

    }, [soc.current])


    return (
        <div>
            <div>
                <canvas width={800} height={600} id={'can'} >
                </canvas>
            </div>
            <div>
                <button onClick={erase}>Erase</button>
            </div>
        </div >
    );
}

export default PlayArea;

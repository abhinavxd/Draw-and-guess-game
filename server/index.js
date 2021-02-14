const express = require('express');
const app = express();
require('dotenv').config();

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});

const server = app.listen(process.env.PORT);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.on('connection', socket => {
    console.log("User connected with id " + socket.id);
    socket.on('cords', (data) => {
        socket.broadcast.emit('cords', { x: data.x, y: data.y, prevX: data.prevX, prevY: data.prevY });
    });
    socket.on('erase', (data) => {
        socket.emit('erase');
    });
    socket.on('new_message', (data) => {
        socket.broadcast.emit('new_message', { msg: data.msg });
    });
});

const express = require('express');
const app = express();
require('dotenv').config();

app.get("/", (req, res) => {
    res.send("Hello world!");
});

const server = app.listen(process.env.PORT);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET"]
    }
});

io.on('connection', socket => {
    console.log("User connected with id " + socket.id);
});


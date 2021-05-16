require('dotenv').config();
const consola = require("consola");
const express = require('express');
const http = require('http');
const socket = require('./util/socket');

const app = express();
const ioServer = new http.createServer(app);
socket.init(ioServer);

app.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});

/**
 * To check if service is alive or not
 */
app.get("/ping", (req, res) => {
    res.send("pong");
});

ioServer.listen(process.env.PORT, () => {
    consola.success(`Listening for sockets on port ${process.env.PORT}`)
});
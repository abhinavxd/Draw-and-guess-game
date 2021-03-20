const { Server } = require("socket.io");
const consola = require('consola');
const gameManager = require('./gameManager');
const redis = require("redis");
const redisClient = redis.createClient();

exports.init = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    console.log("Init socket ");
    io.on('connection', socket => {
        consola.info("Socket connected  with " + socket.id);
        let { username, roomId, action } = socket.handshake.query;
        console.info(`Current socket query params  ${username}  ${roomId} ${action}`)
        const room = new gameManager.Room({ io, socket, username, roomId, action })
        room.init(username);
        room.listenCords();
        room.listenToMessages();
        room.onDisconnect();
    });

}

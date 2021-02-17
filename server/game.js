let io;
let gameSocket;
exports.initGame = (io_, socket) => {
    io = io_;
    gameSocket = socket;

    // server events
    // gameSocket.on('createNewGame', hostCreateNewGame);
    // gameSocket.on('hostRoomFull', hostCreateNewGame);
    // gameSocket.on('hostCountDownFinished', hostCreateNewGame);
    // gameSocket.on('hostNextRound', hostCreateNewGame);

    gameSocket.on('cords', handlePlayerCoordinates);
    gameSocket.on('new_message', handleNewMessage);
    // gameSocket.on('erase', handlePlayerEraseAction);
}

const handlePlayerCoordinates = (data) => {
    gameSocket.broadcast.emit('cords', { x: data.x, y: data.y, prevX: data.prevX, prevY: data.prevY });
}

const handleNewMessage = (data) => {
    io.sockets.emit('new_message', { msg: data.msg });
};
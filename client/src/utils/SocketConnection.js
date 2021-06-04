import { io } from 'socket.io-client';

const IO = (playerName, roomId, action) => {
    return io(process.env.REACT_APP_API_URL, {
        path: process.env.REACT_APP_SOCKET_PATH + '/socket.io',
        query: {
            username: playerName,
            roomId: roomId,
            action: action
        }
    });
}
export default IO;
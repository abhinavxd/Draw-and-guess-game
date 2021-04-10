// TODO:: USE PROMISES INSTEAD OF CALLBACKS
// Node Redis currently doesn't natively support promises
// Wrap the methods with promises using built-in-Node.js util.promisify

const redis = require("redis");
const redisClient = redis.createClient();
const crypto = require("crypto");
const words = require('../data/words.json');

redisClient.on("error", function (error) {
    consola.error("Redis client connection failure " + error);
});

const MAX_ROUNDS_PER_MATCH = 10
let nextTimerIndex = 0
let timerMap = {}

/**
 * Class for managing game rooms and room related events
 */
exports.Room = class {
    constructor(options) {
        this.io = options.io;
        this.socket = options.socket;
        this.username = options.username;
        this.roomId = options.roomId;
        this.action = options.action;
    }

    /**
     * Main game loop for starting rounds and sending game-over event 
     * 
     * @param {Object} roomState 
     */
    gameLoop = (roomState) => {
        redisClient.get(roomState.game_state.room_id, async (err, reply) => {
            if (err) {
                consola.error(`err fetching ${roomState.game_state.room_id} values ${err}`);
            }
            const updatedState = JSON.parse(reply);
            consola.success('Rounds -> ', updatedState.game_state.round_no, "  ", updatedState.game_state.max_rounds);
            // Set has_guessed_word to false for all clients for fresh round
            for (let index = 0; index < updatedState.clients.length; index++) {
                updatedState.clients[index].has_guessed_word = false;
            }
            // CHECK if game is over or not and send game-over event if the game's over
            if (updatedState.game_state.round_no >= updatedState.game_state.max_rounds) {
                this.io.in(`${roomState.game_state.room_id}`).emit('game-over', { clients: updatedState.clients })
                redisClient.del(updatedState.game_state.room_id)
            } else {
                redisClient.set(this.roomId, JSON.stringify(updatedState), async (err, reply) => {
                    if (err) {
                        consola.error(`Error in setting value in redis! ${err}`)
                        return;
                    }
                    if (updatedState.game_state.round_no > 0)
                        this.io.in(`${roomState.game_state.room_id}`).emit('round-over', { clients: updatedState.clients })

                    // Wait for 5 seconds before starting a round
                    await new Promise(resolve => setTimeout(resolve, 5000))
                    this.broadcastAllConnectedClients(updatedState);
                    this.shiftTurns(updatedState)
                    let timeoutId = setTimeout(this.gameLoop, 60000, updatedState)
                    timerMap[nextTimerIndex] = timeoutId;
                    updatedState.game_state.timeout_id = nextTimerIndex
                    nextTimerIndex++;
                    redisClient.set(this.roomId, JSON.stringify(updatedState), (err, reply) => {
                        if (err) {
                            consola.error(`Error in setting value in redis ${err}`)
                            return;
                        }
                    });
                });
            }
        })
    }

    /**
     * Starts the game if there are more than 2 players connected
     */
    startGame = () => {
        redisClient.get(this.roomId, (err, reply) => {
            if (err) {
                consola.error(`err fetching ${this.roomId} values ${err}`);
                return;
            }
            let roomState = JSON.parse(reply)
            this.broadcastRoomId(this.roomId);
            if (roomState) {
                if (roomState.clients.length > 1 && roomState.game_state.game_started === false) {
                    consola.success(`Starting game ${this.roomId} more than 1 client connected`)
                    let timeoutId = setTimeout(this.gameLoop, 1000, roomState)
                    timerMap[nextTimerIndex] = timeoutId;
                    roomState.game_state.timeout_id = nextTimerIndex
                    nextTimerIndex++;
                    redisClient.set(this.roomId, JSON.stringify(roomState), (err, reply) => {
                        if (err) {
                            consola.error(`Error in setting key in redis! ${err}`)
                            return;
                        }
                    });
                } else {
                    consola.info('Not enough players');
                }
            }
        });
    }

    /**
     * Emit room id to all clients in this room
     * 
     * @param {String} roomId
     */
    broadcastRoomId = (roomId) => {
        this.io.in(roomId).emit('room-id', { id: roomId });
    };

    /**
     * Listen to canvas erase event and emit this to all clients in this room
     */
    listenToErase = () => {
        this.socket.on('erase', () => {
            this.socket.to(this.roomId).emit('erase');
        });
    }

    /**
     * Shift turns evenly between players
     * 
     * @param {Object} roomState 
     */
    shiftTurns = (roomState) => {
        // Select player with minimum play_count
        if (!roomState.clients || roomState.clients.length === 0) {
            return;
        }
        let selectedPlayer = roomState.clients.reduce(function (prev, curr) {
            return prev.play_count < curr.play_count ? prev : curr;
        });
        consola.success('Current player ', selectedPlayer);
        const wordListFromDb = words['words']
        // Now get words selected previous in this game
        // And select a word which has not been selected previously
        const consumedWords = roomState.game_state.consumed_words
        const unconsumedWords = wordListFromDb.filter(word => !consumedWords.includes(word))
        // Pick a random word
        const selectedWord = unconsumedWords[Math.floor(Math.random() * unconsumedWords.length)];
        consola.info('Selected word ', selectedWord)
        roomState.game_state.consumed_words.push(selectedWord)
        roomState.game_state.round_no = Number(roomState.game_state.round_no) + 1
        roomState.game_state.game_started = true;
        roomState.game_state.current_word = selectedWord;
        roomState.game_state.current_player = selectedPlayer.socket_id;
        for (let index = 0; index < roomState.clients.length; index++) {
            if (roomState.clients[index].socket_id === selectedPlayer.socket_id) {
                roomState.clients[index].play_count = Number(roomState.clients[index].play_count) + 1
            }
        }
        // Now update to redis and emit new word
        redisClient.set(roomState.game_state.room_id, JSON.stringify(roomState), (err, reply) => {
            if (err) {
                consola.error(`Error redis set ${err}`)
            }
            this.io.to(roomState.game_state.room_id).emit('clear-board-and-current-word');
            this.io.to(roomState.game_state.room_id).emit('current-turn', { username: selectedPlayer.username })
            // replace every alphabet in the string with underscore for players which are not drawing
            this.io.to(roomState.game_state.room_id).emit('hidden-word', { word: selectedWord.replace(/[a-z]/g, '_') })
            this.io.to(selectedPlayer.socket_id).emit('new-word', { word: selectedWord, to_socket_id: selectedPlayer.socket_id })
            this.io.in(roomState.game_state.room_id).emit('system-message', { msg: `${selectedPlayer.username} is drawing` })
        });
    }

    /**
     * Initialises steps on first connection 
     * 1. Creates a new room if it's a create request and joins the socket to the room
     * 2. Joins socket to room if it's a join request
     *
     * @access  public
     */
    init = async () => {
        if (this.action === 'join') {
            await this.socket.join(this.roomId);
            redisClient.get(this.roomId, (err, reply) => {
                if (err) {
                    consola.error(`Error in GET for ${this.roomId}`)
                }
                if (reply) {
                    let roomState = JSON.parse(reply);
                    roomState.clients.push({
                        socket_id: this.socket.id,
                        username: this.username,
                        score: 0,
                        play_count: 0,
                        has_guessed_word: false
                    })
                    redisClient.set(this.roomId, JSON.stringify(roomState), (err, reply) => {
                        if (err) {
                            consola.error(err);
                            return false;
                        }
                        this.broadcastAllConnectedClients(roomState);
                        consola.info(`Joined room ${this.roomId} . REPLY ${reply}`);
                        this.startGame();
                    });
                }
            });
        }

        if (this.action === 'create') {
            // Generate room id
            this.roomId = crypto.randomBytes(10).toString('hex');
            await this.socket.join(String(this.roomId));
            const roomState = {
                game_state: {
                    room_id: this.roomId,
                    round_no: 0,
                    max_rounds: MAX_ROUNDS_PER_MATCH,
                    consumed_words: [],
                    game_started: false,
                    current_word: '',
                    current_player: '',
                    timeout_id: undefined
                },
                clients: [
                    {
                        socket_id: this.socket.id,
                        username: this.username,
                        score: 0,
                        play_count: 0,
                        has_guessed_word: false
                    }
                ]
            }
            redisClient.SETNX(this.roomId, JSON.stringify(roomState), (err, reply) => {
                if (err) {
                    consola.error(`Error redis SETNX ${err}`);
                }
                consola.info(`REPLY from SETNX ${reply}`);
                this.broadcastAllConnectedClients(roomState);
            });
            this.socket.username = this.username;
            this.broadcastRoomId(this.roomId);
            consola.info(`[CREATE] Client created and joined room ${this.roomId}`);
        }
    }

    /**
     * Listen to draw coordinates and emit them to all clients in room
     */
    listenCords = () => {
        this.socket.on('cords', (data) => {
            this.socket.broadcast.to(this.roomId).emit('cords', { x: data.x, y: data.y, prevX: data.prevX, prevY: data.prevY });
        });
    }

    /**
     * Listen to messages and broadcast them to all clients
     */
    listenToMessages = () => {
        this.socket.on('new_message', (data) => {
            redisClient.get(this.roomId, (err, reply) => {
                if (err) {
                    consola.error(`Error fetching room data ${this.roomId}`)
                }
                if (reply) {
                    let roomState = JSON.parse(reply);
                    let current_word = roomState.game_state.current_word;
                    // The player drawing should not be allowed to send messages!
                    if (this.socket.id === roomState.game_state.current_player) {
                        consola.info(`player drawing is trying to send a message`)
                        return;
                    }
                    // if this player has already guessed then the player should not be allowed to send messages
                    let curClientIndex = roomState.clients.findIndex(client => client.socket_id === this.socket.id)
                    if (roomState.clients[curClientIndex].has_guessed_word) {
                        consola.info(`Player has already guessed`)
                        return;
                    }
                    // If the guess is correct do not emit the message
                    // Instead emit `Player X has guessed the word`
                    if (current_word === data.msg && current_word !== undefined) {
                        let currentClientIndex = roomState.clients.findIndex(client => client.socket_id === this.socket.id)
                        // if this user has guessed word in this round do not emit message
                        if (roomState.clients[currentClientIndex].has_guessed_word) {
                            return;
                        }
                        roomState.clients[currentClientIndex].score = Number(roomState.clients[currentClientIndex].score) + 1
                        roomState.clients[currentClientIndex].has_guessed_word = true;
                        this.io.in(this.roomId).emit('correct-answer', { username: this.username })

                        let haveAllPlayersGuessed = true;
                        for (let index = 0; index < roomState.clients.length; index++) {
                            // Now check if all players have guessed a word except the current player drawing
                            // if yes then clear the timeout
                            if (roomState.clients[index].has_guessed_word === false && roomState.clients[index].socket_id !== roomState.game_state.current_player) {
                                haveAllPlayersGuessed = false;
                                break;
                            }
                        }
                        redisClient.set(roomState.game_state.room_id, JSON.stringify(roomState), (err, reply) => {
                            if (err) {
                                consola.error(`Error setting key in redis!`);
                                return;
                            }
                            if (haveAllPlayersGuessed) {
                                clearTimeout(timerMap[roomState.game_state.timeout_id])
                                consola.success('Clearing timeout ', roomState.game_state.timeout_id)
                                this.broadcastAllConnectedClients(roomState);
                                setTimeout(this.gameLoop, 5000, roomState)
                            }
                            consola.success(`HAVE ALL PLAYERS GUESSED `, haveAllPlayersGuessed)
                        });
                    } else {
                        // Incorrect guess emit the message
                        data.msg = this.username + ": " + data.msg
                        this.io.in(this.roomId).emit('new_message', { msg: data.msg })
                    }
                }
            });
        });
    }

    /**
     * Remove socket from redis on disconnect
     */
    onDisconnect = () => {
        this.socket.on('disconnect', () => {
            redisClient.get(this.roomId, (err, reply) => {
                if (err) {
                    consola.error(`Some error fetching ${this.roomId} from redis ${err}`)
                }
                if (reply) {
                    let roomData = JSON.parse(reply);
                    let clients = roomData.clients.filter(socket => socket.socket_id != this.socket.id);
                    roomData.clients = clients;
                    redisClient.set(this.roomId, JSON.stringify(roomData), (err, reply) => {
                        if (err) {
                            consola.err(`Error setting key val ${err}`);
                        }
                        consola.success(`Removed client from redis ${this.socket.id}`)
                    })
                }
            });
        });
    }

    /**
     * Broadcast all connected clients to all clients in a room
     * This function is in between every round to remove any clients that might have left the game
     * 
     * @param {Object} roomState 
     */
    broadcastAllConnectedClients = (roomState) => {
        this.io.in(roomState.game_state.room_id).emit('client-list', { clients: roomState.clients });
    };
};
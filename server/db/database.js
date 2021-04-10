const mongoose = require('mongoose');
const consola = require('consola');
require('dotenv').config();

// TODO:: Fetch words from database instead of file -> ../data/words.json 
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('connected', () => {
    consola.success('Mongo db connection establised');
});

db.on('error', err => {
    consola.warn(`Mongo db connection error : ${err}`);
});

db.on('disconnected', () => {
    consola.warn('Disconnected to mongo db server');
});
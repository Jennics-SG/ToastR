// Connects to the database
const mongoose = require('mongoose');
const colours = require('../consoleColours');

module.exports.connect = () => {
    // Set up default conn
    const mongoDB = "mongodb+srv://jennics:ToastR-password@cluster0.yaepyc6.mongodb.net/ToastR-Scoreboard"
    mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

    const db = mongoose.connection;

    db.on('error', console.error.bind(console, "MongoDB Connection Error:"));
    db.once('open', () => {
        console.log(colours.foregroud.green, "Database Connection Established")
    });
}
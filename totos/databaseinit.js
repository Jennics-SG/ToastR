const mongoose = require('mongoose');

module.exports.connect = () => {
    // Set up default conn
    const mongoDB = "mongodb://127.0.0.1/my_database"
    mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

    const db = mongoose.connection;

    db.on('error', console.error.bind(console, "MongoDB Connection Error:"))
}
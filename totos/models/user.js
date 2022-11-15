const mongoose = require('mongoose');

// Define schema
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        min: [3, "not enough letters"],
        max: 15,
        required: [true, "why no toast?"]
    },
    score: {
        type: Number,
        required: true,
    }
})

module.exports = mongoose.model("user", userSchema)
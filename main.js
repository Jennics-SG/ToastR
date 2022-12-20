const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');

const routes = require('./totos/router')
const database = require('./totos/database');
const bodyParser = require('body-parser');

// Initialise server and variables
const init = () => {
    this.app = express();
    this.hostName = "127.0.0.1"
    this.port = 8080;

    // Tell server what view engine to use
    this.app.set('view engine', 'ejs');

    this.app.use(favicon(path.join(__dirname, 'favicon.ico')));

    this.app.use(bodyParser.urlencoded({ extended: false}));
    this.app.use(bodyParser.json());

    server();

}

// Runtime server function
const server = () => {
    database.connect()

    routes(this.app)

    this.app.listen(this.port, () => {
        console.log(
            `Connect too ${this.hostName}:${this.port} to start making toast`
        );
    })
}

init()
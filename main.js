const express = require('express');
const path = require('path');
const fs = require('fs')

// Initialise server and variables
const init = () => {
    this.app = express();
    this.hostName = "127.0.0.1"
    this.port = 8080;

    // Tell server what view engine to use
    this.app.set('view engine', 'ejs');

    server();

}

const server = () => {
    // Listen for activity on root page
    // Serve different site for mobile users

    sendFiles();

    this.app.get('/', (req, res) => {
        console.log('User has connected on Desktop');
        res.render('app');     
    });

    // Send JS file when requested
    this.app.get('/main.js', (req, res) => {
        console.log('Sending main.js')
        res.sendFile(path.join(__dirname, '/dist/main.js'))
    });

    this.app.listen(this.port, () => {
        console.log(`Toasters are hot and ready\nConnect too ${this.hostName}:${this.port} to start making toast`)
    })
}

// Detect if user is on mobile
const isOnMobile = function(string){
    const deviceHeaders =  ["Android",
                            "iPhone",
                            "iPad",
                            "iPod",
                            "BlackBerry",
                            "Windows Phone"]

    for(const str of deviceHeaders){
        if(string.includes(str)){
            return true;
        }
    }
    return false
}

// Send all game assets within ./src/assets folder
const sendFiles = () => {
    const files = fs.readdirSync('./src/assets')

    for(const file of files){
        this.app.get(`/assets/${file}`, (req, res) => {
            res.sendFile(path.join(__dirname, `./src/assets/${file}`));
        });
    }
}

init()
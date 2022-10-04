const express = require('express');
const path = require('path');

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
        switch(isOnMobile(req.headers['user-agent'])){
            case true:
                console.log('User has connected on Mobile');
                res.send('Mobile site pending');
                break;
            case false:
                console.log('User has connected on Desktop');
                res.render('app');
        }
        
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

// Instead of writing out all the files and responses
// Use a for loop and array of files to map the requests
// And responses
const sendFiles = () => {
    const filesJSON = require('./src/files.json')
    const filesArray = filesJSON.files

    for(const file of filesArray){
        this.app.get(`/assets/${file[0]}`, (req, res) => {
            res.sendFile(path.join(__dirname, `./src/assets/${file[1]}`));
        });
    }
}

init()
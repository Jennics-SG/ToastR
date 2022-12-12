//08/10/22

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const fs = require('fs');
const database = require('./totos/database');
const user = require('./totos/models/user');
const colours = require('./consoleColours')
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

const server = () => {
    // Listen for activity on root page
    // Serve different site for mobile users

    database.connect()

    sendFiles();
    sendStatic();

    this.app.get('/', (req, res) => {
        res.redirect('/home');  
    });

    this.app.get('/home', (req, res) => {
        res.render('pages/home');
    })

    this.app.get('/play', (req, res) => {
        res.render('pages/game');
    })

    this.app.get('/scoreboard', (req, res) => {
        user.find({}, (err, vals) => {
            if(err){
                res.send(500, err)
                return;
            }
            
            res.render('pages/scoreboard', {scores: vals});
        }).sort({score: -1}).limit(100)
    });

    this.app.get('/about', (req, res) => {
        res.render('pages/about');
    })

    // Send JS file when requested
    this.app.get('/main.js', (req, res) => {
        res.sendFile(path.join(__dirname, '/dist/main.js'))
    });

    this.app.post('/submitScore', (req, res) => {
        // Get data from body and put it into database
        console.log(colours.foregroud.yellow, 'Score Submission started...');

        const data = {
            name: req.body.name,
            score: req.body.score
        }

        user.find({name: data.name}, (err, vals) => {
            if(err){
                res.send(500, err);
                console.error(err);
                return;
            }

            if(vals[0]){
                console.log(colours.foregroud.red, `    User ${data.name} already exists`);

                if (vals[0].score >= data.score) {
                    console.log(colours.foregroud.red, `    Old score higher, exiting function...`);
                    return;
                }

                console.log(colours.foregroud.yellow, `    New score higher`);

                const person = vals[0]
                person.score = data.score;
                person.save();

                console.log(colours.foregroud.green, `    User ${data.name} new score saved`);
            } else {
                console.log(colours.foregroud.green, `    User ${data.name} is a new entry`);

                const person = new user(data)
                person.save();

                console.log(colours.foregroud.green, `    User ${data.name} saved with score: ${data.score}`)
            }
        })
    })

    this.app.listen(this.port, () => {
        console.log(
            `Connect too ${this.hostName}:${this.port} to start making toast`
        );
    })
}

// Send all files in ./static
const sendStatic = () => {
    const files = fs.readdirSync('./static');

    for (const file of files){
        this.app.get(`/static/${file}`, (req, res) => {
            res.sendFile(path.join(__dirname, `/static/${file}`))
        });
    }
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
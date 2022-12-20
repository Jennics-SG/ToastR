const user = require('./models/user');
const colours = require('../consoleColours')

const path = require('path');
const fs = require('fs');

// Routing for the express application
// App represents the express application
const routes = app => {
    // Home page routes
    app.get('/', (req, res) => {
        res.render('pages/home');
    });
    app.get('/home', (req, res) => {
        res.render('pages/home');
    });

    // Game page route
    app.get('/playNow', (req, res) => {
        res.render('pages/game');
    });

    // Scoreboard
    app.get('/scoreboard', (req, res) => {
        let scores = getScores();

        if(scores instanceof Error){
            res.render('pages/scoreboard', {scores: err});
            return;
        }
        
        res.render('pages/scoreboard', {scores: scores});
    });

    // PWA Files
    app.get('/manifest', (req, res) => {
        res.sendFile(path.join(__dirname, '../manifest.json'));
    });

    app.get('/sw.js', (req, res) => {
        res.sendFile(path.join(__dirname, '../service-worker.js'));
    });

    app.get('/offline', (req, res) => {
        res.render('pages/offline');
    })

    // Game Files
    app.get('/main.js', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/main.js'));
    });

    // Send Static Files
    sendDir('./src/assets', app)
    sendDir('./src/assets/icons', app)
    sendDir('./static/', app);

    // Post score to scoreboard
    app.post('/submitScore', (req, res) => {
        const data = {
            name: req.body.name,
            score: req.body.score
        }

        submitScore(data)
    })
}

// Get top 100 scores from database
const getScores = () => {
    user.find({}, (err, vals) => {
        if(err)
            return err
        
        return vals
    }).sort({score: -1}).limit(100);
}

/** Send all files in directory
 *  this function does NOT read sub-directories 
 * 
 * @param {String} dir Directory 
 */
const sendDir = (dir, app) => {
    if(!dir)
        return;

    const files = fs.readdirSync(dir);

    for(const file of files){
        app.get(`/static/${file}`, (req, res) => {
            res.sendFile(path.join(__dirname, `../${dir}/${file}`));
        });
    }
}

/** Submit score into database if applicable
 *  Will only add scre into database if higher than existing score or if new
 * 
 * @param {object} data Name and score from req.body
 */
const submitScore = (data) => {
    /** Append the score if already exists
     *  Will only append if new score is higher
     * @param {number} oldScore 
     * @param {number} newScore 
     * @param {object} entry    Entry in Database
     *  
     * @returns 
     */
    const appendScore = (oldScore, newScore, entry) => {
        console.log(colours.foregroud.red, `    ${data.name} already exists`)

        if(oldScore >= newScore){
            console.log(colours.foregroud.red, `    Old Score higher, exiting function...`);
            return;
        }

        console.log(colours.foregroud.yellow, `    New Score Higher`);

        const submission = entry;
        submission.score = newScore;
        submission.save();
        
        console.log(colours.foregroud.green, `    New Score Saved`)
    }

    user.find({name: data.name}, (err, vals) => {
        console.log(colours.foregroud.yellow, `[Score Submission] started`)

        if(err){
            console.error(err);
            return;
        }

        if(vals[0]){
            appendScore();
            return;
        }

        const submission = new user(data)
        submission.save()

        console.log(colours.foregroud.green `    ${data.name} saved with score: ${data.score}`);
    });
}

module.exports = routes;
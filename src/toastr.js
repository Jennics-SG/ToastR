/** Name:   ToastR index.js file
 *  Desc:   main file of ToastR, calls all other files and
 *          initialises the application
 *  Author: Jimy Houlbrook
 *  Date:   04/10/22
 */
import * as PIXI from 'pixi.js';
import { WorldManager } from './worldManager.js';
const TWEEN = require('@tweenjs/tween.js');

const toastR = function() {
    // Application to hold the game
    this.app = new PIXI.Application({
        height: 720,
        width: 1280,
        magin: 10,
        backgroundColor: 0x2f9da3
    });

    this.app.ticker.add(animate.bind(this));

    // Game State
    this.gameState = "loading";

    // Loader for game sprites
    const loader = new PIXI.Loader("assets")

    // Canvas to hold game
    const canvas = new PIXI.Container()

    // World Manager for the game
    const worldManger = new WorldManager();
    
    // Initialise the app
    const init = () => {
        // Add app to DOM content
        const div = document.getElementById('game');
        div.appendChild(this.app.view)

        // Load files
        const files = require('./files.json')
        for(const _file of files.files) loader.add(_file[0], _file[1]);

        // Add canvas too game view
        this.app.stage.addChild(canvas);

        /** Loader functions & callbacks
         *  
         *  @callback onProgress: Log progress to console
         *  @callback onError:    Log error to the console
         *  @callback onComplete: change gamestate and runs "main()" function
         *  @function load:       Load files
         */
        loader.onProgress.add(e => { console.log(e.progress); });
        loader.onError.add(function (e) { console.error(`ERR: ${e.message}`); });
        loader.onComplete.add(() => {
            this.gameState = "menu";
            main();
        });
        loader.load();
    }

    // Main function for game
    const main = () => {
        switch(this.gameState){
            case "menu":
                // Load menu
                worldManger.loadWord(this.gameState, loader);

                // Set exit condition
                worldManger.currentWorld.playButton.pointerdown = () => {
                    this.gameState = "game";
                    main()
                }
                break;
            
            case "game":
                // Load game
                worldManger.loadWord(this.gameState, loader, this.app.ticker);
                break;
        }
        canvas.addChild(worldManger.currentWorld);;
    }

    init();
}

function animate(){
    TWEEN.update(this.app.ticker.lastTime);
}

document.addEventListener('DOMContentLoaded', toastR)
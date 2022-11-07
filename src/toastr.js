/** Name:   ToastR index.js file
 *  Desc:   main file of ToastR, calls all other files and
 *          initialises the application
 *  Author: Jimy Houlbrook
 *  Date:   04/10/22
 */
import * as PIXI from 'pixi.js';
import { WorldManager } from './worldManager.js';
import TWEEN from '@tweenjs/tween.js'

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
        // Load the initial files for menu to giev appearance of loading faster 
        const files = require('./files.json')
        for(const _file of files.menuFiles) loader.add(_file[0], _file[1]);

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
            this.worldState = "menu";


            // After loading files for menu, load files for the rest of the game
            this.loadPromise = loadFiles(files, loader);
            this.loadPromise.then(() => {
                this.worldState = "menu"
                this.gameState = "loading_finished"
                main()
            });
            main();
        });
        loader.load();
    }

    const loadFiles = (files, loader) => {
        return new Promise((res, rej) => {
             // Detach listener from onComplete
            loader.onComplete.detachAll();
            for (const file of files.files) loader.add(file[0], file[1]);
            loader.load();
            loader.onComplete.add(res)
        })
    }

    // Main function for game
    const main = () => {
        if(this.gameState != "loading"){
            switch(this.worldState){
                case "menu":
                    // Load menu
                    worldManger.loadWord(this.worldState, loader);

                    // Set exit condition
                    worldManger.currentWorld.playButton.pointerdown = () => {
                        this.worldState = "game";
                        main()
                    }
                    break;
                
                case "game":
                    // Load game
                    worldManger.loadWord(this.worldState, loader, this.app.ticker);
                    break;
            }
        } else{
            worldManger.loadWord(this.gameState, null, null, this.app.view)
        }
        canvas.addChild(worldManger.currentWorld);;
    }

    init();
}

function animate(){
    TWEEN.update(this.app.ticker.lastTime);
}

document.addEventListener('DOMContentLoaded', toastR)
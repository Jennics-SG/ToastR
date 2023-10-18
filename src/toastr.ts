/** Name:   ToastR index.ts file
 *  Desc:   Main file of ToastR, calls all other files
 *          and initisises the application.
 *  Author: Jimy Houlbrook
 *  Date:   21/06/23
 */

/** TODO:
 *  1. World Manager
*/

import * as PIXI from 'pixi.js'

import WorldManager from './worldManager'

export default class ToastR {

    // Application to hold game
    private app : PIXI.Application;

    // World Manager
    private worldManager : WorldManager;

    // Container to hold application
    private canvas : PIXI.Container;

    constructor(){
        this.app = new PIXI.Application<HTMLCanvasElement>({
            height: 720,
            width: 1280,
            backgroundColor: 0x2f9da3,
            //hello: true,
            view: <HTMLCanvasElement>document.getElementById('game')
        });

        this.canvas = new PIXI.Container;
        this.app.stage.addChild(this.canvas);

        this.worldManager = new WorldManager(this.canvas)
        this.worldManager.setGameState("loading");

        this.init();
    }

    async init(){
        // Get files & filepaths
        const files = require('./files.json');


        // Initialise asset loader manifest
        await PIXI.Assets.init({
            manifest: {
                bundles: [
                    {
                        name: 'menuFiles',
                        assets: files.menuFiles
                    },
                    {
                        name: 'gameFiles',
                        assets: files.files
                    }
                ],
            },
        });

        // Load files for menu
        PIXI.Assets.loadBundle('menuFiles').then(() : void => {
            console.log('menu files loaded');

            // Tell world manager to load menu
            this.worldManager.setGameState("loading_game");
            this.worldManager.loadWorld("menu");

            // Load game files after Menu files loaded
            PIXI.Assets.loadBundle('gameFiles').then(() : void => {
                console.log('Game files loaded');
                
                // Tell world manager game has finished loading
                this.worldManager.setGameState("loading_fin");
            })
        });

        // Load game files in background
        PIXI.Assets.backgroundLoadBundle('gameFiles');
    }
} 

window.addEventListener('DOMContentLoaded', () => new ToastR);
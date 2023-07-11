/** Name:   ToastR index.ts file
 *  Desc:   Main file of ToastR, calls all other files
 *          and initisises the application.
 *  Author: Jimy Houlbrook
 *  Date:   21/06/23
 */

/** TODO:
 *  1. Initialise Application
 *  2. Load files using pixi v7
*/

import * as PIXI from 'pixi.js'

export default class ToastR {

    // Application to hold game
    private app : PIXI.Application;

    constructor(){
        this.app = new PIXI.Application<HTMLCanvasElement>({
            height: 720,
            width: 1080,
            backgroundColor: 0x2f9da3,
            //hello: true,
            view: <HTMLCanvasElement>document.getElementById('game')
        });

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
            PIXI.Assets.loadBundle('gameFiles').then(() : void => {
                console.log('Game files loaded');
            })
        });

        // Load game files in background
        PIXI.Assets.backgroundLoadBundle('gameFiles');
    }
} 

window.addEventListener('DOMContentLoaded', () => new ToastR);
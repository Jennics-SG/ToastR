/** Name:   ToastR index.js file
 *  Desc:   main file of ToastR, calls all other files and
 *          initialises the application
 *  Author: Jimy Houlbrook
 *  Date: 04/10/22
 */
import * as PIXI from 'pixi.js';

const toastR = function() {
    // Application to hold the game
    this.app = new PIXI.Application({
        height: window.innerHeight - 22|| 720,
        width: window.innerWidth - 10|| 1280,
        magin: 10,
        backgroundColor: 0x2f9da3
    });

    // Loader for game sprites
    const loader = new PIXI.Loader("assets")

    // Canvas to hold game
    const canvas = new PIXI.Container()

    const init = () => {
        // Add app to DOM content
        const div = document.getElementById('game');
        div.appendChild(this.app.view)

        // Load files
        const files = require('./files.json')
        for(const _file of files.files) loader.add(_file[0]);

        loader.onProgress.add(function (e) { console.log(e.progress); });
        loader.onError.add(function (e) { console.error(`ERR: ${e.message}`); });
        loader.onComplete.add(function (e) { console.log('done')});
        loader.load();
    }

    init();
}

document.addEventListener('DOMContentLoaded', toastR)
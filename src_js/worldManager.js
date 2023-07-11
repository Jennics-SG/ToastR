/** Name:   ToastR.WorldManager.js
 *  Desc:   World manager for ToastR, loads worlds and unloads worlds
 *  Author: Jimy Houlbrook
 *  Date:   12/10/22
 */

import { Menu } from "./worlds/menu";
import { Game } from "./worlds/game/game";
import { Loading } from "./worlds/loading";

// Class representing world manager, loads and deletes worlds
export class WorldManager{
    constructor(canvas){
        this.currentWorld = undefined;
        this.canvas = canvas;
    }

    /** Delete current world if exists
     * @returns bool
     */
    deleteWorld(){
        if(!this.currentWorld)
            return true;
        
        this.currentWorld.destroy();
        return true;
    }

    /** Load the world required for application
     * 
     * @param {String}                  string  World to be loaded 
     * @param {PIXI.loader}             loader  PIXI loader containing game files
     * @param {PIXI.Ticker} ticker  PIXI ticker
     * @returns null
     */
    loadWord(string, loader, ticker, appView){
        if(!string)
            return false

        this.deleteWorld();

        switch(string){
            case "menu":
                this.currentWorld = new Menu(loader, ticker, this.loadWord.bind(this));
                break;
            
            case "game":
                this.currentWorld = new Game(loader, ticker, this.loadWord.bind(this));
                break;
            
            case "loading":
                this.currentWorld = new Loading(appView);
                break;
        }
        this.canvas.addChild(this.currentWorld);
    }
}
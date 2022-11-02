/** Name:   ToastR.WorldManager.js
 *  Desc:   World manager for ToastR, loads worlds and unloads worlds
 *  Author: Jimy Houlbrook
 *  Date:   12/10/22
 */

import { Menu } from "./worlds/menu";
import { Game } from "./worlds/game/game";

// Class representing world manager, loads and deletes worlds
export class WorldManager{
    constructor(){
        this.currentWorld = undefined;
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
     * @param {PIXI.Application.ticker} ticker  PIXI ticker
     * @returns null
     */
    loadWord(string, loader, ticker){
        if(!string)
            return false

        this.deleteWorld();

        switch(string){
            case "menu":
                this.currentWorld = new Menu(loader);
                break;
            
            case "game":
                this.currentWorld = new Game(loader);
                ticker.add(this.currentWorld.delta.bind(this.currentWorld));
                break;
        }
    }
}
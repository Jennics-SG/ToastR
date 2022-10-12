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

    // Deletes current world if it exists
    deleteWorld(){
        if(!this.currentWorld)
            return true;

        this.currentWorld.cont.destroy()
        delete this.currentWorld;
        return true;
    }

    // Loads world depending on string
    loadWord(string, loader){
        if(!string)
            return false

        this.deleteWorld();

        switch(string){
            case "menu":
                this.currentWorld = Menu(loader);
                break;
            
            case "game":
                this.currentWorld = Game(loader);
                break;
        }
    }
}
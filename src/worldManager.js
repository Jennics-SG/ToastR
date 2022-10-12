/** Name:   ToastR.WorldManager.js
 *  Desc:   World manager for ToastR, loads worlds and unloads worlds
 *  Author: Jimy Houlbrook
 *  Date:   12/10/22
 */

import { Menu } from "./worlds/menu";

export class WorldManager{
    constructor(){
        this.currentWorld = undefined;
    }

    deleteWorld(){
        if(!this.currentWorld)
            return true;

        this.currentWorld.cont.destroy()
        delete this.currentWorld;
        return true;
    }

    loadWord(string, loader){
        if(!string)
            return false

        this.deleteWorld();

        switch(string){
            case "menu":
                this.currentWorld = Menu(loader);
                break;
            
            case "game":
                console.log('game');
                break;
        }
    }
}
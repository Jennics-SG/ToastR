/** Name:   ToastR.WorldManager.ts
 *  Desc:   World manager for ToastR, loads worlds & unloads worlds
 *  Author: Jimy Houlbrok
 *  Date:   16/10/23
 */

import { Container, Assets } from "pixi.js";
import Menu from "./worlds/menu";

//Class representing world manager
export default class WorldManager{
    private currentWorld : Container | null;
    private canvas : Container;

    private gameState : String | null;
    private worldState : String | null;

    constructor(canvas : Container){
        this.currentWorld = null;
        this.canvas = canvas;

        this.gameState = null;
        this.worldState = null;
    }

    /** Delete current world if exists
     * @returns  bool
     */
    deleteWorld() : boolean{
        if(!this.currentWorld)
            return true;
        this.currentWorld.destroy();
        return true;
    }

    loadWorld(world : String) : void {
        if(!world)
            return;

        this.deleteWorld();

        if(this.gameState != "loading"){
            switch(world){
                case "menu":
                    this.currentWorld = new Menu(this);
                    break;
            }
        }

        if(!this.currentWorld)
            return
        
        this.canvas.addChild(this.currentWorld);
    }

    setGameState(str : String) : void {
        this.gameState = str;
    }
}
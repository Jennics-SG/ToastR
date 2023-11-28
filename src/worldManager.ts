/** Name:   ToastR.WorldManager.ts
 *  Desc:   World manager for ToastR, loads worlds & unloads worlds
 *  Author: Jimy Houlbrok
 *  Date:   16/10/23
 */

import { Container, Assets } from "pixi.js";
import Menu from "./worlds/menu";
import Loading from "./worlds/loading";
import Game from "./worlds/game/game";

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

    loadWorld(world : String | null) : void {
        if(!world)
            return;

        this.deleteWorld();

        this.worldState = world
        if(this.gameState != "loading"){
            switch(world){
                case "menu":
                    this.currentWorld = new Menu(this);
                    break;
                case "game":
                    // Check to make sure game is not loading files
                    if(this.gameState == "loading_game"){
                        this.currentWorld = new Loading(this.canvas.width, this.canvas.height);
                        break;
                    }
                    this.currentWorld = new Game(this)
                    break;
            }
        } else {
            this.currentWorld = new Loading(this.canvas.width, this.canvas.height)
        }

        if(!this.currentWorld)
            return
        
        this.canvas.addChild(this.currentWorld);
    }

    setGameState(str : String) : void {
        this.gameState = str;
    }
    getWorldState() : String | null{
        return this.worldState;
    }
}
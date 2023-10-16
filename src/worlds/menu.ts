/** Name:   ToastR.Menu.ts
 *  Desc:   Main menu for ToastR
 *  Author: Jimy Houlbrook
 *  Date:   16/10/23
 */

import { Container,Sprite,Assets } from "pixi.js";
import WorldManager from "../worldManager";

export default class Menu extends Container{

    private worldManager : WorldManager;

    constructor(worldManager: WorldManager){
        super();
        this.worldManager = worldManager;

        const textStyle = {
            fill: "#c09947",
            fontFamily: 'Arial',
            fontSize: 0,
            align: 'left',
            lineJoin: "round",
            stroke: "#694329",
            strokeThickness: 20              
        }

        const background = new Sprite(Assets.get("background"))
        this.addChild(background);
    }
}
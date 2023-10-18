/** Name:   ToastR.Game.ts
 *  Desc:   Initialise game and handle all logic
 *  Author: Jimy Houlbrook
 *  Date: 18/10/23
 */

import { Container, TextStyle, Text, Assets, Sprite } from "pixi.js";
import WorldManager from "../../worldManager";

interface Environment {
    name: String | null,
    vars: Vars,
    objs: Object | null
}

interface Vars {
    score: Number,
    chances: Number
}

export default class Game extends Container{

    private worldManager : WorldManager;
    private textStyle : TextStyle

    private env : Environment

    constructor(worldManager : WorldManager){
        super();

        this.worldManager = worldManager;

        // Children set to sortable on z axis
        this.sortableChildren = true;

        this.env = {
            name: null,
            vars: {
                score: 0,
                chances: 0
            },
            objs: null,
        }

        this.textStyle = new TextStyle({
            fill: "#c09947",
            fontFamily: 'Arial',
            fontSize: 62,
            align: 'left',
            lineJoin: "round",
            stroke: "#694329",
            strokeThickness: 20    
        });
    }

    loadWorld(){
        // Create background at 0,0
        const background : Sprite = new Sprite(Assets.get('background'));
        this.addChild(background);


    }
}
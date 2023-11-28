/** Name:   ToastR.Game.ts
 *  Desc:   Initialise game and handle all logic
 *  Author: Jimy Houlbrook
 *  Date: 18/10/23
 */

import { Container,TextStyle,Text,Assets,Sprite,Texture } from "pixi.js";
import WorldManager from "../../worldManager";
import { Bread } from "./bread";

interface Environment {
    name: String | null,
    vars: Vars,
    objs: GameObjects
}

interface Vars {
    score: number,
    chances: number
}

interface GameObjects {
    bread: Bread | null,
}

export default class Game extends Container{

    private worldManager : WorldManager;
    private textStyle : TextStyle;

    private env : Environment;

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
            objs: {
                bread: null
            },
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

        this.loadWorld();
    }

    loadWorld(){
        // Create array of bread textures for orders & bread objects
        const breadTextures : Array<Texture> = new Array();
        const spreads : Array<String> = ["beans", "butter", "nut"];
        const breadStates : number = 6;

        for(let i = 1; i <= breadStates; i++){
            breadTextures.push(Assets.get(`bread${i}`));
            for(const spread of spreads){
                breadTextures.push(Assets.get(`bread${i}_${spread}`));
            }
        }

        // Create background at 0,0
        const background : Sprite = new Sprite(Assets.get('background'));
        this.addChild(background);

        // Create order TV at otx & oty
        const orderTV : Sprite = new Sprite(Assets.get('orderTV'));
        const otx : number = orderTV.width / 6;
        const oty : number = orderTV.height / 4;
        orderTV.position.set(otx, oty);
        this.addChild(orderTV)

        // Make Loaf
        const loaf : Sprite = new Sprite(Assets.get('loaf'));
        loaf.scale.set(0.8);
        
        const lx : number = (background.width / 2) - loaf.width / 1.25;
        const ly : number = (background.height / 1.75) - loaf.height / 2;
        loaf.position.set(lx, ly);

        // Make loaf create bread when clicked
        loaf.eventMode = "dynamic";
        loaf.on('pointerdown', (e) => {
            const x : number = e.global.x;
            const y : number = e.global.y;
            this.makeBread(x, y, breadTextures);
        })

        this.addChild(loaf);
    }


    // When the bread is clicked to start a drag it jumps to the mouse co ords. Need to find a way
    // to make this smoother, or remove this all together
    makeBread(x: number, y: number, breadTextures: Array<Texture>){
        if(this.env.objs.bread){
            this.env.objs.bread.destroy()
            this.env.objs.bread = null;
            this.env.vars.score -= 10;
            // Update Text
        }

        const bread = new Bread(x, y, breadTextures)
        this.addChild(bread);
        this.env.objs.bread = bread;
    }
}
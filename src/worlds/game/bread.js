/** Name:   ToastR.Bread.js
 *  Desc:   All logic forr bread obj
 *  Author: Jimy Houlbrook 
 *  Date:   12/10/22
 */

import { Sprite } from "pixi.js";

/** Class respresenting bread
 * 
 *  Extends PIXI.Sprite to keep the metods while allowing custom methods too
 * 
 *  @param {Number}          x           X pos of bread
 *  @param {Number}          y           Y pos of bread
 *  @param {Loader.resource} texture     Texture of bread
 */
export class Bread extends Sprite{
    constructor(x = 0, y = 0, textures){
        // Set class variables
        super(textures[0].texture);
        this.anchor.set(0.5);
        this.position.set(x, y);
        this.scale.set(0.8);
        this.zIndex = 0;
        this.state = 1;
        this.property = "bare";
        this.interactive = true;
        this.dragging = true;
        this.textures = textures;

        // Interactables
        this.pointerdown = this.dragStart;
        this.pointermove = this.dragMove;
        this.pointerup = this.dragEnd;
    }

    " DRAGGING PHYSICS START "
    dragStart(e){
        this.x = e.data.global.x;
        this.y = e.data.global.y;
        
        this.dragging = true;
    }

    dragMove(e){
        if(!this.dragging)
            return

        this.x = e.data.global.x;
        this.y = e.data.global.y;
    }

    dragEnd(e){
        if(!this.dragging)
            return

        this.dragging = false;
    }

    " DRAGGING PHYSICS END "

    /** Create a loop to change the bread texture every second while "toasting"
     * 
     * @param {Number} setting  Setting of the toaster, dictates how many iteration the loop runs for 
     * @returns Promise
     */
    changeTexture(setting){
        let i = 1;
        return new Promise((resolve) => {
            let loop = () =>{
                this.state ++

                this.texture = this.textures[(this.state - 1) * 4].texture;
                if(this.state == 6 || i >= setting) resolve();
                else if(i <= setting){
                    i++;
                    setTimeout(loop, 1000);
                }
            }
            setTimeout(loop, 1000);
        })
    }

    // Called from game.js
    spread(property){
        if(this.property !== "bare")
            return
        switch(property){
            case "butter":
                let offset = 2;
                this.texture = this.textures[(this.state - 1) + offset].texture;
                break;
        }
    }
}
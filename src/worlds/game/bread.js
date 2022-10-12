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
 *  @param{Number}          x           X pos of bread
 *  @param{Number}          y           Y pos of bread
 *  @param{loader.resource} texture     Texture of bread
 */
export class breadObj extends Sprite{
    constructor(x = 0, y = 0, texture){
        // Set class variables
        super(texture);
        this.anchor.set(0.5);
        this.position.set(x, y);
        this.state = 1;
        this.property = "bare";
        this.interactive = true;
        this.dragging = false;

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
}
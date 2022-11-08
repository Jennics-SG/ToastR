/** Name:   ToastR.Knife.js
 *  Desc:   All logic for knife object
 *  Author: Jimy Houlbrook
 *  Date:   03/11/22
 */

import { Sprite } from "pixi.js";

export class Knife extends Sprite{
    constructor(x, y, texture, property, environmentObj){
        super(texture);
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.property = property;
        this.interactive = true;
        this.dragging = true;

        this.env = environmentObj

        this.pointerdown = this.dragStart;
        this.pointermove = this.dragMove;
        this.pointerup = this.dragEnd;
    }

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
        this.env.objs.knife = null;
        this.destroy();
    }
}
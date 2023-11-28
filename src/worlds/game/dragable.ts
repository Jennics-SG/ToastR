/** Name:   Dragable.Toastr.Ts
 *  Desc:   Logic for any draggable item within the game
 *  Author: Jimy Houlbrook
 *  Date:   28/11/23
 */

import { Point, Sprite } from "pixi.js"
import { Bread } from "./bread"

export class Dragable{
    private target: Bread;
    private dragPoint: Point;

    constructor(target: Bread){
        this.dragPoint = new Point();
        this.target = target

        target.on('pointerdown', this.dragStart.bind(this));
        target.on('pointermove', this.dragMove.bind(this));
        target.on('pointerup', this.dragEnd.bind(this));
    }

    dragStart(e: MouseEvent){
        const mousePoint = new Point(e.x, e.y);

        this.dragPoint = new Point(
            this.target.x - mousePoint.x,
            this.target.y - mousePoint.y
        );

        this.target.dragging = true;
        this.updateDragPosition(mousePoint)
    }

    dragMove(e: MouseEvent){
        if(!this.target.dragging)
            return;

        const mousePoint = new Point(e.x, e.y);
        this.updateDragPosition(mousePoint);
    }

    dragEnd(e: MouseEvent){
        if(!this.target.dragging)
            return;

        this.target.dragging = false;
    }

    updateDragPosition(mousePoint: Point){
        if(!this.target.dragging && this.dragPoint)
            return
        
        this.target.x = mousePoint.x + this.dragPoint.x;
        this.target.y = mousePoint.y + this.dragPoint.y;
    }
}
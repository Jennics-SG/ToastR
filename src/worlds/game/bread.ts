/** Name:   ToastR.Bread.ts
 *  Desc:   All logic for bread obj
 *  Author: Jimy Houlbrook
 *  Date:   18/10/23
 */

import { Sprite,Texture, Point } from "pixi.js";
import { Dragable } from "./dragable";

export class Bread extends Sprite{
    private state : number;
    private property : String;
    private textures : Array<Texture>;

    public dragging : boolean;
    public dragPoint: Point;

    constructor(x: number = 0, y: number = 0, textures: Array<Texture>){
        super(textures[0]);
        this.scale.set(0.8);
        this.anchor.set(0.5);
        this.position.set(x, y);
        this.zIndex = 0;
        this.eventMode = "dynamic";

        this.state = 1;
        this.property = "bare";
        this.dragging = true;
        this.textures = textures;

        this.dragPoint = new Point();

        new Dragable(this);
    }

    updateDragPosition(mousePoint: Point){
        if(!this.dragging && this.dragPoint != null)
            return;

        this.x = mousePoint.x + this.dragPoint.x;
        this.y = mousePoint.y + this.dragPoint.y;

    }


    /** Create a loop to change the bread textyure while "toasting"
     * 
     * @param {number} setting  Setting of toaster, dictates amount of iterations 
     * @returns Promise
     */
    changeTexture(setting: number){
        let i : number = 1;

        // The array is structured so that all textures for a bread state are grouped together
        // This means that in order to access just the bread me multiply the index by the
        // Mutiplyer so that we are just accessing the "bare" breads for toasting
        let multiplyer : number = 4;
        return new Promise<void>((resolve) => {
            let loop = () => {
                this.state++;

                this.texture = this.textures[(this.state - 1) * multiplyer];
                if(this.state == 6 || i >= setting) resolve();
                else if(i <= setting){
                    i++;
                    setTimeout(loop, 1000);
                }
            }
            setTimeout(loop, 1000);
        });
    }

    spread(property: String){
        // Dont spread if already has spread
        if(this.property != "bare")
            return

        const multiplyer : number = 4;
        let indexOffset : number = 0;

        // Due to array structure we use the offset to ensure the right texture
        switch(property){
            case "beans":
                indexOffset = 1;
                break;
            case "butter":
                indexOffset = 2;
                break;
            case "chocolate":
                indexOffset = 3;
                break;
            default:
                console.error(`ERR: Spread unknown \nProperty:${property}`);
                break;
        }
        this.texture = this.textures[((this.state -1) * multiplyer)];
        this.property = property;
    }
}
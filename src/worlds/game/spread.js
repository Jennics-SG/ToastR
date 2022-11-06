/** Name:   ToastR.Spread.js
 *  Desc:   All logic for spread objects
 *  Author: Jimy Houlbrook
 *  Date:   03/11/22
 */

import { Sprite } from "pixi.js";
import { Knife } from "./knife";

/** Class representing spread object
 * 
 *  @param {Number}             x           X pos of spread object
 *  @param {Number}             y           Y pos of spread object
 *  @param {Loader.resource}    texture     Texture of spread
 *  @param {String}             property    Property of spread
 */
export class Spread extends Sprite{
    constructor(x, y, texture, childTexture, property){
        super(texture);
        this.x = x;
        this.y = y;
        this.childTexture = childTexture;
        this.property = property;
        this.interactive = true;
        // Spread.pointerdown is set in game.js
    }

    /** Make Knife object at x, y 
     * @param {Number} x        X position of knife
     * @param {Number} y        Y position of knife
     * @param {Game} container  Container holding game
     */
    makeKnife(x, y, container){

        const knife = new Knife(x, y, this.childTexture,
                            this.property, container.env);
        container.addChild(knife);
        container.env.objects.knife = knife;
    }
}
/** Name:   ToastR.Order.JS
 *  Desc:   Make order and display order
 *  Author: Jimy Houlbrook
 *  Date:   08/11/22
 */

import { Container, Sprite } from 'pixi.js'

export class Order extends Container{
    constructor(x, y, breads, spreads){
        super();

        // Initialise Variables --------------------------------------------------------
        this.x = x;
        this.y = y;
        this.state = "needs_order"

        this.breadTextures = breads;
        this.spreadTextures = spreads;

        this.makeOrder();
    }

    makeOrder(){
        this.state = "has_order"
        const randNumBread = Math.floor(Math.random() * this.breadTextures.length);
        const randNumSpread = Math.floor(Math.random() * this.spreadTextures.length);

        // Get order data
        this.bread = {
            ID: this.breadTextures[randNumBread][0],
            texture: this.breadTextures[randNumBread][1]
        }
        this.spread = {
            ID: this.spreadTextures[randNumSpread][0],
            texture: this.spreadTextures[randNumSpread][1]
        }

        // Create Texture --------------------------------------------------------------
        this.orderBread = new Sprite.from(this.bread.texture);
        this.orderBread.anchor.set(0.5);
        this.orderBread.scale.set(0.8);
        this.addChild(this.orderBread);

        this.orderSpread = new Sprite.from(this.spread.texture);
        this.orderSpread.anchor.set(0.5);
        this.orderSpread.x += this.orderBread.width;
        this.addChild(this.orderSpread);
    }

    destroy(){
        this.orderBread.destroy();
        this.orderSpread.destroy();
        this.state = "needs_order"
    }
}
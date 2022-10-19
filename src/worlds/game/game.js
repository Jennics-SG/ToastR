/** Name:   ToastR.Game.js
 *  Desc:   initialise game and handle all game logic
 *  Author: Jimy Houlbrook
 *  Date:   12/10/22
 */

import * as PIXI from 'pixi.js'
import { breadObj } from './bread';
import { toasterObj } from './toaster';

/** ToastR.game.Game
 * 
 *  Load assets into game and set up interactivity, will also contain
 *  delta loop for game
 * 
 * @param {PIXI.Loader} loader Loader containing assets for the game
 */

export const Game = class extends PIXI.Container{
    constructor(loader){
        super();
        this.loader = loader;

        this.sortableChildren = true;

        this.environment = {
            variables: {
                score: 0,
                chances: 3,
            },

            objects: {
                bread: null,
            },
        }

        " LOAD WORLD OBJECTS START "

        // Create background at 0,0
        const background = new PIXI.Sprite.from(
            this.loader.resources.background.texture
        );
        this.addChild(background);

        // Create order TV at otX and otY
        const orderTV = new PIXI.Sprite.from(
            this.loader.resources.orderTV.texture
        );
        const otx = orderTV.width / 4;
        const oty = orderTV.height / 4;
        orderTV.position.set(otx, oty);
        this.addChild(orderTV);
        
        // Make toaster start
        const dialTextures = new Array()

        for(let i = 1; i < 6; i++)
            dialTextures.push(this.loader.resources[`dial${i}`].texture);
        
        const toasterTexture = this.loader.resources.toaster_up.texture

        const tx = (background.height / 20);
        const ty = (background.height) - toasterTexture.height * 1.5;

        const toaster = new toasterObj(
            tx, ty, toasterTexture, this.loader.resources.lever.texture, dialTextures
        );
        this.addChild(toaster);
        // Make toaster end

        const loaf = new PIXI.Sprite.from(this.loader.resources.loaf.texture);
        loaf.scale.set(0.8);

        const lx = (background.width / 2) - loaf.width / 1.25;
        const ly = (background.height / 1.75) - (loaf.height / 2);

        loaf.position.set(lx, ly);
        
        // Make loaf create piece of bread when clicked
        loaf.interactive = true;
        loaf.pointerdown = e => {
            const x = e.data.global.x;
            const y = e.data.global.y;
            this.makeBread(x, y)
        }
        this.addChild(loaf);


        " LOAD WORLD OBJECTS END "
    }

    makeBread(x, y){
        if(this.environment.objects.bread){
            this.environment.objects.bread.destroy();
            this.environment.variables.score -= 10;
        }

        const bread = new breadObj(x, y, this.loader.resources.bread1.texture);
        this.addChild(bread);
        this.environment.objects.bread = bread;
    }
}
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
 * @param {PIXI.Loader} loader 
 */

export const Game = class extends PIXI.Container{
    constructor(loader){
        super();
        this.loader = loader;

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

        const background = new PIXI.Sprite.from(
            this.loader.resources.background.texture
        );
        this.addChild(background);

        const orderTV = new PIXI.Sprite.from(
            this.loader.resources.orderTV.texture
        );
        orderTV.position.set(orderTV.width / 4, orderTV.height / 4);
        this.addChild(orderTV);
        
        
        // Make toaster
        const dialTextures = new Array()

        console.log(this.loader.resources)

        for(let i = 1; i < 6; i++)
            dialTextures.push(this.loader.resources[`dial${i}`].texture);

        const toaster = new toasterObj(
            (background.height / 20) * 3,
            (background.height) - this.loader.resources.toaster_up.texture.height * 1.5,
            this.loader.resources.toaster_up.texture,
            this.loader.resources.lever.texture, dialTextures
        );
        this.addChild(toaster);

        " LOAD WORLD OBJECTS END "
    }
}
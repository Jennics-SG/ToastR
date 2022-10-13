/** Name:   ToastR.Game.js
 *  Desc:   initialise game and handle all game logic
 *  Author: Jimy Houlbrook
 *  Date:   12/10/22
 */

import * as PIXI from 'pixi.js'
import { breadObj } from './bread';

/** ToastR.game.Game
 * 
 *  Load assets into game and set up interactivity, will also contain
 *  delta loop for game
 * 
 * @param {PIXI.Loader} loader 
 * @returns object with world variables
 */
/** OLD CODE FOR REFERENCE
export const awd = function(loader){
    const container = new PIXI.Container();

    let bread = null;

    const background = new PIXI.Sprite.from(
        loader.resources.background.texture
    );
    container.addChild(background);

    const loaf = new PIXI.Sprite.from(loader.resources.loaf.texture)
    loaf.scale.set(0.8);
    loaf.position.set(
        (background.width / 2 - (loaf.width * 2) / 2),
        (background.height / 1.75) - loaf.height / 2
    );
    loaf.interactive = true;
    loaf.pointerdown = e => {
        if(bread)
            bread.destroy();

        bread = new breadObj(
            e.data.global.x,
            e.data.global.y,
            loader.resources.bread1.texture
        );
        container.addChild(bread);
    }
    container.addChild(loaf);

    const worldObject = {
        cont: container,
    }

    return worldObject;
}
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
        
        // Toaster object, going to make file quickly

        " LOAD WORLD OBJECTS END "
    }
}
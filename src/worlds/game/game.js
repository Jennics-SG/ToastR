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
export const Game = function(loader){
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
            bread = null;

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
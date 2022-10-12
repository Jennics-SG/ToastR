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

    const background = new PIXI.Sprite.from(
        loader.resources.background.texture
    );
    container.addChild(background);

    const bread = new breadObj(0, 0, loader.resources.bread1.texture)
    container.addChild(bread);

    const worldObject = {
        cont: container,
    }

    return worldObject;
}
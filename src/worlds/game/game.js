/** Name:   ToastR.Game.js
 *  Desc:   initialise game and handle all game logic
 *  Author: Jimy Houlbrook
 *  Date:   12/10/22
 */

import * as PIXI from 'pixi.js';
import { Bread } from './bread';
import { Toaster } from './toaster';
import { Utilities } from './utils';
import { Spread } from './spread';

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

        this.env = {
            variables: {
                score: 0,
                chances: 3,
            },

            objects: {
                bread: null,
                toaster: null,
                knife: null,
            },
        }

        " LOAD WORLD OBJECTS START "

        // Create background at 0,0 ---------------------------------------------------
        const background = new PIXI.Sprite.from(
            this.loader.resources.background.texture
        );

        this.addChild(background);

        // Create order TV at otX and otY ----------------------------------------------
        const orderTV = new PIXI.Sprite.from(
            this.loader.resources.orderTV.texture
        );
        const otx = orderTV.width / 4;
        const oty = orderTV.height / 4;
        orderTV.position.set(otx, oty);
        this.addChild(orderTV);
        
        // Make toaster ----------------------------------------------------------------
        const dialTextures = new Array()

        for(let i = 1; i < 6; i++)
            dialTextures.push(this.loader.resources[`dial${i}`].texture);
        
        const toasterUpTexture = this.loader.resources.toaster_up.texture;
        const toasterDownTexture = this.loader.resources.toaster_down.texture;
        const tx = (background.height / 20);
        const ty = (background.height) - toasterUpTexture.height * 1.5;

        const toaster = new Toaster(
            tx, ty, toasterUpTexture, toasterDownTexture,
            this.loader.resources.lever.texture, dialTextures
        );

        // Set toaster pointer events
        toaster.elems.body.pointerdown = () =>
            toaster.toastBread(this.env.objects.bread)
        toaster.elems.lever.pointerdown = () => 
            toaster.toastBread(this.env.objects.bread)

        this.addChild(toaster);
        this.env.objects.toaster = toaster;
 
        // Make bread texture array ----------------------------------------------------
        this.breadTextures = new Array
        const spreads = ["beans", "butter", "nut"]

        for(let i = 1; i <= 6; i++){
            this.breadTextures.push(this.loader.resources[`bread${i}`])
            for(const spread of spreads){
                this.breadTextures.push(this.loader.resources[`bread${i}_${spread}`])
            }
        }

        // Make Loaf -------------------------------------------------------------------
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

        // Make Chopping Board ---------------------------------------------------------
        const cbTexture = this.loader.resources.choppingBoard.texture;
        const choppingBoard = new PIXI.Sprite.from(cbTexture);

        const cbX = background.width / 2;
        const cbY = background.height / 1.4;
        choppingBoard.position.set(cbX, cbY);
        this.addChild(choppingBoard);

        // Make Spreads ----------------------------------------------------------------
        const bX = choppingBoard.x + this.loader.resources.butter.texture.width;
        const bY = background.height / 2;

        const butterTexture = this.loader.resources.butter.texture;
        const butterKnifeTexture = this.loader.resources.knife_butter.texture;

        const butter = new Spread(bX, bY, butterTexture, butterKnifeTexture, 'butter');
        butter.pointerdown = e => {
            const x = e.data.global.x;
            const y = e.data.global.y;
            butter.makeKnife.bind(butter)(x, y, this);
        }
        this.addChild(butter);

        " LOAD WORLD OBJECTS END "
    }

    /** Make bread at X, Y
     *  This function is the pointerdown event for loaf. it is 
     *  in this file to allow easier manipulation of this.
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    makeBread(x, y){
        if(this.env.objects.bread){
            this.env.objects.bread.destroy();
            this.env.objects.bread = null
            this.env.variables.score -= 10;
        }

        const bread = new Bread(x, y, this.breadTextures);
        this.addChild(bread);
        this.env.objects.bread = bread;
    }

    // Gameloop, runs every frame
    // Because this fuction is called from a different function, this must be bound
    delta(){
        // Check if bread exists before testing its colissions
        if(this.env.objects.bread){
            if(Utilities.isWithin(
                this.env.objects.bread, this.env.objects.toaster)
                && !this.env.objects.bread.dragging){
                this.env.objects.toaster.setInteractive(true)
            }else
                this.env.objects.toaster.setInteractive(false)

                    // Check if knife exists before testing its colissions
            if(this.env.objects.knife){
                if(Utilities.isWithin(this.env.objects.bread, this.env.objects.knife)){
                    let breadTexture = 
                        this.loader.resources[`bread${this.env.objects.bread.state}_${this.env.objects.knife.property}`]
                    this.env.objects.bread.spread(this.env.objects.knife.property);
                }
            }
        }
    }
}
/** Name:   ToastR.toaster.js
 *  Desc:   alllogic for toaster object
 *  Author: Jimy Houlbrook
 *  Date:   13/10/22
 */

import * as PIXI from 'pixi.js'
const TWEEN = require('@tweenjs/tween.js');

/** Class representing toaster object
 * 
 *  The toaster is 3 sprite objects within an extended container,
 *  this allows us to bunch the elements together in the heirarchy.
 * 
 * @param {Number}              x               X Position 
 * @param {Number}              y               Y Position
 * @param {PIXI.Loader.texture} toasterTexture  Texture of the main body for toaster
 * @param {PIXI.Loader.texture} leverTexture    Texture of the lever for the toaster
 * @param {Array}               textureArray    Array of textures for the dial
 */
export const Toaster = class extends PIXI.Container{
    constructor(x, y, toasterUpTexture, toasterDownTexture, leverTexture, textureArray){
        super();

        this.setting = 1;

        let dialTextures = textureArray;

        this.toasterTextures = [toasterUpTexture, toasterDownTexture]

        // MAKE TOASTER ELEMENTS START -------------------------------------------------
        this.sortableChildren = true;
        this.zIndex = 1;

        const toaster = new PIXI.Sprite.from(this.toasterTextures[0]);
        toaster.position.set(x, y);
        this.addChild(toaster);
        
        const protoLever = new PIXI.Sprite.from(leverTexture);
        const lX = (toaster.x + toaster.width / 8) - protoLever.width / 1.75;
        const lY = toaster.y + toaster.height / 4;
        protoLever.position.set(lX, lY);
        this.addChild(protoLever);

        
        const protoDial = new PIXI.Sprite.from(dialTextures[0]);
        protoDial.anchor.set(0.5);
        const dX = toaster.x + toaster.width / 2;
        const dY = toaster.y + toaster.height - protoDial.height;

        // Add a callback so when the toaster is tapped with a mouse,
        // or finger on touchscreen, the setting is changed
        protoDial.interactive = true;
        protoDial.pointerdown = () => {
            this.changeSetting(dialTextures);
        }

        protoDial.position.set(dX, dY);
        this.addChild(protoDial);

        // Elems object holds the oelems for the world to
        // make them easiy accessible
        this.elems = {
            body: toaster,
            lever: protoLever,
            dial: protoDial
        }

        // Create bounds object that holds x and y position of container
        this.bounds = this.getBounds();
    }

    /** Set the toasters interactive used for toasting start
     * 
     * @param {boolean} bool which interactive should be set to 
     */
    setInteractive(bool){
        this.elems.lever.interactive = bool;
        this.elems.body.interactive = bool;
    }

    /** Change the setting of toaster
     * @param {Array} textures array of textures of the dial
     */
    changeSetting(textures){
        this.setting = (this.setting + 1) % 6
        if(this.setting == 0) this.setting = 1;
        this.elems.dial.texture = textures[this.setting - 1];
    }

    /** Contains all functions for toasting animations and runs them
     * 
     * @param {Bread} bread     Current bread object
     */
    async toastBread(bread){
        /** Toasting animations
         * 
         *  This function takes the element and moves it to newPos over time 
         * 
         * @param {PIXI.Container}  elem    Element to be moved 
         * @param {number}          newPos  New position of element
         * @param {number}          time    Time animation should take
         * @returns 
         */
        const toastingAnims = (elem, newPos, time) => {
            return new Promise(resolve => {
                let transform = {y: elem.y};
                let animation = new TWEEN.Tween(transform)
                    .to({y: newPos}, time)
                    .onUpdate(() => elem.y = transform.y);
                animation.start();
                resolve();
            });
        }

        // Works the same as toastingAnims
        // Own function to chain two tweens togethn
        const finToastingBread = (elem, newPos) => {
            return new Promise((resolve) => {
                let transform = {y: elem.y};
                let popUp = new TWEEN.Tween(transform)
                    .to({y: newPos}, 250)
                    .onUpdate(() => elem.y = transform.y);

                let fallDown = new TWEEN.Tween(transform)
                    .to({y: this.bounds.y}, 150)
                    .onUpdate(() => elem.y = transform.y)

                popUp.chain(fallDown);
                popUp.start();
                resolve();
            })
        }

        // Move the bread to the starting toasting position
        // Set interactive to false so users can't move the bread while toasting
        bread.interactive = false;
        bread.x = this.bounds.x + (this.bounds.width / 2);
        bread.y = this.bounds.y;
        this.elems.body.texture = this.toasterTextures[1];
        this.setInteractive(false);

        // Runs two instances of toastingAnims concurrently on the lever and bread
        await Promise.allSettled([
            toastingAnims(bread, this.bounds.y + 50, 250),
            toastingAnims(this.elems.lever, this.bounds.y + (this.bounds.height / 1.5), 250)
        ]);

        await bread.changeTexture(this.setting);

        await Promise.allSettled([
            finToastingBread(bread, this.bounds.y - 50),
            toastingAnims(this.elems.lever, this.bounds.y + this.bounds.height / 4, 250)
        ]);

        bread.interactive = true;
        this.setInteractive(true);
    }
}
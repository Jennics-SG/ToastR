/** Name:   ToastR.toaster.js
 *  Desc:   alllogic for toaster object
 *  Author: Jimy Houlbrook
 *  Date:   13/10/22
 */

import * as PIXI from 'pixi.js'

export const toasterObj = class extends PIXI.Container{
    constructor(x, y, toasterTexture, leverTexture, textureArray){
        super();

        this.setting = 1;

        let dialTextures = textureArray;

        " MAKE TOASTER ELEMENTS "
        this.sortableChildren = true;

        console.log(toasterTexture);
        console.log(leverTexture);
        console.log(textureArray);

        const toaster = new PIXI.Sprite.from(toasterTexture);
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

        // Make the dial interative
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
        
    }

    changeSetting(textures){
        this.setting = (this.setting + 1) % 6
        if(this.setting == 0) this.setting = 1;
        this.elems.dial.texture = textures[this.setting - 1];
    }
}
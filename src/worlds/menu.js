/** Name:   ToastR.Menu.js
 *  Desc:   Make main menu for ToastR
 *  Author: Jimy Houlbrook
 *  Date:   12/10/22
 */

import * as PIXI from 'pixi.js';

export const Menu = class extends PIXI.Container{
    constructor(loader){
        super();
        this.loader = loader;

        const textStyle = {
            fill: "#c09947",
            fontFamily: 'Arial',
            fontSize: 0,
            align: 'left',
            lineJoin: "round",
            stroke: "#694329",
            strokeThickness: 20              
        }

        const background = new PIXI.Sprite.from(
            this.loader.resources.background.texture
        );
        this.addChild(background);

        const menuBox = new PIXI.Sprite.from(
            this.loader.resources.greyBox.texture
        );
        menuBox.anchor.set(0.5);
        menuBox.position.set(
            (background.x + background.width / 2),
            (background.y + background.height / 2)
        );
        this.addChild(menuBox);

        textStyle.fontSize = 122;
        const logo = new PIXI.Text('ToastR', textStyle);
        logo.anchor.set(0.5);
        logo.position.set(
            menuBox.x,
            (menuBox.y - menuBox.height / 2) + logo.height
        );
        this.addChild(logo);

        textStyle.fontSize = 90;
        this.playButton = new PIXI.Text('Play Now', textStyle);
        this.playButton.anchor.set(0.5);
        this.playButton.position.set(menuBox.x, menuBox.y);
        this.playButton.interactive = true;
        this.addChild(this.playButton);
    }
}
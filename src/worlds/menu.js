/** Name:   ToastR.Menu.js
 *  Desc:   Make main menu for ToastR
 *  Author: Jimy Houlbrook
 *  Date:   12/10/22
 */

import * as PIXI from 'pixi.js';

export const Menu = class extends PIXI.Container{
    constructor(loader, ticker, worldManager){
        super();
        this.loader = loader;
        this.ticker = ticker;
        this.worldManager = worldManager;

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

        // const playButton = new PIXI.Text('Play Now', textStyle);
        // playButton.anchor.set(0.5);
        // playButton.position.set(menuBox.x, menuBox.y);
        // playButton.interactive = true;

        // playButton.pointerdown = () => {
        //     this.worldManager("game", this.loader, this.ticker)
        // }

        const playButtonTexture = this.loader.resources.playButton.texture;
        const playButtonInvert = this.loader.resources.playButton_inv.texture;

        const playButton = new PIXI.Sprite.from(playButtonTexture);
        playButton.scale.set(0.5);
        playButton.anchor.set(0.5);
        playButton.position.set(menuBox.x, menuBox.y);

        playButton.interactive = true;

        // Change texture on hover enter
        playButton.pointerover = () => {
            playButton.texture = playButtonInvert;
        }

        // Change texture back on hover exit
        playButton.pointerout = () => {
            playButton.texture = playButtonTexture;
        }

        // Load game on press
        playButton.pointerdown = () => {
            this.worldManager("game", this.loader, this.ticker);
        }

        this.addChild(playButton);
    }
}
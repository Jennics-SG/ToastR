/** Name:   ToastR.Menu.js
 *  Desc:   Make main menu for ToastR
 *  Author: Jimy Houlbrook
 *  Date:   12/10/22
 */

import * as PIXI from 'pixi.js';

export function Menu(loader){
    const container = new PIXI.Container();

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
        loader.resources.background.texture
    );
    container.addChild(background);

    const menuBox = new PIXI.Sprite.from(loader.resources.greyBox.texture);
    menuBox.anchor.set(0.5);
    menuBox.position.set(
        (background.x + background.width / 2),
        (background.y + background.height / 2)
    );
    container.addChild(menuBox);

    textStyle.fontSize = 122;
    const logo = new PIXI.Text('ToastR', textStyle);
    logo.anchor.set(0.5);
    logo.x = menuBox.x;
    logo.y = (menuBox.y - menuBox.height / 2) + logo.height;
    container.addChild(logo);

    textStyle.fontSize = 90;
    const playButton = new PIXI.Text('Play Now', textStyle);
    playButton.anchor.set(0.5);
    playButton.position.set(menuBox.x, menuBox.y);
    playButton.interactive = true;
    container.addChild(playButton);

    const worldObject = {
        cont: container,
        playButton: playButton,
    }

    return worldObject;
}
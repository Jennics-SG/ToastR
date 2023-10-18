/** Name:   ToastR.Menu.ts
 *  Desc:   Main menu for ToastR
 *  Author: Jimy Houlbrook
 *  Date:   16/10/23
 */

import { Container,Sprite,Assets,Text,TextStyle,Texture } from "pixi.js";
import WorldManager from "../worldManager";

/** Menu for ToastR
 *  Creates all elements for the world & handles interactions
 */
export default class Menu extends Container{

    private worldManager : WorldManager;

    constructor(worldManager: WorldManager){
        super();
        this.worldManager = worldManager;

        // Text style for Logo
        const textStyle : TextStyle = new TextStyle({
            fill: "#c09947",
            fontFamily: 'Arial',
            fontSize: 0,
            align: 'left',
            lineJoin: "round",
            stroke: "#694329",
            strokeThickness: 20              
        });

        // Menu elements
        const background : Sprite = new Sprite(Assets.get("background"))
        this.addChild(background);

        const menuBox : Sprite = new Sprite(Assets.get("greyBox"));
        this.addChild(menuBox);

        textStyle.fontSize = 122;
        const logo : Text = new Text('ToastR', textStyle);
        logo.anchor.set(0.5);
        logo.position.set(
            menuBox.x + menuBox.width / 2,
            menuBox.y + logo.height
        );
        this.addChild(logo);

        const playButtonTexture : Texture = Assets.get("playButton");
        const playButtonInvert : Texture = Assets.get("playButton_inv");
        
        const playButton = new Sprite(playButtonTexture);
        playButton.scale.set(0.5);
        playButton.anchor.set(0.5);
        playButton.position.set(menuBox.x + menuBox.width / 2, menuBox.y + menuBox.height / 2);

        playButton.eventMode = "dynamic";

        // Play button interactions
        playButton.on('pointerover', () => {
            playButton.texture = playButtonInvert;
        });
        playButton.on('pointerout', () => {
            playButton.texture = playButtonTexture;
        });

        playButton.on('pointerdown', () => {
            this.worldManager.loadWorld("game")
        })

        this.addChild(playButton);
    }
}
/** Name:   Loading.Toastr.ts
 *  Desc:   Loading screen for toastr
 *  Author: Jimy Houlbrook
 *  Date:   18/10/2023
 */

import {Container,Text,TextStyle} from 'pixi.js';

export default class Loading extends Container{
    constructor(appWidth : number, appHeight: number){
        super();

        const textStyle : TextStyle = new TextStyle({
            fill: "#c09947",
            fontFamily: 'Arial',
            fontSize: 122,
            align: 'left',
            lineJoin: "round",
            stroke: "#694329",
            strokeThickness: 20              
        });

        const logo : Text = new Text('ToastR', textStyle);
        logo.anchor.set(0.5);
        logo.position.set(
            appWidth / 2, appHeight / 4
        );
        this.addChild(logo);

        const loadingText : Text = new Text('Loading', textStyle);
        loadingText.anchor.set(0.5);
        loadingText.position.set(appWidth / 2, appHeight / 2);
        this.addChild(loadingText)
    }
}
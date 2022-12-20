import { Container, Text } from "pixi.js"

export const Loading = class extends Container{
    constructor(appView){
        super();

        const textStyle = {
            fill: "#c09947",
            fontFamily: 'Arial',
            fontSize: 122,
            align: 'left',
            lineJoin: "round",
            stroke: "#694329",
            strokeThickness: 20              
        }

        const logo = new Text('ToastR', textStyle);
        logo.anchor.set(0.5);
        logo.position.set(
            appView.width / 2, appView.height / 4
        );
        this.addChild(logo);

        const loadingText = new Text('Loading', textStyle);
        loadingText.anchor.set(0.5);
        loadingText.position.set(appView.width / 2, appView.height / 2);
        this.addChild(loadingText)
    }
}
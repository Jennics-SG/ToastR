// we use custom classes to allow for custom variables for the object
// TODO: make a way to scrap bread
//       Make new plate sprite
//       Timer for orders to make the game harder
//       difficulty settings changes the timer

class breadObj extends PIXI.Sprite {
    constructor(x = 0, y = 0, texture){
        super(texture);
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.scale.set(0.8);
        this.state = 1;
        this.property = "bare";
        this.interactive = true;
        this.zIndex = 2;
        this.dragging = true;
    }

    // Dragging physics and code
    dragStart(e){
        this.x = e.data.global.x;
        this.y = e.data.global.y;
        this.dragging = true;
    }

    dragMove(e){
        if(this.dragging){
            this.x = e.data.global.x;
            this.y = e.data.global.y;
        }
    }

    dragEnd(elems, spreads, lever){
        let spreadsInteractive = () => {for(const elem of spreads) elem[1].interactive = true}
        let spreadsUninteractive = () => {for(const elem of spreads) elem[1].interactive = false;}
        this.dragging = false;
        for(const elem of elems){
            if(elem[0] == "choppingBoard" && elem[1].containsPoint(this)) spreadsInteractive();
            else if(elem[0] == "choppingBoard" && !elem[1].containsPoint(this)) spreadsUninteractive();
            else if (elem[1].containsPoint(this)) elem[1].interactive = true;
            else elem[1].interactive = false;
        }
    }

    /* makeToast does the animations for toasting the bread, it also makes the bread non interactive so that the player cant drag the toast out of
    the toaster while toasting. This is an async function so we can use await */ 
    async makeToast(loader, toaster, lever){
        if(this.state != 6){
            toaster.texture = loader.resources['toaster_down'].texture;
            this.interactive = false;
            this.x = toaster.x;
            this.y = toaster.y - 100;

            // Runs both functions at once
            await Promise.allSettled([this.startToastingAnims(this, toaster.y - 50, 200), this.startToastingAnims(lever, toaster.y + toaster.height / 3.5, 250)]);

            // We use await to make sure changeTexture has finished running before we execute any more code
            await this.changeTexture(loader, toaster.setting);

            // Tween the toast popping out of the toaster here
            await Promise.all([this.finToastingBread(this, toaster.y - 250), this.finToastingLever(lever, toaster.y - 50)]);
            toaster.texture = loader.resources['toaster_up'].texture;
            this.interactive = true;
        }
    }

    // runs the loop function until the bread has been toasted to the desired setting.
    // https://stackoverflow.com/questions/68362785/can-you-resolve-a-promise-in-an-if-statement/68363299#68363299
    changeTexture(loader, setting){
        let i = 1;
        return new Promise((resolve) => {
            let loop = () =>  { // Using an arrow function to keep context for 'this'
                this.state++;
                this.texture = loader.resources[`bread${this.state}`].texture;
                if (this.state == 6 || i >= setting) resolve();
                else if(i <= setting){
                    i++;
                    setTimeout(loop, 1000);
                }
            };
            setTimeout(loop, 1000);
        });
    }

    startToastingAnims(elem, newPos, time){
        return new Promise((resolve) => {
            let transform = {y: elem.y};
            let popDown = new TWEEN.Tween(transform)
                .to({y: newPos}, time)
                .onUpdate(() => elem.y = transform.y);
            popDown.start();
            resolve();
        });
    }
    finToastingBread(elem, newPos){
        return new Promise((resolve) => {
            let transform = {y: elem.y};
            let popUp = new TWEEN.Tween(transform)
                .to({y: newPos}, 250)
                .onUpdate(() => elem.y = transform.y);

            let fallDown = new TWEEN.Tween(transform)
                .to({y: newPos + 150}, 150)
                .onUpdate(() => elem.y = transform.y);

            popUp.chain(fallDown);
            popUp.start();
            resolve();
        });
    }
    finToastingLever(elem, newPos){
        return new Promise((resolve) => {
            let transform = {y: elem.y};
            let popUp = new TWEEN.Tween(transform)
                .to({y: newPos}, 200)
                .onUpdate(() => elem.y = transform.y);
            popUp.start();
            resolve();
        });
    }
}

class toasterObj extends PIXI.Sprite{
    constructor(x, y, texture){
        super(texture);
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.scale.set(0.8);

        // toasterObj.setting will be set by a dial on the toaster. for now default value is 5
        this.setting = 1;
    }

    changeSetting(dial, loader){
        this.setting = (this.setting + 1) % 6;
        if(this.setting == 0) this.setting += 1;
        dial.texture = loader.resources[`dial${this.setting}`].texture;
    }
}

class knifeObj extends PIXI.Sprite{
    constructor(x, y, texture, parent){
        super(texture);
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.zIndex = 3;
        this.property = parent.property;
        this.parent = parent;
        this.interactive = true;
        this.mousedown = this.dragStart;
        this.mousemove = this.dragMove;
        this.mouseup = this.dragEnd;
        this.dragging = true;
    }

    dragStart(e){
        this.x = e.data.global.x;
        this.y = e.data.global.y;
        this.dragging = true;
    }

    dragMove(e){
        if(this.dragging){
            this.x = e.data.global.x;
            this.y = e.data.global.y;
        }
    }

    dragEnd(bread, loader, plate){
        this.dragging = false;
        if(bread.containsPoint(this)){
            
            bread.property = this.property
            bread.texture = loader.resources[`bread${bread.state}_${this.property}`].texture; 
        }
        plate.interactive = true;
        this.parent.useable = true;;
        this.destroy();
    }
}

class spreadObj extends PIXI.Sprite{
    constructor(x, y, texture, property){
        super(texture);
        this.x = x;
        this.y = y;
        this.property = property;
        this.useable = true;
    }
}

class timerObj extends PIXI.Sprite{
    constructor(x, y, texture, time, loader, parent){
        super(texture);
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.time = time;
        this.state = 'green';
        this.textures = this.getTextures(loader);
    }

    getTextures(loader){
        let array = [];
        for(let i = 1; i <= 9; i++){array.push(loader.resources[`timer_${i}`].texture);}
        return array;
    }
}

class orderData{
    constructor(x, y, toastState, toastSpreads, container){
        this.x = x;
        this.y = y;
        this.toastState = toastState;
        this.toastSpreads = toastSpreads;
        this.container = container
    }
    makeTexture(container, orderTV, loader){
        let toastTexture = `bread${this.toastState}`

        this.toastSprite = new PIXI.Sprite.from(loader.resources[toastTexture].texture);
        this.toastSprite.scale.set(0.5);
        this.toastSprite.anchor.set(0.5);
        this.toastSprite.x = orderTV.x + (orderTV.width / 3);
        this.toastSprite.y = orderTV.y + (orderTV.height / 2);
        this.toastSprite.zIndex = 1;
        container.addChild(this.toastSprite);

        this.spreadSprite = new PIXI.Sprite.from(loader.resources[this.toastSpreads].texture);
        this.spreadSprite.anchor.set(0.5);
        this.spreadSprite.x = this.toastSprite.x + (orderTV.width / 3);
        this.spreadSprite.y = this.toastSprite.y;
        this.spreadSprite.zIndex = 1;
        container.addChild(this.spreadSprite);
    }
    destroy(){
        this.toastSprite.destroy();
        this.spreadSprite.destroy();
    }
}

function init(){
    const div = document.getElementById('game');
    this.app = new PIXI.Application({
        height: 720,
        width: 1280,
        margin: 0,
        backgroundColor: 0x2f9da3
    });
    div.appendChild(this.app.view);

    const _files = [['background', 'background.png'],
                    ['beans', 'beans.png'],
                    ['bread1', 'bread1.png'],
                    ['bread1_beans', 'bread1_beans.png'],
                    ['bread1_butter', 'bread1_butter.png'],
                    ['bread1_nut', 'bread1_nut.png'],
                    ['bread2', 'bread2.png'],
                    ['bread2_beans', 'bread2_beans.png'],
                    ['bread2_butter', 'bread2_butter.png'],
                    ['bread2_nut', 'bread2_nut.png'],
                    ['bread3', 'bread3.png'],
                    ['bread3_beans', 'bread3_beans.png'],
                    ['bread3_butter', 'bread3_butter.png'],
                    ['bread3_nut', 'bread3_nut.png'],
                    ['bread4', 'bread4.png'],
                    ['bread4_beans', 'bread4_beans.png'],
                    ['bread4_butter', 'bread4_butter.png'],
                    ['bread4_nut', 'bread4_nut.png'],
                    ['bread5', 'bread5.png'],
                    ['bread5_beans', 'bread5_beans.png'],
                    ['bread5_butter', 'bread5_butter.png'],
                    ['bread5_nut', 'bread5_nut.png'],
                    ['bread6', 'bread6.png'],
                    ['bread6_beans', 'bread6_beans.png'],
                    ['bread6_butter', 'bread6_butter.png'],
                    ['bread6_nut', 'bread6_nut.png'],
                    ['butter', 'butter.png'],
                    ['choppingBoard', 'chopping_board.png'],
                    ['continue_arrow', 'continue_arrow.png'],
                    ['dial1', 'dial_1.png'],
                    ['dial2', 'dial_2.png'],
                    ['dial3', 'dial_3.png'],
                    ['dial4', 'dial_4.png'],
                    ['dial5', 'dial_5.png'],
                    ['greyBox', 'greyBox.png'],
                    ['knife_beans', 'knife_beans.png'],
                    ['knife_butter', 'knife_butter.png'],
                    ['knife_nut', 'knife_nut.png'],
                    ['loaf', 'loaf.png'],
                    ['nut', 'nut.png'],
                    ['orderTV', 'order_tv.png'],
                    ['timer_1', 'timer_1.png'],
                    ['timer_2', 'timer_2.png'],
                    ['timer_3', 'timer_3.png'],
                    ['timer_4', 'timer_4.png'],
                    ['timer_5', 'timer_5.png'],
                    ['timer_6', 'timer_6.png'],
                    ['timer_7', 'timer_7.png'],
                    ['timer_8', 'timer_8.png'],
                    ['timer_9', 'timer_9.png'],
                    ['plate', 'plate.png'],
                    ['toaster_down', 'toaster_down.png'],
                    ['lever', 'toaster_lever.png'],
                    ['toaster_up', 'toaster.png'],
                    ['tutorial_bread', 'tutorial_bread.png'],
                    ['tutorial_chopping_board', 'tutorial_chopping_board.png'],
                    ['tutorial_plate', 'tutorial_plate.png'],
                    ['tutorial_spread_2', 'tutorial_spread_2.png'],
                    ['tutorial_spread', 'tutorial_spread.png'],
                    ['tutorial_toaster', 'tutorial_toaster.png'],
                    ['x_dark', 'x_dark.png'],
                    ['x_light', 'x_light.png']];

    this.loader = new PIXI.Loader("../assets");
    for(const file of _files){this.loader.add(file[0], file[1]);}
    this.loader.onProgress.add(function(e){console.log(e.progress);});
    this.loader.onError.add(function(e){console.error(`ERR: ${e.message}`);});
    this.loader.onComplete.add(onReady.bind(this));
    this.loader.load();

    this.app.ticker.add(animate.bind(this));
}

function onReady(){
    // This function will make a menu container that will then contain all the elems for the main menu,
    // this container will get destroyed when enetering the game.

    this.textStyle = {
        fill: "#c09947",
        fontFamily: 'Arial',
        fontSize: 0,
        align: 'left',
        lineJoin: "round",
        stroke: "#694329",
        strokeThickness: 20 
    }

    const background = new PIXI.Sprite.from(this.loader.resources.background.texture);
    background.zIndex = 0;
    this.app.stage.addChild(background);

    const menu = new PIXI.Container();
    this.app.stage.addChild(menu);

    const menuContainer = new PIXI.Sprite.from(this.loader.resources.greyBox.texture);
    menuContainer.anchor.set(0.5);
    menuContainer.position.set((background.x + background.width / 2), (background.y + background.height / 2));
    menu.addChild(menuContainer);

    this.textStyle.fontSize = 122;
    const logo = new PIXI.Text('ToastR', this.textStyle);
    logo.anchor.set(0.5);
    logo.fontSize = 122;
    logo.x = menuContainer.x;
    logo.y = (menuContainer.y - menuContainer.height / 2) + logo.height;
    menu.addChild(logo)

    this.textStyle.fontSize = 90;
    const playButton = new PIXI.Text('Play Now', this.textStyle);
    playButton.anchor.set(0.5);
    playButton.position.set(menuContainer.x, menuContainer.y);
    playButton.interactive = true;
    playButton.mousedown = () => {
        menu.destroy();
        mainGame.bind(this)();
    }
    menu.addChild(playButton);

    const tutorialButton = new PIXI.Text('How to Play', this.textStyle);
    tutorialButton.anchor.set(0.5);
    tutorialButton.position.set(playButton.x, playButton.y + tutorialButton.height * 1.5);
    tutorialButton.interactive = true;
    tutorialButton.mousedown = () => {
        menu.destroy();
        background.destroy();
        tutorial.bind(this)();
    };
    menu.addChild(tutorialButton);
}

function tutorial(){
    // gonna use images of the game scene with arrows and such, using the PIXI.Text feature to create the text;

    let currentScene = {
        elem: null,
        number: 0,
        continueButton: null
    };

    const tutorialCont = new PIXI.Container();
    this.app.stage.addChild(tutorialCont);

    let renderElem = function(image, x, y, scene = true){
        const elem = new PIXI.Sprite.from(image);
        elem.anchor.set(0.5);
        elem.x = x;
        elem.y = y;
        tutorialCont.addChild(elem);

        if(scene){
            elem.zIndex = 0;
            currentScene.elem = elem;
            currentScene.number++;
        } else{
            elem.zIndex = 1;
            return elem;
        }

    }

    let nextScene = () => {
        if(currentScene.elem != null && currentScene.continueButton != null){
            currentScene.elem.destroy();
            currentScene.continueButton.destroy();
        }
        switch(currentScene.number){
            case 1:
                renderElem(this.loader.resources.tutorial_toaster.texture, this.app.view.width / 2, this.app.view.height / 2);
                currentScene.continueButton = renderConinueButton();
                break;
            case 2:
                renderElem(this.loader.resources.tutorial_chopping_board.texture, this.app.view.width / 2, this.app.view.height / 2);
                currentScene.continueButton = renderConinueButton();
                break;
            case 2:
                renderElem(this.loader.resources.tutorial_spread.texture, this.app.view.width / 2, this.app.view.height / 2);
                currentScene.continueButton = renderConinueButton();
                break;
            case 3:
                renderElem(this.loader.resources.tutorial_spread_2.texture, this.app.view.width / 2, this.app.view.height / 2);
                currentScene.continueButton = renderConinueButton();
                break;
            case 4:
                renderElem(this.loader.resources.tutorial_plate.texture, this.app.view.width / 2, this.app.view.height / 2);
                const backToMenu = new PIXI.Text('Back to Menu', this.textStyle);
                backToMenu.anchor.set(0.5);
                backToMenu.position.set(this.app.view.width / 2, this.app.view.height - backToMenu.height / 2);
                backToMenu.interactive = true;
                backToMenu.mousedown = () => {
                    tutorialCont.destroy();
                    onReady.bind(this)();
                }
                tutorialCont.addChild(backToMenu);
                break;
            default:
                renderElem(this.loader.resources.tutorial_bread.texture, this.app.view.width / 2, this.app.view.height / 2);
                currentScene.continueButton = renderConinueButton();
                break;
        }
    }

    let renderConinueButton = () => {
        const continueButton = renderElem(this.loader.resources.continue_arrow.texture, (this.app.view.width / 64) * 61, this.app.view.height / 2, false);
        continueButton.interactive = true;
        continueButton.mousedown = () => nextScene()
        return continueButton;
    }

    nextScene();
}

function mainGame(){
    let chanceIndicators = [];
    let breadInteracts = [];
    this.spreads = [];

    this.score = 0;
    this.chances = 3;

    this.game = new PIXI.Container()
    this.game.sortableChildren = true;
    this.app.stage.addChild(this.game);

    // Need to make new container to put all the game elems and containers into
    const orderTV = new PIXI.Sprite.from(this.loader.resources.orderTV.texture);
    orderTV.position.set(orderTV.width / 4, orderTV.height / 4);
    this.game.addChild(orderTV);

    this.textStyle.fontSize = 62
    this.scoreText = new PIXI.Text(`Score: ${this.score}`, this.textStyle);
    this.scoreText.anchor.set(0.5);
    this.scoreText.x = 0 + this.scoreText.width / 2;
    this.scoreText.y = 0 + this.scoreText.height / 2;
    this.game.addChild(this.scoreText);

    // There will be 3 chance indicators. one will light up each time a mistake is made to show the player how many chances they have
    const chanceIndicator = new PIXI.Sprite.from(this.loader.resources.x_dark.texture);
    chanceIndicator.scale.set(0.7);
    chanceIndicator.x = this.app.view.width - (chanceIndicator.width * 1.5);
    chanceIndicator.y = chanceIndicator.height / 4;
    this.game.addChild(chanceIndicator);
    chanceIndicators.push(chanceIndicator);

    const chanceIndicator2 = new PIXI.Sprite.from(this.loader.resources.x_dark.texture);
    chanceIndicator2.scale.set(0.7);
    chanceIndicator2.x = chanceIndicator.x - (chanceIndicator2.width * 1.5)
    chanceIndicator2.y = chanceIndicator.y;
    this.game.addChild(chanceIndicator2);
    chanceIndicators.push(chanceIndicator2);
    
    const chanceIndicator3 = new PIXI.Sprite.from(this.loader.resources.x_dark.texture);
    chanceIndicator3.scale.set(0.7);
    chanceIndicator3.x = chanceIndicator2.x - (chanceIndicator3.width * 1.5);
    chanceIndicator3.y = chanceIndicator2.y;
    this.game.addChild(chanceIndicator3);
    chanceIndicators.push(chanceIndicator3);

    const toaster = new toasterObj((this.app.view.height / 20) * 5, this.app.view.height - this.loader.resources.toaster_up.texture.height / 2, this.loader.resources.toaster_up.texture);
    toaster.zIndex = 3;
    this.game.addChild(toaster);
    breadInteracts.push(['toaster', toaster]);

    const lever = new PIXI.Sprite.from(this.loader.resources['lever'].texture);
    lever.x = (toaster.x - toaster.width / 2) + lever.width / 1.2;
    lever.y = toaster.y - toaster.height / 4;
    lever.zIndex = 3;
    this.game.addChild(lever);

    const loaf = new PIXI.Sprite.from(this.loader.resources.loaf.texture);
    loaf.scale.set(0.8);
    loaf.position.set((this.app.view.width - (loaf.width * 2)) / 2, (this.app.view.height / 1.75) - loaf.height / 2);
    loaf.interactive = true;
    loaf.mousedown = (e) => this.bread = makeBread.bind(this)(this.game, breadInteracts, this.spreads, lever, e);
    this.game.addChild(loaf);

    const choppingBoard = new PIXI.Sprite.from(this.loader.resources.choppingBoard.texture);
    choppingBoard.position.set((this.app.view.width / 2), this.app.view.height / 1.4);
    this.game.addChild(choppingBoard);
    breadInteracts.push(['choppingBoard', choppingBoard]);

    const plate = new PIXI.Sprite.from(this.loader.resources['plate'].texture);
    plate.x = this.app.view.width / 1.5;
    plate.y = (this.app.view.height / 5) * 1.75;
    plate.mousemove = () => checkScore.bind(this)(plate, orderTV, loaf, chanceIndicators);
    this.game.addChild(plate);

    const butter = new spreadObj(choppingBoard.x, this.app.view.height / 2, this.loader.resources.butter.texture, 'butter');
    butter.mousedown = (e) => this.knife = spawnKnife.bind(this)(this.game, butter, plate, e); 
    this.game.addChild(butter);
    this.spreads.push(['butter', butter]);

    const nut = new spreadObj(butter.x * 1.2, butter.y, this.loader.resources.nut.texture, 'nut');
    nut.mousedown = (e) => this.knife = spawnKnife.bind(this)(this.game, nut, plate, e);
    this.game.addChild(nut);
    this.spreads.push(['nut', nut]);

    const beans = new spreadObj(nut.x * 1.2, butter.y, this.loader.resources.beans.texture, 'beans');
    beans.mousedown = (e) => this.knife = spawnKnife.bind(this)(this.game, beans, plate, e);
    this.game.addChild(beans);
    this.spreads.push(['beans', beans]);

    const dial = new PIXI.Sprite.from(this.loader.resources['dial1'].texture);
    dial.anchor.set(0.5);
    dial.x = toaster.x;
    dial.y = toaster.y + dial.height / 2;
    dial.zIndex = 4;
    dial.interactive = true;
    dial.mousedown = () => toaster.changeSetting(dial, this.loader);
    this.game.addChild(dial);

    this.timer = new timerObj(orderTV.x, orderTV.y, this.loader.resources.timer_1.texture, 60, this.loader);
    this.game.addChild(this.timer);

    toaster.mousedown = () => this.bread.makeToast(this.loader, toaster, lever);
    lever.mousedown = () => this.bread.makeTexture(this.loader, toaster, lever);

    makeOrder.bind(this)(orderTV, chanceIndicators);
}

function makeBread(container, breadElems, spreads, lever, e){
    if(this.bread){
        this.bread.destroy();
        this.score -= 10;
        this.scoreText.text = `Score: ${this.score}`
        this.scoreText.x = (0 + this.scoreText.width / 2); + this.score;
    }
    const bread = new breadObj(e.data.global.x, e.data.global.y, this.loader.resources['bread1'].texture);
    bread.mousedown = bread.dragStart;
    bread.mousemove = bread.dragMove;
    bread.mouseup = () => bread.dragEnd(breadElems, spreads, lever)
    container.addChild(bread);
    return bread;
}

function spawnKnife(container, spread, plate,e){
    if(this.knife == undefined){
        const knife = new knifeObj(e.data.global.x, e.data.global.y, this.loader.resources[`knife_${spread.property}`].texture, spread);
        container.addChild(knife);
        spread.useable = false;
        if(this.bread != undefined) knife.mouseup = () => knife.dragEnd(this.bread, this.loader, plate);
        return knife
    }
}

function makeOrder(orderTV, chanceIndicators){
    let randNumSpreads = (Math.floor(Math.random() * this.spreads.length));
    let randNumState = (Math.floor(Math.random() * 5)) + 2;    

    this.order = new orderData(orderTV.x, orderTV.y, randNumState, this.spreads[randNumSpreads][0], this.loader, this.game);
    this.order.makeTexture(this.game, orderTV, this.loader);

    timerStart.bind(this)(chanceIndicators, orderTV);
}

function timerStart(chanceIndicators, orderTV){                                                
    let loopMax = this.timer.textures.length - 1                                           
    let loopCounter = 0;                                                       
    let loop = () => {
        this.timer.texture = this.timer.textures[loopCounter];
        switch(loopCounter){
            case 6:
                this.timer.state = 'yellow';
                break;
            case 8:
                this.timer.state = 'red'
                break;
            default: break;
        }

        if(loopCounter == loopMax) endRound.bind(this)(chanceIndicators, orderTV);
        else if(loopCounter <= loopMax) {
            this.timerLoop = setTimeout(loop, (this.timer.time / loopMax) * 1000);
            loopCounter++;
        }
    }
    loop();
    
}

function checkScore(plate = null, orderTV = null, loaf = null, chanceIndicators = null){
    let updateScoreText = () => {
        this.scoreText.text = `Score: ${this.score}`
        this.scoreText.x = (0 + this.scoreText.width / 2); + this.score;
    }
    if(this.bread != undefined && plate){
        if(plate.containsPoint(this.bread) && this.bread.dragging == false){

            if(this.bread.state == this.order.toastState){
                this.score += 80;  
            } 
            else if(this.bread.state == this.order.toastState - 1 || this.bread.state == this.order.toastState + 1) this.score += 40
            else changeChanceIndicator.bind(this)(chanceIndicators);

            if(this.bread.property == this.order.toastSpreads) this.score += 40;
            else changeChanceIndicator.bind(this)(chanceIndicators);

            this.bread.destroy();
            this.bread = undefined;
            this.order.destroy();
            plate.interactive = false;
            updateScoreText();
            
            clearTimeout(this.timerLoop);
            let scoreFirstNum = this.score.toString()[0]
            console.log(scoreFirstNum / 5);
            if(scoreFirstNum / 5 == 1 && this.timer.time >= 20) this.timer.time -= 10;
            console.log(this.timer.time);

            if(this.chances <= 0) endGame.bind(this)();
            else setTimeout( () => makeOrder.bind(this)(orderTV), 1000);
        }
    }
    
}

function endRound(chanceIndicator, orderTV){
    this.timer.texture = this.loader.resources.timer_9.texture;
    if(this.bread || this.bread != null) this.bread.destroy();
    this.order.destroy();
    changeChanceIndicator.bind(this)(chanceIndicator);
    if(this.chances <= 0){
        endGame.bind(this)();
    }
    else setTimeout(makeOrder.bind(this)(orderTV, chanceIndicator), 1000);
}

function changeChanceIndicator(chanceIndicators){
    this.chances -= 1;
    if(this.chances >= 0)chanceIndicators[this.chances].texture = this.loader.resources.x_light.texture;
}

function endGame(){
    this.game.interactive = false;

    const popupCont = new PIXI.Container;
    this.app.stage.addChild(popupCont);

    const background = new PIXI.Graphics()
    background.beginFill(0xADD8E6);
    background.drawRoundedRect(0, 0, 1280, 720, 90);
    background.position.x = (this.app.view.width / 2) - (background.width / 2);
    background.position.y = (this.app.view.height / 2) - (background.height / 2);
    popupCont.addChild(background);

    const gameOverText = new PIXI.Text('GAME OVER', {fontFamily: 'Arial', fontSize: 62, fill: 0x000000, align: 'center'});
    gameOverText.anchor.set(0.5);
    gameOverText.x = background.x + background.width / 2;
    gameOverText.y = background.y + gameOverText.height;
    popupCont.addChild(gameOverText);

    const scoreText = new PIXI.Text(`Your score: \n${this.score}`, {fontSize: 62, align: 'center'});
    scoreText.anchor.set(0.5);
    scoreText.x = background.x + background.width / 2;
    scoreText.y = background.y + background.height / 2;
    popupCont.addChild(scoreText);

    const restartButton = new PIXI.Graphics()
    restartButton.beginFill(0x63B4CF);
    restartButton.drawRoundedRect(0, 0, 500, 150, 90);
    restartButton.position.x = background.x + (background.width / 2 - restartButton.width / 2);
    restartButton.position.y = (background.y + background.height) - (restartButton.height * 1.25);
    restartButton.interactive = true;
    restartButton.mousedown = () => {
        this.game.destroy();
        popupCont.destroy();
        onReady.bind(this)();
    }
    popupCont.addChild(restartButton);

    const restartText = new PIXI.Text(`Restart`, {fontSize: 62, align: 'center'});
    restartText.anchor.set(0.5);
    restartText.x = restartButton.x + restartButton.width / 2;
    restartText.y = restartButton.y + restartButton.height / 2;
    popupCont.addChild(restartText);
}

function animate(){TWEEN.update(this.app.ticker.lastTime);}

document.addEventListener('DOMContentLoaded', init);
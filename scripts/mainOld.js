// TODO UPGRADE STORE:  
//                      Upgrade score screen:
//                         - Dark grey border, grey box.
//                         - icon for each upgrade
//                         - upgrades cost score
//                      spreading mechanic
//                         - have to spread 3 times originally, 2 times with one upgrade, 1 time with final
//                         - bigger knife for upgrade
//                      crumb tray
//                          - have to empty every 3-4 rounds with one upgrade has 50% chance of breaking and ending the game 5 90% cahnce and 6 100% chance.
//                          - 5-6, 7 and 8 rounds with one upgrade. it carries on sequentially like this.
//                          - deeper crumb tray for upgrade
//                      double score
//                          - player gets double score for 2 minutes. this is available forever but the price triples each time and it decreases by 30s
//                      higher quality bread
//                          - this increases the score of the bread permenantly by 20 with each upgrade. this increases forever.
//                      higher quality spreads
//                          - same as bread
//                      comment
//      
// 

/**
 * Class representing a bread object
 * @extends PIXI.Sprite
 */
 class breadObj extends PIXI.Sprite {
    /**
     * Create a piece of bread
     * 
     * @param {number} x                X position of bread
     * @param {number} y                Y position of bread
     * @param {PIXI.Texture} texture    Bread texture
     */
    constructor(x = 0, y = 0, texture, bonus = 0){
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
        this.bonus = bonus;
    }

    /** Start dragging the bread, set dragging to true so it doesnt move when the mouse does.
     * 
     * @alias breadObj.dragStart
     * 
     * @param {object} e mouse data
     * @returns null
     */
    dragStart(e){
        this.x = e.data.global.x;
        this.y = e.data.global.y;
        this.dragging = true;
    }

    /** Drag the bread with the mouse if dragging state is true
     * 
     * @alias breadObj.dragMove
     * 
     * @param {object} e mouse data
     * @returns null
     */
    dragMove(e){
        if(this.dragging){
            this.x = e.data.global.x;
            this.y = e.data.global.y;
        }
    }

    /** Stop dragging the bread
     * 
     * Stop dragging the bread and check to see if anything should be interactive
     * 
     * @alias breadObj.dragEnd
     * 
     * @param {array} elems     all game elements that depend on bread position to be interactive
     * @param {array} spreads   the toppings for toast
     * 
     * @returns null
     */
    dragEnd(elems, spreads){
        /**
         * Set spreads interactive state
         * 
         * @alias breadObj.dragEnd~spreadsInteractive
         * @alias breadObj.dragEnd~spreadsUninteractive
         * 
         * @returns null
         */
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

    /** Start toasting functions
     * 
     * sets object to not interactive, changes the x and y and starts the 
     * animations for toasting. when the animations are finished it stops toasting
     * and pops out the toaster.
     * 
     * @alias breadObj.makeToast
     * 
     * @param {PIXI.Loader} loader  the pixi Loader containing the game files
     * @param {toasterObj}  toaster the toaster object from the game
     * @param {PIXI.Sprite} lever   PIXI lever object from the game
     * @param {PIXI.Sprite} loaf    PIXI loaf object from the game
     * 
     * @returns null
     */
    async makeToast(loader, toaster, lever, loaf){
        if(this.state != 6){
            this.interactive = false;
            this.x = toaster.x;
            this.y = toaster.y - toaster.height / 1.5;

            // Runs both functions at once
            await Promise.allSettled([this.startToastingAnims(this, toaster.y - 50, 200), this.startToastingAnims(lever, toaster.y + toaster.height / 3.5, 250)]);

            // We use await to make sure changeTexture has finished running before we execute any more code
            await this.changeTexture(loader, toaster.setting, toaster.time);

            // Tween the toast popping out of the toaster here
            await Promise.all([this.finToastingBread(this, toaster.y - 250), this.finToastingLever(lever, toaster.y - toaster.height / 4)]);
            toaster.texture = loader.resources['toaster_up'].texture;
            this.interactive = true;
            loaf.interactive = true;
        }
    }

    /**
     * Change texture of bread
     * 
     * Using a loop and setTimeout function we change the texture of the bread 
     * to the desired setting of the toaster 
     * 
     * @alias breadObj.changeTexture
     * 
     * @param {PIXI.Loader} loader  PIXI loader containg all the game files
     * @param {number}      setting Toaster setting
     * 
     * @returns promise
     */
    changeTexture(loader, setting, time){
        let i = 1;
        console.log(time);
        return new Promise((resolve) => {
            let loop = () =>  { // Using an arrow function to keep context for 'this'
                this.state++;
                this.texture = loader.resources[`bread${this.state}`].texture;
                if (this.state == 6 || i >= setting) resolve();
                else if(i <= setting){
                    i++;
                    setTimeout(loop, time);
                }
            };
            this.timerLoop = setTimeout(loop, time);
        });
    }

    /**
     * Start the toasting animations
     * 
     * @alias breadObj.startToastingAnims
     * 
     * @param {object} elem   Element that is being animated
     * @param {number} newPos new position of element
     * @param {number} time   amount of time for animation
     * 
     * @returns promise
     */
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

    /**
     * Finish toasting animations
     * 
     * bread has two so the toast pops up then down
     * 
     * @alias breadObj.finToastingBread
     * @alias breadObj.finToastingLever
     * 
     * @param {object} elem   element to be moved
     * @param {number} newPos new position of element
     * 
     * @returns promise
     */
    finToastingBread(elem, newPos){
        return new Promise((resolve) => {
            let transform = {y: elem.y};
            this.popUp = new TWEEN.Tween(transform)
                .to({y: newPos}, 250)
                .onUpdate(() =>elem.y = transform.y);

            let fallDown = new TWEEN.Tween(transform)
                .to({y: newPos + 150}, 150)
                .onUpdate(() => elem.y = transform.y);

            this.popUp.chain(fallDown);
            this.popUp.start();
            
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
        this.upgradeState = 0;
        this.setting = 1;
        this.time = 3000
    }

    changeSetting(dial, loader){
        this.setting = (this.setting + 1) % 6;
        if(this.setting == 0) this.setting += 1;
        dial.texture = loader.resources[`dial${this.setting}`].texture;
    }

    upgrade(){
        this.time -= 500;
        this.upgradeState++;
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
        this.bonus = 0;
    }
}

class timerObj extends PIXI.Sprite{
    constructor(x, y, texture, time, loader, parent){
        super(texture);
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.time = time;
        this.remaining = time;
        this.timeout;
        this.state = 'green';
        this.textures = this.getTextures(loader);
    }

    getTextures(loader){
        let array = [];
        for(let i = 1; i <= 9; i++){array.push(loader.resources[`timer_${i}`].texture);}
        return array;
    }
}

class upgradeStore{
    constructor(loader, x, y, app, upgradeableItems){
        this.loader = loader;

        let textStyle = {
            fill: "#c09947",
            fontFamily: 'Arial',
            fontSize: 30,
            align: 'left',
            lineJoin: "round",
            stroke: "#694329",
            strokeThickness: 10 
        }

        this.upgrades = [];

        this.cont = new PIXI.Container();
        this.cont.scale.set(0);
        app.stage.addChild(this.cont);

        const background = new PIXI.Sprite.from(this.loader.resources.shop_background.texture);
        background.scale.set(0.5);
        background.anchor.set(0.5);
        background.position.set(x, y);
        this.cont.addChild(background);

        const exitButton = new PIXI.Sprite.from(this.loader.resources.x_light.texture);
        exitButton.anchor.set(1, 0);
        exitButton.scale.set(0.75);
        exitButton.position.set(background.x + background.width / 2, background.y - background.height / 2);
        exitButton.interactive = true;
        exitButton.mousedown = () => this.popDown();
        this.cont.addChild(exitButton)

        const logo = new PIXI.Text("Jimy's Upgrade Store", textStyle);
        logo.anchor.set(0.5);
        logo.x = background.width / 1.5;
        logo.y = background.height / 3.5;
        this.cont.addChild(logo);
        textStyle.fontSize = 30;

        this.toasterUpgrade = new upgrade(background.width / 3, background.height / 2, 5, upgradeableItems[0][1], loader.resources.toaster_up.texture, 100, textStyle, this.cont, `Faster Toaster`);
        this.upgrades.push(['toaster', this.toasterUpgrade]);

        this.bread ={
            upgradeState: 0,
            upgrade: function(){this.upgradeState++;}
        }
        this.breadUpgrade = new upgrade(background.width / 3, background.height, 5, this.bread, loader.resources.bread1.texture, 100, textStyle, this.cont, `Higher quality bread`);


        //this.popUp()
    }

    popUp(){
        let tranform = {scale: 0};
        const anim = new TWEEN.Tween(tranform)
            .to({scale: 1}, 200)
            .onUpdate(() => this.cont.scale.set(tranform.scale));
        anim.start();
    }
    popDown(){
        let transform = {scale: 1};
        const anim = new TWEEN.Tween(transform)
            .to({scale: 0}, 200)
            .onUpdate(() => this.cont.scale.set(transform.scale));
        anim.start();
    }
}

class upgrade{
    constructor(x, y, maxState, upgrades, texture, cost, textStyle, upgradeStoreCont, ID){
        this.x = x;
        this.y = y;
        this.maxState = maxState;
        this.upgrades = upgrades;
        this.icon = texture;
        this.cost = cost;
        this.currentState = 0;
        this.ID = ID;

        const container = new PIXI.Container();
        upgradeStoreCont.addChild(container);

        this.icon = new PIXI.Sprite.from(this.icon);
        this.icon.anchor.set(0.5)
        this.icon.scale.set(0.5)
        this.icon.position.set(this.x, this.y);
        this.icon.interactive = true;
        console.log(mainGame.score); 
        this.icon.mousedown = () => {
            if(this.upgrades.upgradeState != this.maxState && mainGame.score >= this.cost){
                mainGame.score -= this.cost;
                this.upgrades.upgrade();
                this.cost = Math.floor(this.cost * 1.5);
                this.currentState++;
                this.updateStateText();
                this.updateCostText();
            }
        }
        container.addChild(this.icon);

        this.upgradeTitle = new PIXI.Text(this.ID, textStyle);
        this.upgradeTitle.anchor.set(0, -1);
        this.upgradeTitle.position.set(this.icon.x + this.upgradeTitle.width / 2, this.icon.y - this.icon.height);
        container.addChild(this.upgradeTitle);

        this.stateText = new PIXI.Text(`${this.currentState}/${this.maxState}`, textStyle);
        this.stateText.anchor.set(0, 0.5);
        this.stateText.position.set(this.icon.x + this.icon.width, this.icon.y + this.stateText.height / 2);
        container.addChild(this.stateText);

        this.costText = new PIXI.Text(`$${this.cost}`, textStyle);
        this.costText.anchor.set(0.5);
        this.costText.position.set(this.x, this.y);
        container.addChild(this.costText);
    }

    updateStateText(){this.stateText.text = `${this.upgrades.upgradeState}/${this.maxState}`;}
    updateCostText(){this.costText.text = `$${this.cost}`;}
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

/**
 * Initialise the game app and load files for game.
 * 
 * This function creates the PIXI App and uses the PIXI Loader to pre load in the
 * game files. When the loader has finished loading in all files it runs the
 * onReady function and logs Loader errors to the console.
 * 
 * @returns null
 */

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
                    ['bread1_peanut', 'bread1_peanut.png'],
                    ['bread2', 'bread2.png'],
                    ['bread2_beans', 'bread2_beans.png'],
                    ['bread2_butter', 'bread2_butter.png'],
                    ['bread2_nut', 'bread2_nut.png'],
                    ['bread2_peanut', 'bread2_peanut.png'],
                    ['bread3', 'bread3.png'],
                    ['bread3_beans', 'bread3_beans.png'],
                    ['bread3_butter', 'bread3_butter.png'],
                    ['bread3_nut', 'bread3_nut.png'],
                    ['bread3_peanut', 'bread3_peanut.png'],
                    ['bread4', 'bread4.png'],
                    ['bread4_beans', 'bread4_beans.png'],
                    ['bread4_butter', 'bread4_butter.png'],
                    ['bread4_nut', 'bread4_nut.png'],
                    ['bread4_peanut', 'bread4_peanut.png'],
                    ['bread5', 'bread5.png'],
                    ['bread5_beans', 'bread5_beans.png'],
                    ['bread5_butter', 'bread5_butter.png'],
                    ['bread5_nut', 'bread5_nut.png'],
                    ['bread5_peanut', 'bread5_peanut.png'],
                    ['bread6', 'bread6.png'],
                    ['bread6_beans', 'bread6_beans.png'],
                    ['bread6_butter', 'bread6_butter.png'],
                    ['bread6_nut', 'bread6_nut.png'],
                    ['bread6_peanut', 'bread6_peanut.png'],
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
                    ['knife_peanut', 'knife_peanut.png'],
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
                    ['peanut_butter', 'peanut_butter.png'],
                    ['plate', 'plate.png'],
                    ['shop_background', 'shop_background.png'],
                    ['shopping_cart', 'shopping_cart.png'],
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

/**
 * Summary: Creates the game's main menu with menu elements  to progress to the game or tutorial.
 * 
 *This function uses PIXI Containers to make a menu container that holds menu elements.
 *These elements have callback functions to progress to the game or the tutorial.
 *When this is done the menu container is destroyed.
 * 
 * @returns null
 */
function onReady(){
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
    /** Function fires when user clicks on playbutton element, it then destroys the menu
     *  container and runs the mainGame function
     * @alias onReady~playButton.mousedown
     * @returns null
     */
    playButton.mousedown = () => {
        menu.destroy();
        mainGame.bind(this)();
    }
    menu.addChild(playButton);

    const tutorialButton = new PIXI.Text('How to Play', this.textStyle);
    tutorialButton.anchor.set(0.5);
    tutorialButton.position.set(playButton.x, playButton.y + tutorialButton.height * 1.5);
    tutorialButton.interactive = true;
    /** Function fires when user clicks on tutorialButton element, it then destroys the
     *  menu container and runs the mainGame function.
     * @alias onReady~tutorialButton.mousedown
     * @returns null
     */
    tutorialButton.mousedown = () => {
        menu.destroy();
        background.destroy();
        tutorial.bind(this)();
    };
    menu.addChild(tutorialButton);
}

/**
 * This function contains the tutorial game scene.
 * 
 * This function uses a scene object variable and other functions to display
 * different images of the game. The scene also has a continue arrow that displays
 * the next image.
 * 
 * @alias tutorial
 * 
 * @returns null
 */
function tutorial(){
    let currentScene = {
        elem: null,
        number: 0,
        continueButton: null
    };

    const tutorialCont = new PIXI.Container();
    this.app.stage.addChild(tutorialCont);

    /**
     * Render a given element to the PIXI app and return the element.
     * 
     * @alias tutorial~renderElem
     * 
     * @param   {PIXI.Texture}  image         The PIXI.Texture of the current tutorial image
     * @param   {number}        x             The desired X position of the Image object
     * @param   {number}        y             The desired Y position of the Image Object 
     * @param   {boolean}       scene = true  Wether the desired image to be rendered is a new Scene or not
     * 
     * @returns {object}                      The Scene element
     */
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

    /**
     * Deletes the current tutorial scene and calls the tutorial~renderElem function to render next.
     * 
     * Using a switch statement and the number property of the scene object, this function
     * gets which tutorial scene should be next, calls for said scene to be rendered,
     * and then deletes the current scene.
     * 
     * @alias tutorial~nextScene
     * 
     * @returns null
     */
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

    /**
     * Render continue button to screen
     * 
     * @alias tutorial~renderConinueButton
     * 
     * @returns PIXI.Sprite object
     */
    let renderConinueButton = () => {
        const continueButton = renderElem(this.loader.resources.continue_arrow.texture, (this.app.view.width / 64) * 61, this.app.view.height / 2, false);
        continueButton.interactive = true;
        continueButton.mousedown = () => nextScene()
        return continueButton;
    }

    nextScene();
}

/**
 * Contains the main game element creation and logic
 * 
 * This function creates all the game elements along with all their callbacks. it does
 * this all within a pixi container so that can be destroyed when the game is over.
 * 
 * @returns null
 */
function mainGame(){
    let chanceIndicators = [];
    let breadInteracts = [];
    let upgradeableItems = [];
    this.spreads = [];

    this.score = 0;
    this.chances = 3;

    this.game = new PIXI.Container()
    this.game.sortableChildren = true;
    this.app.stage.addChild(this.game);

    const orderTV = new PIXI.Sprite.from(this.loader.resources.orderTV.texture);
    orderTV.position.set(orderTV.width / 4, orderTV.height / 4);
    this.game.addChild(orderTV);

    this.textStyle.fontSize = 62
    this.scoreText = new PIXI.Text(`$: ${this.score}`, this.textStyle);
    this.scoreText.anchor.set(0.5);
    this.scoreText.x = 0 + this.scoreText.width / 2;
    this.scoreText.y = 0 + this.scoreText.height / 2;
    this.game.addChild(this.scoreText);

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
    upgradeableItems.push(['toaster', toaster]);

    const lever = new PIXI.Sprite.from(this.loader.resources['lever'].texture);
    lever.x = (toaster.x - toaster.width / 2) + lever.width / 1.2;
    lever.y = toaster.y - toaster.height / 4;
    lever.zIndex = 3;
    this.game.addChild(lever);

    const loaf = new PIXI.Sprite.from(this.loader.resources.loaf.texture);
    loaf.scale.set(0.8);
    loaf.position.set((this.app.view.width - (loaf.width * 2)) / 2, (this.app.view.height / 1.75) - loaf.height / 2);
    loaf.interactive = true;

    /** Creates a new bread object
     * 
     * If a piece of bread already exists this function stops its animations and
     * then creates a new piece of bread which is set to the global scope variable 
     * 'this.bread'.
     * 
     * @alias mainGame~loaf.mousedown
     * 
     * @param {object} e Mouse data
     * @returns null
     */
    loaf.mousedown = (e) =>{
        if(this.bread){
            if(this.bread.popUp) this.bread.popUp.stop();
            this.bread.finToastingLever(lever, toaster.y - toaster.height / 4);
            toaster.texture = this.loader.resources.toaster_up.texture
        }
        this.bread = makeBread.bind(this)(this.game, breadInteracts, this.spreads, lever, e);
    }
    this.game.addChild(loaf);


    // add moseOver and mouseExit events to chopping board so that it can make spreads interactive when bread is in place
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

    const nut = new spreadObj(butter.x + butter.width * 1.2, butter.y, this.loader.resources.nut.texture, 'nut');
    nut.mousedown = (e) => this.knife = spawnKnife.bind(this)(this.game, nut, plate, e);
    this.game.addChild(nut);
    this.spreads.push(['nut', nut]);

    const beans = new spreadObj(nut.x + butter.width * 1.2, butter.y, this.loader.resources.beans.texture, 'beans');
    beans.mousedown = (e) => this.knife = spawnKnife.bind(this)(this.game, beans, plate, e);
    this.game.addChild(beans);
    this.spreads.push(['beans', beans]);

    const peanut = new spreadObj(beans.x + butter.width * 1.2, butter.y, this.loader.resources.peanut_butter.texture, 'peanut');
    peanut.mousedown = (e) => this.knife = spawnKnife.bind(this)(this.game, peanut, plate, e);
    this.game.addChild(peanut);
    this.spreads.push(['peanut_butter', peanut]);

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

    this.upgradeStore = this.upgradeStore = new upgradeStore(this.loader, this.app.view.width / 2, this.app.view.height / 2, this.app, upgradeableItems);
    this.upgradeStore = this.upgradeStore = new upgradeStore(this.loader, this.app.view.width / 2, this.app.view.height / 2, this.app, upgradeableItems);

    shoppingCart = new PIXI.Sprite.from(this.loader.resources.shopping_cart.texture);
    shoppingCart.anchor.set(1);
    shoppingCart.position.set(this.app.view.width - shoppingCart.width / 10, this.app.view.height - shoppingCart.height / 5);
    shoppingCart.interactive = true;
    shoppingCart.mousedown = () => this.upgradeStore.popUp();
    this.game.addChild(shoppingCart);

    /** Starts the toasting process for bread
     * 
     * Changes the texture of the toaster and sets itself and the loaf object to non interactive.
     * It then calls the bread.makeToast function
     * 
     * @alias mainGame~toaster.mousedown
     * @alias mainGame~lever.mousedown
     * 
     * @returns null
     */
    toaster.mousedown = () =>{
        toaster.texture = this.loader.resources['toaster_down'].texture;
        toaster.interactive = false;
        loaf.interactive = false;
        this.bread.makeToast(this.loader, toaster, lever, loaf);
    }
    lever.mousedown = () =>{
        toaster.texture = this.loader.resources['toaster_down'].texture;
        toaster.interactive = false;
        loaf.interactive = false;
        this.bread.makeToast(this.loader, toaster, lever, loaf);
    }
    console.log(this.loader);
    makeOrder.bind(this)(orderTV, chanceIndicators);
}

/** make a new bread object 
 * 
 * Destroys the current piece of bread and takes 10 away from the score if it
 * exists. It then creates a new breadObj at the location of the mouse x and 
 * y postion.
 * 
 * @param {PIXI.Container} container  The container that holds all the game elems
 * @param {array}          breadElems Array containing all the elements bread should interact with
 * @param {array}          spreads    Array containing all the spread elems and an ID for them
 * @param {PIXI.Sprite}    lever      PIXI.Sprite object for the toaster lever
 * @param {object}         e          Mouse data
 * 
 * @returns {PIXI.Sprite} bread object
 */
function makeBread(container, breadElems, spreads, lever, e){
    if(this.bread){
        clearTimeout(this.bread.timerLoop);
        this.bread.destroy();
        this.score -= 10;
        this.scoreText.text = `$: ${this.score}`
        this.scoreText.x = (0 + this.scoreText.width / 2);
    }
    let breadBonus = this.upgradeStore ? this.upgradeStore.breadUpgrade.currentState * 20: null;
    const bread = new breadObj(e.data.global.x, e.data.global.y, this.loader.resources['bread1'].texture, breadBonus);
    bread.mousedown = bread.dragStart;
    bread.mousemove = bread.dragMove;
    bread.mouseup = () => bread.dragEnd(breadElems, spreads, lever)
    container.addChild(bread);
    return bread;
}

/** Creates a knife object to spread topping on toast
 * 
 * This function creates a knife object if there is not one already. It sets the
 * parent property of this knife to be the parent object and uses this object
 * to get the correct texture for the parent clicked.
 * 
 * @param {PIXI.Container} container The container that holds all the game elems 
 * @param {spreadObj}      parent    The parent object the player clicked on to fire this function
 * @param {PIXI.Sprite}    plate     The plate object from the game
 * @param {object}         e         Mouse Data
 * 
 * @returns {PIXI.Sprite} knife object
 */
function spawnKnife(container, parent, plate,e){
    if(this.knife == undefined){
        const knife = new knifeObj(e.data.global.x, e.data.global.y, this.loader.resources[`knife_${parent.property}`].texture, parent);
        container.addChild(knife);
        parent.useable = false;
        if(this.bread != undefined) knife.mouseup = () => knife.dragEnd(this.bread, this.loader, plate);
        return knife
    }
}

/** make a new orderData object and display it to the player
 * 
 * get a random spread and random bread state, create an order data with these and
 * then call the makeTexture function of the orderData to render the data to the
 * screen. it then starts the timer.
 * 
 * @param {PIXI.Sprite} orderTV          The TV sprite object that will display the order
 * @param {array}       chanceIndicators An array containing all the change indicator object
 * 
 * @returns null
 */
function makeOrder(orderTV, chanceIndicators){
    let randNumSpreads = (Math.floor(Math.random() * this.spreads.length));
    let randNumState = (Math.floor(Math.random() * 5)) + 2;    

    this.order = new orderData(orderTV.x, orderTV.y, randNumState, this.spreads[randNumSpreads][0], this.loader, this.game);
    this.order.makeTexture(this.game, orderTV, this.loader);

    timerStart.bind(this)(chanceIndicators, orderTV);
}

/** start the timer using basic loop functions
 * 
 * @param {array}       chanceIndicators An array containing all the change indicator object
 * @param {PIXI.Sprite} orderTV          The TV sprite object that will display the order
 * 
 * @returns null
 */
function timerStart(chanceIndicators, orderTV){                                                
    let loopMax = this.timer.textures.length - 1                                           
    let loopCounter = 0;
    
    /** change the texture on the timer and loop
     * 
     * Changes the texture of the timer and its state depending on the amount of
     * times the function has looped. It also checks to see if the function should
     * be looped again or if the timer is over and ends the round if the timer
     * is over.
     * 
     * @alias timerStart~loop
     * 
     * @returns null
     */
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
            this.timer.timeout = setTimeout(loop, (this.timer.remaining / loopMax) * 1000);
            loopCounter++;
        }
    }
    loop();
    
}

/** Checks the piece of toast made against the order specified and updates score
 * 
 * Checks properties of bread and ordet to compare. if the toasting is off by one you
 * get half points for the toasting, and for every mistake you lose a chance.
 * 
 * @param {PIXI.Sprite} plate            The plate object
 * @param {PIXI.Sprite} orderTV          The TV that shows the order
 * @param {PIXI.Sprite} loaf             The loaf object
 * @param {array}       chanceIndicators An array containing all the change indicator object
 * 
 * @returns null
 */
function checkScore(plate = null, orderTV = null, loaf = null, chanceIndicators = null){
    let updateScoreText = () => {
        this.scoreText.text = `$: ${this.score}`
        this.scoreText.x = (0 + this.scoreText.width / 2);
    }
    if(this.bread != undefined && plate){
        if(plate.containsPoint(this.bread) && this.bread.dragging == false){

            if(this.bread.state == this.order.toastState) this.score += 80;   
            else if(this.bread.state == this.order.toastState - 1 || this.bread.state == this.order.toastState + 1) this.score += 40
            else changeChanceIndicator.bind(this)(chanceIndicators);

            if(this.bread.property == this.order.toastSpreads) this.score += 40;
            else changeChanceIndicator.bind(this)(chanceIndicators);

            this.score += this.upgradeStore.bread.upgradeState * 20;

            this.bread.destroy();
            this.bread = undefined;
            this.order.destroy();
            plate.interactive = false;
            updateScoreText();
            
            clearTimeout(this.timer.timeout);
            
            let scoreFirstNum = this.score.toString()[0]
            if(scoreFirstNum / 5 == 1 && this.timer.time >= 20) this.timer.time -= 10;

            if(this.chances <= 0) endGame.bind(this)();
            else setTimeout( () => makeOrder.bind(this)(orderTV), 1000);
        }
    }
    
}

/** destroy bread and order, make a new order. end game if out of chances
 * 
 * @param {array}       chanceIndicator all chance indicator objects
 * @param {PIXI.Sprite} orderTV         orderTV object
 * 
 * @returns null
 */
function endRound(chanceIndicator, orderTV){
    this.timer.texture = this.loader.resources.timer_9.texture;
    if(this.bread || this.bread != null) this.bread.destroy();
    this.order.destroy();
    changeChanceIndicator.bind(this)(chanceIndicator);
    if(this.chances <= 0){
        endGame.bind(this)();
    }
    else setTimeout( () => makeOrder.bind(this)(orderTV, chanceIndicator), 1000);
}

/** change texture of next change indicator
 * 
 * @param {array} chanceIndicators array of chance indicator objects
 * 
 * @returns null
 */
function changeChanceIndicator(chanceIndicators){
    this.chances -= 1;
    if(this.chances >= 0)chanceIndicators[this.chances].texture = this.loader.resources.x_light.texture;
}

/** Destroys all objects and goes back to menu
 * 
 * Creates a window to show your score for the game. this will eventually be a
 * scoreboard. it also has a button to return to menu which destroys all objectsm
 * 
 * @returns null
 */
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
    /** destroy game container and go back to menu
     * 
     * @alias endGame~restartButton.mousedown
     * 
     * @returns null
     */
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
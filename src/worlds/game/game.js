/** Name:   ToastR.Game.js
 *  Desc:   initialise game and handle all game logic
 *  Author: Jimy Houlbrook
 *  Date:   12/10/22
 */

import * as PIXI from 'pixi.js';
import { Toaster } from './toaster';
import { Utilities } from './utils';
import { Bread } from './bread'
import { Spread } from './spread';
import { Order } from './order';

/** ToastR.game.Game
 * 
 *  Load assets into game and set up interactivity, will also contain
 *  delta loop for game
 * 
 * @param {PIXI.Loader} loader          Loader containing assets for the game
 * @param {PIXI.Ticker} Ticker          App ticker
 * @param {Function}    WorldManager    Worldmanager's load world function
 */

export const Game = class extends PIXI.Container{
    constructor(loader, ticker, worldManager){
        super();
        this.loader = loader;
        this.ticker = ticker;
        this.worldManager = worldManager;
        //console.log(worldManager);

        this.sortableChildren = true;

        this.env = {
            vars: {},
            objs: {
                bread: null,
                toaster: null,
                knife: null,
                plate: null,
                order: null,
                scoreText: null,
                chanceIndicators: new Array()
            },
        }

        this.loadWorld();

        this.init();
    }

    // Loads world and UI
    loadWorld(){
        // Create background at 0,0 ---------------------------------------------------
        const background = new PIXI.Sprite.from(
            this.loader.resources.background.texture
        );

        this.addChild(background);

        // Create order TV at otX and otY ----------------------------------------------
        const orderTV = new PIXI.Sprite.from(
            this.loader.resources.orderTV.texture
        );
        const otx = orderTV.width / 4;
        const oty = orderTV.height / 4;
        orderTV.position.set(otx, oty);
        this.addChild(orderTV);
        
        // Make bread texture array for bread object -----------------------------------
        this.breadTextures = new Array()
        const spreads = ["beans", "butter", "nut"]
        const breadStates = 6;

        for(let i = 1; i <= breadStates; i++){
            this.breadTextures.push(this.loader.resources[`bread${i}`])
            for(const spread of spreads){
                this.breadTextures.push(this.loader.resources[`bread${i}_${spread}`])
            }
        }

        // Make Loaf -------------------------------------------------------------------
        const loaf = new PIXI.Sprite.from(this.loader.resources.loaf.texture);
        loaf.scale.set(0.8);

        const lx = (background.width / 2) - loaf.width / 1.25;
        const ly = (background.height / 1.75) - (loaf.height / 2);

        loaf.position.set(lx, ly);
        
        // Make loaf create piece of bread when clicked
        loaf.interactive = true;
        loaf.pointerdown = e => {
            const x = e.data.global.x;
            const y = e.data.global.y;
            this.makeBread(x, y)
        }
        this.addChild(loaf);

        // Make toaster ----------------------------------------------------------------
        const dialTextures = new Array()

        for(let i = 1; i < 6; i++)
            dialTextures.push(this.loader.resources[`dial${i}`].texture);
        
        const toasterUpTexture = this.loader.resources.toaster_up.texture;
        const toasterDownTexture = this.loader.resources.toaster_down.texture;
        const tx = (background.height / 20);
        const ty = (background.height) - toasterUpTexture.height * 1.5;

        const toaster = new Toaster(
            tx, ty, toasterUpTexture, toasterDownTexture,
            this.loader.resources.lever.texture, dialTextures
        );

        // Set toaster pointer events
        toaster.elems.body.pointerdown = () =>
            toaster.toastBread(this.env.objs.bread, loaf)
        toaster.elems.lever.pointerdown = () => 
            toaster.toastBread(this.env.objs.bread, loaf)

        this.addChild(toaster);
        this.env.objs.toaster = toaster;
         

        // Make Chopping Board ---------------------------------------------------------
        const cbTexture = this.loader.resources.choppingBoard.texture;
        const choppingBoard = new PIXI.Sprite.from(cbTexture);

        const cbX = background.width / 2;
        const cbY = background.height / 1.4;
        choppingBoard.position.set(cbX, cbY);
        this.addChild(choppingBoard);

        // Make Spreads ----------------------------------------------------------------
        // Butter
        const butX = choppingBoard.x + this.loader.resources.butter.texture.width;
        const butY = background.height / 2;

        const butterTexture = this.loader.resources.butter.texture;
        const butterKnifeTexture = this.loader.resources.knife_butter.texture;

        const butter = new Spread(
            butX, butY, butterTexture, butterKnifeTexture, 'butter'
        );
        butter.pointerdown = e => {
            const x = e.data.global.x;
            const y = e.data.global.y;
            butter.makeKnife.bind(butter)(x, y, this);
        }
        this.addChild(butter);

        // Chocolate Spread
        const cX = butX + (butter.width * 1.5);
        const cY = butY;

        const chocolateTexture = this.loader.resources.nut.texture;
        const chocolateKnifeTexture = this.loader.resources.knife_nut.texture;

        const chocolate = new Spread(
            cX, cY, chocolateTexture, chocolateKnifeTexture, 'chocolate'
        );
        chocolate.pointerdown = e => {
            const x = e.data.global.x;
            const y = e.data.global.y;
            chocolate.makeKnife.bind(chocolate)(x, y, this);
        }
        this.addChild(chocolate);

        // Beans
        const beanX = cX + (chocolate.width * 1.5);
        const beanY = cY;

        const beanTexture = this.loader.resources.beans.texture;
        const beanKnifeTexture = this.loader.resources.knife_beans.texture;

        const beans = new Spread(
            beanX, beanY, beanTexture, beanKnifeTexture, 'beans'
        );
        beans.pointerdown = e => {
            const x = e.data.global.x;
            const y = e.data.global.y;
            beans.makeKnife.bind(beans)(x, y, this);
        }
        this.addChild(beans);

        // Make Plate ------------------------------------------------------------------
        const plate = new PIXI.Sprite.from(this.loader.resources.plate.texture);
        plate.x = cX;
        plate.y = cY - plate.height;
        this.addChild(plate);
        this.env.objs.plate = plate;

        // Make Order Data -------------------------------------------------------------
        // Make bread texture array for order data
        const breadTextures = new Array();
        for(let i = 1; i <= breadStates; i++)
            breadTextures.push([`bread${i}`, this.loader.resources[`bread${i}`].texture]);

        // Make spread texture array for order data
        const spreadTextures = new Array(
            ["butter", this.loader.resources.butter.texture],
            ["chocolate", this.loader.resources.nut.texture],
            ["beans", this.loader.resources.beans.texture]
        );

        const orderX = orderTV.x + (orderTV.width / 3);
        const orderY = orderTV.y + (orderTV.height / 2);

        const order = new Order(orderX , orderY, breadTextures, spreadTextures);
        this.addChild(order);
        this.env.objs.order = order;

        // Make Score Text -------------------------------------------------------------
        this.textStyle = {
            fill: "#c09947",
            fontFamily: 'Arial',
            fontSize: 62,
            align: 'left',
            lineJoin: "round",
            stroke: "#694329",
            strokeThickness: 20    
        }

        const score = new PIXI.Text(`Score: ${this.env.vars.score}`, this.textStyle);
        score.anchor.set(0.5);
        score.x = 0 + score.width / 2;
        score.y = 0 + score.height / 2;
        this.addChild(score)
        this.env.objs.scoreText = score;

        // Make Chance indicators ------------------------------------------------------
        let ciX = background.width
        let ciY = 0

        const chanceIndicator1 = this.makeChanceIndicator(ciX, ciY);
        this.addChild(chanceIndicator1);
        this.env.objs.chanceIndicators.push(chanceIndicator1);

        ciX = chanceIndicator1.x;
        
        const chanceIndicator2 = this.makeChanceIndicator(ciX, ciY);
        this.addChild(chanceIndicator2);
        this.env.objs.chanceIndicators.push(chanceIndicator2);

        ciX = chanceIndicator2.x;

        const chanceIndicator3 = this.makeChanceIndicator(ciX, ciY);
        this.addChild(chanceIndicator3);
        this.env.objs.chanceIndicators.push(chanceIndicator3);
    }

    // Intialise environment variables and add delta to ticker
    init(){
        this.env.vars = {
            score: 0,
            chances: 3,
        }

        // Update the score text before starting game
        Utilities.updateText(this.env.objs.scoreText, `Score: ${this.env.vars.score}`);

        this.env.objs.order.makeOrder();

        this.env.vars.chances = Utilities.changeChanceIndicator(this.env.objs.chanceIndicators, this.loader.resources.x_dark.texture);

        this.ticker.add(this.delta.bind(this));
    }

    /** Make chance indicator at x, y
     *  
     *  @param {Number} x 
     *  @param {Number} y 
     *  @returns chanceIndicator
     */
    makeChanceIndicator(x, y){
        const chanceIndicator = new PIXI.Sprite.from(this.loader.resources.x_dark.texture);
        chanceIndicator.scale.set(0.7);
        chanceIndicator.x = x - chanceIndicator.width * 1.5;
        chanceIndicator.y = y + chanceIndicator.height / 4;
        return chanceIndicator;
    }

    /** Make bread at X, Y
     *  This function is the pointerdown event for loaf. it is 
     *  in this file to allow easier manipulation of this.
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    makeBread(x, y){
        if(this.env.objs.bread){
            this.env.objs.bread.destroy();
            this.env.objs.bread = null
            this.env.vars.score -= 10;
            Utilities.updateText(this.env.objs.scoreText, `Score: ${this.env.vars.score}`);
        }

        const bread = new Bread(x, y, this.breadTextures);
        this.addChild(bread);
        this.env.objs.bread = bread;
    }

    // End the round and make a new order
    endRound(){
        const roundData = Utilities.checkScore(this.env.objs.bread, this.env.objs.order);

        // Destoy objects
        this.env.objs.bread.destroy();
        this.env.objs.bread = null;
        this.env.objs.order.destroy();

        // Add to score if there is no failure or update chances
        if(!roundData.failure){
            this.env.vars.score += roundData.score;
            Utilities.updateText(this.env.objs.scoreText, `Score: ${this.env.vars.score}`)
        } else {
            this.env.vars.chances = Utilities.changeChanceIndicator(
                this.env.objs.chanceIndicators,
                this.loader.resources.x_light.texture,
                this.env.vars.chances,
            );
        }

        // If the player still has chances make a new order, if not end the game
        if(this.env.vars.chances >= 1){
            let order = this.env.objs.order

            setTimeout(order.makeOrder.bind(order), 500)
        } else {
            this.gameOver()
        }
    }

    gameOver(){
        const failTextArray = [
            'Fission Mailed', 
            'Game Over', 
            'How did you mess this up, its just toast', 
            'Even my comatose nan could do better',
            'My dissapointment is immeasurable, \nand my day is ruined'
        ];

        const randNum = Math.floor(Math.random() * failTextArray.length);
        const currentText = failTextArray[randNum];

        // Remove delta from ticker
        this.ticker.remove(this.delta.bind(this));

        const container = new PIXI.Container();
        container.zIndex = 2;

        // Do this to stop user interacting with game behind pop up
        container.interactive = true;

        this.addChild(container);

        const backgroundX = this.loader.resources.background.texture.width / 2
        const backgroundY = this.loader.resources.background.texture.height / 2

        const background = new PIXI.Sprite.from(this.loader.resources.greyBox.texture);
        background.anchor.set(0.5);
        background.position.set(backgroundX, backgroundY);
        background.zIndex = 2;
        container.addChild(background);

        this.textStyle.align = 'center';
        const failText = new PIXI.Text(currentText  , this.textStyle);
        const ftX = background.x - failText.width / 2;
        const ftY = (background.y - background.height / 2) + background.height / 6;
        failText.position.set(ftX, ftY);
        container.addChild(failText);

        const finalScoreText = new PIXI.Text(`Score: ${this.env.vars.score}`, this.textStyle);
        const fstX = background.x - finalScoreText.width / 2;
        const fstY = ftY + (background.height / 6) * 1.5;
        finalScoreText.position.set(fstX, fstY);
        container.addChild(finalScoreText);

        // Replace with button image
        const playAgainButton = new PIXI.Text('Play Again?', this.textStyle);
        const pabX = background.x - playAgainButton.width / 2;
        const pabY = fstY + background.height / 5;

        playAgainButton.interactive = true;

        playAgainButton.pointerdown = () =>{
            this.init.bind(this)();
            container.destroy();
        }

        playAgainButton.position.set(pabX, pabY);
        container.addChild(playAgainButton);

        // Replace with button image
        const exitButton = new PIXI.Text(`Exit Game`, this.textStyle);
        const ebX = background.x - exitButton.width / 2;
        const ebY = pabY + background.height / 5;

        exitButton.interactive = true;
        
        exitButton.pointerdown = () => {
            this.worldManager('menu', this.loader, this.ticker);
        }

        exitButton.position.set(ebX, ebY);
        container.addChild(exitButton);
        
    }

    // Gameloop, runs every frame
    // Because this fuction is called from a different function, this must be bound
    delta(){
        // Check if bread exists before testing its colissions
        if(this.env.objs.bread){
            if(Utilities.isWithin(this.env.objs.bread, this.env.objs.toaster)
            && !this.env.objs.bread.dragging
            && this.env.objs.bread.property == "bare"){
                this.env.objs.toaster.setInteractive(true)
            }else
                this.env.objs.toaster.setInteractive(false)

            // Check if knife exists before testing its colissions
            if(this.env.objs.knife){
                if(Utilities.isWithin(this.env.objs.bread, this.env.objs.knife))
                    this.env.objs.bread.spread(this.env.objs.knife.property, this.loader);
            }

            // Check that bread has a property before allowing round finish
            if(Utilities.isWithin(this.env.objs.bread, this.env.objs.plate)
            && this.env.objs.bread.property != "bare" && !this.env.objs.bread.dragging){
                this.endRound();
            }
        }
    }
}
// we use custom classes to allow for custom variables for the object
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
        this.zIndex = 1;
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

    dragEnd(elems, spreads){
        let spreadsInteractive = () => {for(const elem of spreads) elem[1].interactive = true}
        let spreadsUninteractive = () => {for(const elem of spreads) elem[1].interactive = false;}
        this.dragging = false;
        for(const elem of elems){
            if(elem[0] == "choppingBoard" && elem[1].containsPoint(this)) spreadsInteractive();
            else if(elem[0] == "choppinhBoard" && !elem[1].containsPoint(this)) spreadsUninteractive();
            else if (elem[1].containsPoint(this)) elem[1].interactive = true;
            else elem[1].interactive = false;
        }
    }

    /* makeToast does the animations for toasting the bread, it also makes the bread non interactive so that the player cant drag the toast out of
    the toaster while toasting. This is an async function so we can use await */ 
    async makeToast(loader, toaster, lever){
        toaster.texture = loader.resources['toaster_down'].texture;
        this.interactive = false;
        this.x = toaster.x;
        this.y = toaster.y - 100;

        // Runs both functions at once
        await Promise.allSettled([this.startToastingAnims(this, toaster.y - 50), this.startToastingAnims(lever, toaster.y)]);

        // We use await to make sure changeTexture has finished running before we execute any more code
        await this.changeTexture(loader, toaster.setting);

        // Tween the toast popping out of the toaster here
        await Promise.all([this.finToastingBread(this, toaster.y - 250), this.finToastingLever(lever, toaster.y - 50)]);
        toaster.texture = loader.resources['toaster_up'].texture;
        this.interactive = true;
    }

    // runs the loop function until the bread has been toasted to the desired setting.
    // https://stackoverflow.com/questions/68362785/can-you-resolve-a-promise-in-an-if-statement/68363299#68363299
    changeTexture(loader, setting){
        return new Promise((resolve) => {
            let loop = () =>  { // Using an arrow function to keep context for 'this'
                this.state++;
                this.texture = loader.resources[`bread${this.state}`].texture;
                if(this.state <= setting) setTimeout(loop, 1000);
                else if (this.state > setting) resolve();
            };
            setTimeout(loop, 1000);
        });
    }

    startToastingAnims(elem, newPos){
        return new Promise((resolve) => {
            let transform = {y: elem.y};
            let popDown = new TWEEN.Tween(transform)
                .to({y: newPos}, 200)
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
        if(bread.containsPoint(this)){;
            bread.property = this.property
            bread.texture = loader.resources[`bread${bread.state}_${this.property}`].texture;
            plate.interactive = true;
            this.parent.useable = true;;
            this.destroy();
        }
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
        container.addChild(this.toastSprite);

        this.spreadSprite = new PIXI.Sprite.from(loader.resources[this.toastSpreads].texture);
        this.spreadSprite.anchor.set(0.5);
        this.spreadSprite.x = this.toastSprite.x + (orderTV.width / 3);
        this.spreadSprite.y = this.toastSprite.y;
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
        height: 1080,
        width: 1920,
        margin: 0,
        backgroundColor: 0x2f9da3
    });
    //document.body.appendChild(this.app.view);
    div.appendChild(this.app.view);

    const _files = [['background', 'background.png'],
                    ['bread1', 'bread1.png'],
                    ['bread1_butter', 'bread1_butter.png'],
                    ['bread1_nut', 'bread1_nut.png'],
                    ['bread2', 'bread2.png'],
                    ['bread2_butter', 'bread2_butter.png'],
                    ['bread2_nut', 'bread2_nut.png'],
                    ['bread3', 'bread3.png'],
                    ['bread3_butter', 'bread3_butter.png'],
                    ['bread3_nut', 'bread3_nut.png'],
                    ['bread4', 'bread4.png'],
                    ['bread4_butter', 'bread4_butter.png'],
                    ['bread4_nut', 'bread4_nut.png'],
                    ['bread5', 'bread5.png'],
                    ['bread5_butter', 'bread5_butter.png'],
                    ['bread5_nut', 'bread5_nut.png'],
                    ['bread6', 'bread6.png'],
                    ['bread6_butter', 'bread6_butter.png'],
                    ['bread6_nut', 'bread6_nut.png'],
                    ['butter', 'butter.png'],
                    ['choppingBoard', 'chopping_board.png'],
                    ['dial1', 'dial_1.png'],
                    ['dial2', 'dial_2.png'],
                    ['dial3', 'dial_3.png'],
                    ['dial4', 'dial_4.png'],
                    ['dial5', 'dial_5.png'],
                    ['knife_butter', 'knife_butter.png'],
                    ['knife_nut', 'knife_nut.png'],
                    ['loaf', 'loaf.png'],
                    ['nut', 'nut.png'],
                    ['orderTV', 'order_tv.png'],
                    ['plate', 'plate.png'],
                    ['toaster_down', 'toaster_down.png'],
                    ['lever', 'toaster_lever.png'],
                    ['toaster_up', 'toaster.png'],
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
    console.log('Game Initialised');

    let chanceIndicators = [];
    let breadInteracts = [];
    this.spreads = [];

    this.score = 0;
    this.chances = 3;

    const background = new PIXI.Sprite.from(this.loader.resources.background.texture);
    background.zIndex = 0;
    this.app.stage.addChild(background);

    const orderTV = new PIXI.Sprite.from(this.loader.resources.orderTV.texture);
    orderTV.position.set(orderTV.width / 4, orderTV.height / 4);
    this.app.stage.addChild(orderTV);

    const game = new PIXI.Container()
    game.sortableChildren = true;
    this.app.stage.addChild(game);

    // There will be 3 chance indicators. one will light up each time a mistake is made to show the player how many chances they have
    const chanceIndicator = new PIXI.Sprite.from(this.loader.resources.x_dark.texture);
    chanceIndicator.x = this.app.view.width - (chanceIndicator.width * 1.5);
    chanceIndicator.y = chanceIndicator.height / 3;
    game.addChild(chanceIndicator);
    chanceIndicators.push(chanceIndicator);

    const chanceIndicator2 = new PIXI.Sprite.from(this.loader.resources.x_dark.texture);
    chanceIndicator2.x = chanceIndicator.x - (chanceIndicator2.width * 1.5)
    chanceIndicator2.y = chanceIndicator.y;
    game.addChild(chanceIndicator2);
    chanceIndicators.push(chanceIndicator2);
    
    const chanceIndicator3 = new PIXI.Sprite.from(this.loader.resources.x_dark.texture);
    chanceIndicator3.x = chanceIndicator2.x - (chanceIndicator3.width * 1.5);
    chanceIndicator3.y = chanceIndicator2.y;
    game.addChild(chanceIndicator3);
    chanceIndicators.push(chanceIndicator3);

    const toaster = new toasterObj(250, this.app.view.height / 1.25, this.loader.resources.toaster_up.texture);
    toaster.zIndex = 3;
    game.addChild(toaster);
    breadInteracts.push(['toaster', toaster]);

    const loaf = new PIXI.Sprite.from(this.loader.resources.loaf.texture);
    loaf.scale.set(0.8);
    loaf.position.set((this.app.view.width - (loaf.width * 2)) / 2, (this.app.view.height - (loaf.height - 30)) / 2);
    loaf.interactive = true;
    loaf.mousedown = (e) => this.bread = makeBread.bind(this)(game, loaf, breadInteracts, this.spreads, e);
    game.addChild(loaf);

    const choppingBoard = new PIXI.Sprite.from(this.loader.resources.choppingBoard.texture);
    choppingBoard.position.set((this.app.view.width / 2) + 100, this.app.view.height / 1.4);
    game.addChild(choppingBoard);
    breadInteracts.push(['choppingBoard', choppingBoard]);

    const plate = new PIXI.Sprite.from(this.loader.resources['plate'].texture);
    plate.scale.set(0.7);
    plate.x = this.app.view.width / 1.5;
    plate.y = this.app.view.height / 5
    plate.mousemove = () => checkScore.bind(this)(plate, orderTV, loaf, chanceIndicators);
    game.addChild(plate);

    const butter = new spreadObj(choppingBoard.x, this.app.view.height / 2, this.loader.resources.butter.texture, 'butter');
    butter.mousedown = (e) => this.knife = spawnKnife.bind(this)(game, butter, plate, e); 
    game.addChild(butter);
    this.spreads.push(['butter', butter]);

    const nut = new spreadObj(butter.x * 1.2, butter.y, this.loader.resources.nut.texture, 'nut');
    nut.mousedown = (e) => this.knife = spawnKnife.bind(this)(game, nut, plate, e);
    game.addChild(nut);
    this.spreads.push(['nut', nut]);

    const dial = new PIXI.Sprite.from(this.loader.resources['dial1'].texture);
    dial.anchor.set(0.5);
    dial.x = toaster.x - 10;
    dial.y = toaster.y + 50;
    dial.zIndex = 4;
    dial.interactive = true;
    dial.mousedown = () => toaster.changeSetting(dial, this.loader);
    game.addChild(dial);

    const lever = new PIXI.Sprite.from(this.loader.resources['lever'].texture);
    lever.x = toaster.x + 170;
    lever.y = toaster.y - 50;
    game.addChild(lever);

    toaster.mousedown = () => this.bread.makeToast(this.loader, toaster, lever);

    makeOrder.bind(this)(orderTV);
}

function makeBread(container, loaf, breadElems, spreads, e){
    if(this.bread == undefined || this.bread == null){
        const bread = new breadObj(e.data.global.x, e.data.global.y, this.loader.resources['bread1'].texture);
        bread.mousedown = bread.dragStart;
        bread.mousemove = bread.dragMove;
        bread.mouseup = () => bread.dragEnd(breadElems, spreads)
        container.addChild(bread);
        return bread;
    } else {
        // Dev tool, DELETE
        this.bread.destroy();
    }
}

function spawnKnife(container, spread, plate, e){
    if(this.knife == undefined){
        const knife = new knifeObj(e.data.global.x, e.data.global.y, this.loader.resources[`knife_${spread.property}`].texture, spread);
        container.addChild(knife);
        spread.useable = false;
        if(this.bread != undefined) knife.mouseup = () => knife.dragEnd(this.bread, this.loader, plate);
        return knife
    }
}

function makeOrder(orderTV){
    let randNumSpreads = (Math.floor(Math.random() * this.spreads.length));
    let randNumState = (Math.floor(Math.random() * 5)) + 2;    
    const orderCont = new PIXI.Container();
    this.app.stage.addChild(orderCont);

    this.order = new orderData(orderTV.x, orderTV.y, randNumState, this.spreads[randNumSpreads][0], this.loader, orderCont);
    this.order.makeTexture(orderCont, orderTV, this.loader);
}

function checkScore(plate, orderTV, loaf, chanceIndicators){
    let changeChanceIndicator = () => {
        this.chances -= 1;
        if(this.chances >= 0){
            chanceIndicators[this.chances].texture = this.loader.resources.x_light.texture;
        }
    }
    if(this.bread != undefined){
        if(plate.containsPoint(this.bread)){
            if(this.bread.state == this.order.toastState) this.score += 100;
            else if(this.bread.state == this.order.toastState - 1 || this.bread.state == this.order.toastState + 1) this.score += 50
            else changeChanceIndicator();

            if(this.bread.property == this.order.toastSpreads) this.score += 50;
            else changeChanceIndicator();

            if(this.chances <= 0) endGame.bind(this)(loaf);

            this.bread.destroy();
            this.bread = undefined;
            this.order.destroy();
            plate.interactive = false;
            makeOrder.bind(this)(orderTV);
        }
    }
}

function endGame(loaf){
    loaf.interactive = false;
    console.log(`GAME OVER \nSCORE: ${this.score}`)
    // Will use pixi's inbuilt text functions to show the player their score etc..
}

function animate(){TWEEN.update(this.app.ticker.lastTime);}

document.addEventListener('DOMContentLoaded', init);
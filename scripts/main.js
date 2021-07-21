//orders will be done with a class that will randomly decide the toast setting and topping.

// we use custom classes to allow for custom variables for the object
class breadObj extends PIXI.Sprite {
    constructor(x = 0, y = 0, texture){
        super(texture);
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.scale.set(0.8);
        this.state = 1;
        bread.property = "bare";
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
        let spreadsInteractive = () => {for(const elem of spreads) elem.interactive = true}

        this.dragging = false;
        for(const elem of elems){
            if(elem[0] == "choppingBoard" && elem[1].containsPoint(this)){
                spreadsInteractive()
            }
            else if (elem[1].containsPoint(this)) {elem[1].interactive = true;}
            else {elem[1].interactive = false;}
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

    dragEnd(bread, loader){
        this.dragging = false;
        if(bread.containsPoint(this)){
            console.log('spreading');
            // Need to change texture here once they are made
            bread.property = this.property
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
    constructor(x, y, toastState, toastSpreads,){
        this.x = x;
        this.y = y;
        this.toastState = toastState;
        this.toastSpreads = toastSpreads;
    }
    makeTexture(container, orderTv, loader){
        let toastTexture = `bread${this.toastState}`
        const toastSprite = new PIXI.Sprite.from(loader.resources[toastTexture].texture);
        toastSprite.scale.set(0.5);
        toastSprite.anchor.set(0.5);
        toastSprite.x = orderTv.x + (orderTv.width / 3);
        toastSprite.y = orderTv.y + (orderTv.height / 2);
        container.addChild(toastSprite);
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
                    ['bread2', 'bread2.png'],
                    ['bread3', 'bread3.png'],
                    ['bread4', 'bread4.png'],
                    ['bread5', 'bread5.png'],
                    ['bread6', 'bread6.png'],
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
                    ['toaster_down', 'toaster_down.png'],
                    ['lever', 'toaster_lever.png'],
                    ['toaster_up', 'toaster.png']];

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

    const breadInteracts = [];
    const spreads = [];

    const background = new PIXI.Sprite.from(this.loader.resources.background.texture);
    background.zIndex = 0;
    this.app.stage.addChild(background);

    const orderTV = new PIXI.Sprite.from(this.loader.resources.orderTV.texture);
    orderTV.position.set(orderTV.width / 4, orderTV.height / 4);
    this.app.stage.addChild(orderTV);

    const game = new PIXI.Container()
    game.sortableChildren = true;
    this.app.stage.addChild(game);

    const toaster = new toasterObj(250, this.app.view.height / 1.25, this.loader.resources.toaster_up.texture);
    toaster.zIndex = 3;
    game.addChild(toaster);
    breadInteracts.push(['toaster', toaster]);

    const loaf = new PIXI.Sprite.from(this.loader.resources.loaf.texture);
    loaf.scale.set(0.8);
    loaf.position.set((this.app.view.width - (loaf.width * 2)) / 2, (this.app.view.height - (loaf.height - 30)) / 2);
    loaf.interactive = true;
    loaf.mousedown = (e) => this.bread = makeBread.bind(this)(game, loaf, breadInteracts, spreads, e);
    game.addChild(loaf);

    const choppingBoard = new PIXI.Sprite.from(this.loader.resources.choppingBoard.texture);
    choppingBoard.position.set((this.app.view.width / 2) + 100, this.app.view.height / 1.4);
    game.addChild(choppingBoard);
    breadInteracts.push(['choppingBoard', choppingBoard]);

    const butter = new spreadObj(choppingBoard.x, this.app.view.height / 2, this.loader.resources.butter.texture, 'butter');
    butter.mousedown = (e) => this.knife = spawnKnife.bind(this)(game, butter, e); 
    game.addChild(butter);
    spreads.push(['butter', butter]);

    const nut = new spreadObj(butter.x * 1.2, butter.y, this.loader.resources.nut.texture, 'nut');
    nut.mousedown = (e) => this.knife = spawnKnife.bind(this)(game, nut, e);
    game.addChild(nut);
    spreads.push(['nut', nut]);

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

    toaster.mousedown = () => this.bread.makeToast(toaster, lever);

    makeOrder.bind(this)(spreads, orderTV);
}

function makeBread(container, loaf, breadElems, spreads, e){
    if(this.bread == undefined){
        const bread = new breadObj(e.data.global.x, e.data.global.y, this.loader.resources['bread1'].texture);
        bread.mousedown = bread.dragStart;
        bread.mousemove = bread.dragMove;
        bread.mouseup = () => bread.dragEnd(breadElems, spreads)
        container.addChild(bread);
        loaf.usable = false;
        return bread;
    } else {
        // Dev tool, DELETE
        this.bread.destroy();
        loaf.usable = true;
    }
}

function spawnKnife(container, spread, e){
    if(this.knife == undefined){
        const knife = new knifeObj(e.data.global.x, e.data.global.y, this.loader.resources[`knife_${spread.property}`].texture, spread);
        container.addChild(knife);
        spread.useable = false;
        if(this.bread != undefined) knife.mouseup = () => knife.dragEnd(this.bread);
        return knife
    }
}

function makeOrder(spreads, orderTV){
    let randNumSpreads = (Math.floor(Math.random() * spreads.length));
    let randNumState = (Math.floor(Math.random() * 5));
    const order = new orderData(orderTV.x, orderTV.y, randNumState, spreads[randNumSpreads][0], this.loader);
    
    const orderCont = new PIXI.Container();
    this.app.stage.addChild(orderCont);

    order.makeTexture(orderCont, orderTV, this.loader);
}

function returnBread(){return this.bread;}

function animate(){TWEEN.update(this.app.ticker.lastTime);}

document.addEventListener('DOMContentLoaded', init);
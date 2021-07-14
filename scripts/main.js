const _gameElems = [];

// we use custom classes to allow for custom variables for the object
class breadObj extends PIXI.Sprite {
    constructor(x, y, texture){
        super(texture);
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.state = 1;
        this.interactive = true;
        this.zIndex = 1;
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

    dragEnd(elems){
        this.dragging = false;

        // Checks to see what game elements should be interactive
        for(const elem of elems){
            if(elem.containsPoint(this)) elem.interactive = true;
            else elem.interactive = false;
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
        console.log('toasting done');
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

    getRid(){
        this.bread ;
        this.destroy();
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

        // toasterObj.setting will be set by a dial on the toaster. for now default value is 5
        this.setting = 1;
    }

    changeSetting(dial, loader){
        this.setting = (this.setting + 1) % 6;
        if(this.setting == 0) this.setting += 1;
        dial.texture = loader.resources[`dial${this.setting}`].texture;
    }
}

class loafObj extends PIXI.Sprite{
    constructor(x, y, texture){
        super(texture);
        this.x = x;
        this.y = y;
        this.anchor.set(1);
        this.interactive = true;
        this.usable = true;
    }

    onClick(container, loader, gameElems, e){
        if(this.usable){
            this.bread = new breadObj(e.data.global.x, e.data.global.y, loader.resources['bread1'].texture);
            this.bread.mousedown = this.bread.dragStart;
            this.bread.mousemove = this.bread.dragMove;
            this.bread.mouseup = () => this.bread.dragEnd(gameElems);
            container.addChild(this.bread);
            this.usable = false;
        } else {
            this.usable = true;
            this.bread.getRid();
        }
    }
}

function init(){
    this.app = new PIXI.Application({
        height: 1080,
        width: 1920,
        backgroundColor: 0x2f9da3
    });
    document.body.appendChild(this.app.view);

    const _files = [['bread1', 'bread1.png'],
                    ['bread2', 'bread2.png'],
                    ['bread3', 'bread3.png'],
                    ['bread4', 'bread4.png'],
                    ['bread5', 'bread5.png'],
                    ['bread6', 'bread6.png'],
                    ['dial1', 'dial_1.png'],
                    ['dial2', 'dial_2.png'],
                    ['dial3', 'dial_3.png'],
                    ['dial4', 'dial_4.png'],
                    ['dial5', 'dial_5.png'],
                    ['toaster_up', 'toaster.png'],
                    ['toaster_down', 'toaster_down.png'],
                    ['lever', 'toaster_lever.png'],
                    ['loaf', 'loaf.png']];

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

    const game = new PIXI.Container()
    game.sortableChildren = true;
    this.app.stage.addChild(game);

    const toaster = new toasterObj(250, this.app.view.height / 1.25, this.loader.resources.toaster_up.texture);
    toaster.zIndex = 2;
    game.addChild(toaster);
    _gameElems.push(toaster);

    const dial = new PIXI.Sprite.from(this.loader.resources['dial1'].texture);
    dial.anchor.set(0.5);
    dial.x = toaster.x - 10;
    dial.y = toaster.y + 50;
    dial.zIndex = 3;
    dial.interactive = true;
    dial.mousedown = () => toaster.changeSetting(dial, this.loader);
    game.addChild(dial);

    const lever = new PIXI.Sprite.from(this.loader.resources['lever'].texture);
    lever.x = toaster.x + 225;
    lever.y = toaster.y - 50;
    game.addChild(lever);

    const loaf = new loafObj(this.app.view.width, 500, this.loader.resources['loaf'].texture);
    loaf.mousedown = (e) => loaf.onClick(game, this.loader, _gameElems, e);
    game.addChild(loaf);

    toaster.mousedown = () => this.bread.makeToast(this.loader, toaster, lever);
}

function animate(){TWEEN.update(this.app.ticker.lastTime);}

function makeBread(container){
    const bread = new breadObj(10, 10, this.loader.resources['bread1'].texture);
    container.addChild(bread);
}

document.addEventListener('DOMContentLoaded', init);
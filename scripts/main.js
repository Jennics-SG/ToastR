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

    dragEnd(elems, e){
        this.dragging = false;

        // Checks to see what game elements should be interactive
        for(const elem of elems){
            if(elem.containsPoint(this)) elem.interactive = true;
            else elem.interactive = false;
        }
    }

    /* makeToast does the animations for toasting the bread, it also makes the bread non interactive so that the player cant drag the toast out of
    the toaster while toasting. This is an async function so we can use await*/ 
    async makeToast(loader, toaster){
        toaster.texture = loader.resources['toaster_down'].texture;
        this.interactive = false;
        this.x = toaster.x;
        this.y = toaster.y - 100;

        let transform = {y: this.y};
        let popDown = new TWEEN.Tween(transform)
            .to({y: toaster.y - 50}, 200)
            .onUpdate(() => this.y = transform.y); 
        popDown.start();

        // We use await to make sure changeTexture has finished running before we execute any more code
        await this.changeTexture(loader, toaster.setting)

        // Tween the toast popping out of the toaster here
        console.log('toasting done');
        this.interactive = true;
    }

    // runs the loop function until the bread has been toasted to the desired setting.
    // https://stackoverflow.com/questions/68362785/can-you-resolve-a-promise-in-an-if-statement/68363299#68363299
    changeTexture(loader, setting){
        return new Promise((resolve, reject) => {
            let loop = () =>  {
                this.state++;
                this.texture = loader.resources[`bread${this.state}`].texture;
                if(this.state < setting) setTimeout(loop, 1000);
                else if (this.state == setting) resolve();
            };
            loop();
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
        this.setting = 5;
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
                    ['toaster_up', 'toaster.png'],
                    ['toaster_down', 'toaster_down.png'],
                    ['lever', 'toaster_lever.png']];

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
    toaster.zIndex = 1;
    game.addChild(toaster);
    _gameElems.push(toaster);

    const toast = new breadObj(10, 10, this.loader.resources.bread1.texture);
    toast.mousedown = toast.dragStart;
    toast.mousemove = toast.dragMove;
    toast.mouseup = (e) => toast.dragEnd(_gameElems, e);
    game.addChild(toast);

    toaster.mousedown = () => toast.makeToast(this.loader, toaster);
}

function animate(){TWEEN.update(this.app.ticker.lastTime);}

document.addEventListener('DOMContentLoaded', init);
const toastR = function(){
    const toasterObj = class extends PIXI.Sprite{
        constructor(x, y){
            super(loader.resources.toaster_up.texture);
            this.anchor.set(0.5);
            this.position.set(x, y);
            this.scale.set(0.8);
            this.zIndex = 3;
            this.upgradeState = 0;
            this.setting = 1;
            this.time = 3000;
        }

        changeSetting(dial){
            this.setting = (this.setting + 1) % 6;
            if(this.setting == 0) this.setting++;
            dial.texture = loader.resources[`dial${this.setting}`].texture;
        }

        upgrade(){
            this.time -= 500;
            this.upgradeState++;
        }
    }

    const breadObj = class extends PIXI.Sprite{
        constructor(x = 0, y = 0, interacts = gameData.breadInteracts){
            super(loader.resources.bread1.texture);
            this.anchor.set(0.5);
            this.scale.set(0.8);
            this.x = x;
            this.y = y;
            this.interacts = interacts;
            this.zIndex = 2;
            this.state = 1;
            this.property = "bare";
            this.interactive = true;
            this.dragging = true;

            this.mousedown = (e) => this.dragStart(e);
            this.mousemove = (e) => this.dragMove(e);
            this.mouseup = (e) => this.dragEnd(e);
        }

        dragStart(e){
            this.position.set(e.data.global.x, e.data.global.y);
            this.dragging = true;
        }

        dragMove(e){
            if(this.dragging) this.position.set(e.data.global.x, e.data.global.y);
        }

        dragEnd(){
            for(const elem of gameData.breadInteracts) elem[1].interactive = true;
            this.dragging = false;
        }

        async makeToast(toaster, lever, loaf){
            toaster.interactive = false;
            toaster.texture = loader.resources.toaster_down.texture;

            this.interactive = false;
            lever.interactive = false;
            loaf.interactive = false

            await Promise.allSettled([
                this.startToastingAnims(this, toaster.y - 50, 200),
                this.startToastingAnims(lever, toaster.y + toaster.height / 3.5, 250)
            ]);

            await this.changeTexture(toaster.setting, toaster.time);

            await Promise.all([
                this.finToastingBread(this, toaster.y - 250),
                this.finToastingLever(lever, toaster.y - toaster.height / 4)
            ]);
            
            toaster.interactive = true
            toaster.texture = loader.resources.toaster_up.texture;

            this.interactive = true;
            loaf.interactive = true;
            lever.interactive = true;
        }

        changeTexture(setting, time){
            let i = 1;
            return new Promise((resolve) => {
                let loop = () => {
                    this.state++;
                    this.texture = loader.resources[`bread${this.state}`].texture
                    if(this.state == 6 || i >= setting) resolve();
                    else if (i <= setting){
                        i++;
                        this.timerLoop = setTimeout(loop, time);
                    }
                }
                this.timerLoop = setTimeout(loop, time);
            });
        }

        startToastingAnims(elem, newPos, time){
            return new Promise((resolve) => {
                let transform = {y: elem.y};
                let popDown = new TWEEN.Tween(transform)
                    .to({y: newPos}, time)
                    .onUpdate(elem.y = transform.y);
                popDown.start();
                resolve();
            });
        }

        finToastingBread(elem, newPos){
            return new Promise((resolve) => {
                let transform = {y: elem.y};
                this.popUp = new TWEEN.Tween(transform)
                    .to({y: newPos}, 250)
                    .onUpdate(elem.y = transform.y);

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

    this.app = new PIXI.Application({
        height: 720,
        width: 1280,
        margin: 0,
        backgroundColor: 0x2f9da3
    });
    const loader = new PIXI.Loader("../assets");

    this.textStyle = {
        fill: "#c09947",
        fontFamily: 'Arial',
        fontSize: 0,
        align: 'left',
        lineJoin: "round",
        stroke: "#694329",
        strokeThickness: 20 
    }

    let gameData = {
        score: 0,
        scoreBonus: 0,
        scoreText: null,
        chances: 3,
        spreads: [],
        breadInteracts: [],
        upgradeableItems: [],
        chanceIndicators: [],
    }

    const init = () => {
        const div = document.getElementById('game');
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
        for(const file of _files) loader.add(file[0], file[1]);
        loader.onProgress.add(function(e){console.log(e.progress);});
        loader.onError.add(function(e){console.error(`ERR: ${e.message}`);});
        loader.onComplete.add(onReady);
        loader.load();

        this.app.ticker.add(animate);
    }

    const onReady = () => {
        const background = new PIXI.Sprite.from(
            loader.resources.background.texture);
        background.zIndex = 0;
        this.app.stage.addChild(background);

        const menu = new PIXI.Container();
        this.app.stage.addChild(menu);

        const menuBackground = new PIXI.Sprite.from(
            loader.resources.greyBox.texture);
        menuBackground.anchor.set(0.5);
        menuBackground.position.set(
            background.x + background.width / 2,
            background.y + background.height / 2
        );
        menu.addChild(menuBackground);

        this.textStyle.fontSize = 122;
        const logo = new PIXI.Text('ToastR', this.textStyle);
        logo.anchor.set(0.5);
        logo.position.set(
            menuBackground.x,
            (menuBackground.y - menuBackground.height / 2) + logo.height
        );
        menu.addChild(logo);

        this.textStyle.fontSize = 90;
        const playButton = new PIXI.Text('Play Now', this.textStyle);
        playButton.anchor.set(0.5);
        playButton.position.set(menuBackground.x, menuBackground.y);
        playButton.interactive = true;
        playButton.mousedown = () => {
            menu.destroy();
            mainGame();
        }
        menu.addChild(playButton);

        const tutorialButton = new PIXI.Text('How To Play', this.textStyle);
        tutorialButton.anchor.set(0.5);
        tutorialButton.position.set(
            playButton.x,
            playButton.y + tutorialButton.height * 1.5
        );
        tutorialButton.interactive = true;
        tutorialButton.mousedown = () => {
            //menu.destroy();
            // call tutorial func
        }
        menu.addChild(tutorialButton);
    }

    const mainGame = () => {
        const makeChanceIndicator = (x, y) => {
            const elem = new PIXI.Sprite.from(
                loader.resources.x_dark.texture);
            elem.scale.set(0.7);
            elem.position.set(x, y);
            game.addChild(elem);
            return elem
        }

        const makeBread = (e) => {
            if(this.bread){
                if(this.bread.popUp) this.bread.popUp.stop();
                this.bread.finToastingLever(lever, toaster.y - toaster / 40);
                clearTimeout(this.bread.timerLoop);
                this.bread.destroy();

                gameData.score -= 10;
                gameData.scoreText.text = `$: ${gameData.score}`;
                gameData.scoreText.x = gameData.scoreText.width / 2;
                toaster.texture = loader.resources.toaster_up.texture;
            }
            this.bread = new breadObj(e.data.global.x, e.data.global.y);
            game.addChild(this.bread);
        }

        const collides = (elem1, elem2) => {
            if(elem1) return elem2.containsPoint(elem1)
        }

        const spreadsInteractive = () => {
            for(const elem of gameData.spreads) elem[1].interactive = true;
        }
        const spreadsUninteractive = () => {
            for(const elem of gameData.spreads) elem[1].interactive = false;
        }

        const game = new PIXI.Container();
        game.sortableChildren = true;
        this.app.stage.addChild(game);

        const orderTV = new PIXI.Sprite.from(
            loader.resources.orderTV.texture);
        orderTV.position.set(orderTV.width / 4, orderTV.height / 4);
        game.addChild(orderTV);

        this.textStyle.fontSize = 62;
        gameData.scoreText = new PIXI.Text(`$: ${gameData.score}`, this.textStyle);
        gameData.scoreText.anchor.set(0.5);
        gameData.scoreText.position.set(gameData.scoreText.width / 2, gameData.scoreText.height / 2);
        game.addChild(gameData.scoreText);

        const chanceIndicator = makeChanceIndicator(
            this.app.view.width - (loader.resources.x_dark.texture.width * 1.5),
            loader.resources.x_dark.texture.height / 6
        );

        const chanceIndicator2 = makeChanceIndicator(
            chanceIndicator.x - (chanceIndicator.width * 1.5),
            chanceIndicator.y
        );
        
        const chanceIndicator3 = makeChanceIndicator(
            chanceIndicator2.x - (chanceIndicator.width * 1.5),
            chanceIndicator.y
        );

        const toaster = new toasterObj(
            loader.resources.toaster_down.texture.width / 2,
            this.app.view.height - loader.resources.toaster_down.texture.height / 2,
            loader
        );
        game.addChild(toaster)
        gameData.breadInteracts.push(['toaster', toaster]);
        gameData.upgradeableItems.push(['toaster', toaster]);

        const lever = new PIXI.Sprite.from(loader.resources.lever.texture);
        lever.position.set(
            (toaster.x - toaster.width / 2) + lever.width / 1.2,
            toaster.y - toaster.height / 4
        );
        lever.zIndex = 3;
        game.addChild(lever);

        const loaf = new PIXI.Sprite.from(loader.resources.loaf.texture);
        loaf.scale.set(0.8);
        loaf.position.set(
            (this.app.view.width - loaf.width * 2) / 2,
            this.app.view.height / 1.75 - loaf.height / 2
        );
        loaf.interactive = true;
        loaf.mousedown = (e) => {makeBread(e);}
        game.addChild(loaf);

        const choppingBoard = new PIXI.Sprite.from(
            loader.resources.choppingBoard.texture);
        choppingBoard.interactive = true;
        choppingBoard.position.set(
            this.app.view.width / 2,
            this.app.view.height / 1.4
        );
        // function to make spreads interactive and non interactive
        // FIX
        choppingBoard.mousemove = (e, runSpreadsUninteractive = false) => {
            const x = e.data.global.x;
            const y = e.data.global.y;

            if(collides(this.bread, choppingBoard) && !runSpreadsUninteractive){
                spreadsInteractive();
                runSpreadsUninteractive = true;
                console.log(runSpreadsUninteractive);
            } else if(runSpreadsUninteractive) {console.log(runSpreadsUninteractive)}
        }
        game.addChild(choppingBoard);
        
        const plate = new PIXI.Sprite.from(loader.resources.plate.texture);
        plate.position.set(
            this.app.view.width / 1.5,
            (this.app.view.height / 5) * 1.75
        );
        plate.interactive = true;
        plate.mousemove = () => {
            if(collides(this.bread, plate)) console.log('plate');
        }
        game.addChild(plate);
    }

    const animate = () => {TWEEN.update(this.app.ticker.lastTime);}
    init();
}

document.addEventListener('DOMContentLoaded', toastR);
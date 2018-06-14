class Menu{
    private game: Game;
    private element: HTMLElement;
    private buttonsContainer: HTMLElement;
    private buttons: Array<MenuButton>;
    private isVisible: boolean;
    private state: string;

    constructor(game: Game){
        this.game = game;

        this.isVisible = false;

        // state of the menu: main or paused
        this.state = "pause";

        // create the menu element
        this.element = document.createElement("gamemenu");
        this.game.element.appendChild(this.element);

        // create the buttons container
        this.buttonsContainer = document.createElement("buttonscontainer");
        this.element.appendChild(this.buttonsContainer);

        // create the buttons in the menu
        this.buttons = new Array<MenuButton>();
        // create the start button
        this.addButton( new MenuButton("start", () => this.start(), ["main"], true) );

        // create continue button
        this.addButton( new MenuButton("continue", () => this.continue(), ["pause"], true ) );
        // create reload button
        this.addButton( new MenuButton("reload level", () => this.reload(), ["pause", "dead"], true ) );
        // create quit button
        this.addButton( new MenuButton("quit", () => this.quit(), ["pause", "dead"], true ) );

        window.addEventListener("keypress", (e:KeyboardEvent) => this.keyHandler(e) );

        // set state of menu
        this.setState("main");
    }

    private addButton(button: MenuButton):void{
        this.buttons.push(button)
        this.buttonsContainer.appendChild(button.element);
    }

    private keyHandler(e: KeyboardEvent):void{
        // open the menu when enter is pressed
        if(e.keyCode == 13){
            this.visible = !this.visible;
            // lock or unlock pointer
            if(this.visible){
                this.game.renderer.unlockPointer();
            }
            else{
                this.game.renderer.lockPointer();
            }
        }
    }

    private setState(state: string):void{
        if(state != this.state){
            this.state = state;
            // show all buttons for given state
            for(let button of this.buttons){
                if(button.states.indexOf(state) != -1){
                    button.visible = true;
                }
                else{
                    button.visible = false;
                }
            }
        }
    }

    // button functions
    private start():void{
        this.game.loadLevel("level_1");
    }
    private continue():void{
        this.game.renderer.lockPointer();
        this.visible = false;
    }
    private reload():void{
        this.game.loadLevel(this.game.level.name);
    }
    private quit():void{
        this.game.loadLevel("main_menu");
    }

    // visibility of menu
    public get visible():boolean{
        return this.isVisible;
    }
    public set visible(visible:boolean){
        if(visible != this.visible){
            this.isVisible = visible;
            this.element.dataset.visible = String(this.visible);
            // pause level when pause menu is shown
            if(this.state != "main"){
                this.game.level.paused = visible;
            }
        }
    }

    public update():void{
        this.visible = this.game.level.paused || this.game.level.name == "main_menu" || !this.game.renderer.pointerIsLocked;

        // set correct state for menu
        if(this.game.level.name == "main_menu"){
            this.setState("main");
        }
        else if(this.game.level.player.isDead){
            this.setState("dead");
        }
        else{
            this.setState("pause");
        }

    }
}
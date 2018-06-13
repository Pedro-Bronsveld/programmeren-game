class Menu{
    private game: Game;
    private element: HTMLElement;
    private buttonsContainer: HTMLElement;
    private buttons: Array<HTMLElement>;
    private isVisible: boolean;

    constructor(game: Game){
        this.game = game;

        this.isVisible = false;

        // create the menu element
        this.element = document.createElement("gamemenu");
        this.game.element.appendChild(this.element);

        // create the buttons container
        this.buttonsContainer = document.createElement("buttonscontainer");
        this.element.appendChild(this.buttonsContainer);

        // create the buttons in the menu
        this.buttons = new Array<HTMLElement>();
        this.addButton("start", () => this.start() );
        this.addButton("useless button", () => console.log("this button does nothing"));

    }

    private addButton(name: string, buttonFunction:Function):void{
        let button: HTMLElement = document.createElement("menubutton");
        button.addEventListener("click", () => buttonFunction() );
        button.innerHTML = name;

        this.buttonsContainer.appendChild(button);
        this.buttons.push(button)
    }

    private start():void{
        this.game.loadLevel("level_1");
    }

    // visibility of menu
    public get visible():boolean{
        return this.isVisible;
    }
    public set visible(visible:boolean){
        this.isVisible = visible;
        this.element.dataset.visible = String(this.visible);
    }

    public update():void{
        
    }
}
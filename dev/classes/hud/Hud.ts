class Hud{
    private propElement: HTMLElement;
    private isVisible: boolean;
    private game: Game;
    private healthbar: Healthbar;
    constructor(game:Game){
        this.game = game;
        this.propElement = document.createElement("hud");
        this.game.element.appendChild(this.element);
        this.isVisible = false;

        this.healthbar = new Healthbar(this.game, this);

        this.visible = true;
    }

    public get visible():boolean{
        return this.isVisible;
    }
    public set visible(visible:boolean){
        this.isVisible = visible;
        this.element.dataset.visible = String(this.isVisible);
    }

    public get element():HTMLElement{
        return this.propElement;
    }

    public update():void{
        this.healthbar.update();
    }
}
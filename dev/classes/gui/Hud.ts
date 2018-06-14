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

    }

    public get visible():boolean{
        return this.isVisible;
    }
    public set visible(visible:boolean){
        if(visible != this.visible){
            this.isVisible = visible;
            this.element.dataset.visible = String(this.isVisible);
        }
    }

    public get element():HTMLElement{
        return this.propElement;
    }

    public update():void{
        this.healthbar.update();

        if( this.game.level.paused || this.game.level.name == "main_menu"){
            this.visible = false;
        }
        else{
            this.visible = true;
        }

    }
}
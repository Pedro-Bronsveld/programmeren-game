class Healthbar{
    private container: HTMLElement;
    private bar: HTMLElement;
    private game: Game;
    private hud: Hud;
    constructor(game: Game, hud: Hud){
        this.game = game;
        this.hud = hud;

        //create healthbar elements:
        this.container = document.createElement("healthcontainer");
        this.bar = document.createElement("healthbar");

        this.container.appendChild(this.bar);
        this.hud.element.appendChild(this.container);
    }

    public update():void{
        //get player health:
        let health: number = this.game.level.player.hp;
        let maxHealth: number = this.game.level.player.maxHp;

        let scaleX:number = health/maxHealth;
        let translateX:number = -(1 - scaleX)*100/2;

        this.bar.style.transform = `translateX(${translateX}%) scaleX(${scaleX})`;
    }
}
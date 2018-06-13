class MainMenu extends Level{
    constructor(game:Game){
        super(game, "main_menu");

        this.cam.assignToRenderer(this.game.renderer);
        this.cam.pY = 50;
        this.cam.pZ = 25;

        //hide hud:
        this.game.hud.visible = false;
        //show menu:
        this.game.menu.visible = true;

    }

    public update():void{

    }
}
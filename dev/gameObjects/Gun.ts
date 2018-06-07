/// <reference path="Model.ts" />

class Gun extends Model{
    private hand: THREE.Bone;
    private player: Player;

    constructor(level: Level, player: Player){
        super(level, "gun", undefined, false);
        this.player = player;

        //get bone of right hand:
        this.hand = player.getMesh().getObjectByName("hand.R");

        //set position and rotation of the gun:
        this.rX = Math.PI;
        this.rY = Math.PI/2;
        
        this.pX = -0.15;
        this.pY = -0.13;
        this.pZ = -0.36;
        

        //add gun to hand:
        this.hand.add(this.mesh);

        

        //add event listeners:
        window.addEventListener("click", (e: MouseEvent) => this.fire(e) );
    }

    private fire(e: MouseEvent){
        //rotate player to right direction:
        this.player.rotateToView();
        
        //create bullet:
        new Bullet(this.level, this, this.level.cam.getTarget() );

    }

}
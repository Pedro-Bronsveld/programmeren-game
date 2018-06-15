/// <reference path="Model.ts" />

class Gun extends Model{
    private hand: THREE.Bone;
    private player: Player;
    private fireState: number;
    private enabled: boolean;

    constructor(level: Level, player: Player){
        super(level, "gun", undefined, false);
        this.player = player;

        // gun is able to fire
        this.enabled = false;

        // get bone of right hand
        this.hand = player.getMesh().getObjectByName("hand.R");
        
        // fire state of gun
        // 0: waiting for click fire event.
        // 1: click event initiated fire.
        // 2: create bullet in next update loop.
        this.fireState = 0;

        // set position and rotation of the gun
        this.rX = Math.PI;
        this.rY = Math.PI/2;
        
        this.pX = -0.15;
        this.pY = -0.13;
        this.pZ = -0.36;
        
        // add gun to hand
        this.hand.add(this.mesh);

        // add event listeners
        this.level.game.events.gunFire = this.mouseHandler;
        
    }

    private mouseHandler = () =>{
        if(this.fireState == 0 && this.enabled){
            this.fireState = 1;
        }
    }

    public update():void{
        if(!this.player.isDead){

            // firing a bullet
            if(this.fireState == 1){
                // rotate player to right direction
                this.player.rotateToView();
                this.fireState = 2;
            }
            else if(this.fireState == 2){
                // create bullet
                let targetVector: THREE.Vector3 = this.level.playerCam.getTarget();
                new Bullet(this.level, this.getWorldMatrix(), targetVector, new THREE.Vector3(-5, -0.40, 0), [this.player.modelName], undefined, 0xff0000);
                this.fireState = 0;
            }
        }
        
    }

    public updateAlways():void{
        // disable firing when a menu is visible
        this.enabled = !this.level.game.menu.visible;
    }

}
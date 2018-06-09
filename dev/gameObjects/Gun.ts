/// <reference path="Model.ts" />

class Gun extends Model{
    private hand: THREE.Bone;
    private player: Player;
    private fireState: number;

    constructor(level: Level, player: Player){
        super(level, "gun", undefined, false);
        this.player = player;

        //get bone of right hand:
        this.hand = player.getMesh().getObjectByName("hand.R");
        
        //fire state of gun:
        // 0: waiting for click fire event.
        // 1: click event initiated fire.
        // 2: create bullet in next update loop.
        this.fireState = 0;

        //set position and rotation of the gun:
        this.rX = Math.PI;
        this.rY = Math.PI/2;
        
        this.pX = -0.15;
        this.pY = -0.13;
        this.pZ = -0.36;
        

        //add gun to hand:
        this.hand.add(this.mesh);

        

        //add event listeners:
        window.addEventListener("click", (e: MouseEvent) => this.mouseHandler(e) );
    }

    private mouseHandler(e: MouseEvent){
        if(this.fireState == 0){
            this.fireState = 1;
        }
        

    }

    public update(delta:number):void{
        //firing a bullet:
        if(this.fireState == 1){
            //rotate player to right direction:
            this.player.rotateToView();
            this.fireState = 2;
        }
        else if(this.fireState == 2){
            //it takes another frame for the world matrix to update for whatever reason...
            this.fireState = 3
        }
        else if(this.fireState == 3){
            //create bullet:
            new Bullet(this.level, this, this.level.cam.getTarget() );
            this.fireState = 0;
        }
    }

}
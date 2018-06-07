/// <reference path="MobileModel.ts" />

class Player extends MobileModel{
    private upKey: number;
    private leftKey: number;
    private downKey: number;
    private rightKey: number;
    private jumpKey: number;
    private cameraRotation: number;
    private gun: Gun;

    constructor(level: Level){
        super(level, "player");
        this.cameraRotation = 0;
        this.hasCollision = true;
        this.hasGravity = true;

        //setup input keycodes:
        //Up - W
        this.upKey = 87;
        //Left - A
        this.leftKey = 65;
        //Down - S
        this.downKey = 83;
        //Right - D
        this.rightKey = 68;
        //Jump - spacebar
        this.jumpKey = 32;

        //add event listeners:
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
        //window.addEventListener("mousemove", this.mouseHandler);

        //create gun:
        this.gun = new Gun(this.level, this);

        if(this.hasCollision){
            //create collision box:
            this.collisionBox = new CollisionBox(this, 2, 7.5, 2, 0, 7.5/2, 0, 5, true, false, false);
        }

        //set animation:
        //this.actions.idle.play();
        this.playAction("idle");

        //set walk action speed:
        this.actionTimeScale("walk", 1.7);

    }

    protected afterMeshLoad(){
        super.afterMeshLoad();

    }

    private keyDownHandler = (e: KeyboardEvent):void => {
        if(!e.repeat){
            switch(e.keyCode){
                case this.upKey:
                    //move forward:
                    this.moving.forward = 1;
                    break;
                case this.leftKey:
                    //move left:
                    this.moving.sideways = 1;
                    break;
                case this.downKey:
                    //move backward:
                    this.moving.forward = -1;
                    break;
                case this.rightKey:
                    //move right:
                    this.moving.sideways = -1;
                    break;
                case this.jumpKey:
                    //jump
                    this.jump = true;
                    break;
            }
        }
    }

    private keyUpHandler = (e: KeyboardEvent):void => {
        if(!e.repeat){

            switch(e.keyCode){
                case this.upKey:
                    //stop moving forward
                    if(this.moving.forward == 1){
                        this.moving.forward = 0;
                    }
                    break;
                case this.leftKey:
                    //stop moving left
                    if(this.moving.sideways == 1){
                        this.moving.sideways = 0;
                    }
                    break;
                case this.downKey:
                    //stop moving backward
                    if(this.moving.forward == -1){
                        this.moving.forward = 0;
                    }
                    break;
                case this.rightKey:
                    //stop moving right
                    if(this.moving.sideways == -1){
                        this.moving.sideways = 0;
                    }
                    break;
                case this.jumpKey:
                    this.jump = false;
                    break;
            }

        }
    }

    protected moveUpdate(delta: number){

        if(this.moving.forward != 0 || this.moving.sideways != 0){
            //player is moving
            this.rotateToView();

            //play walking animation if it's not paused:
            this.playAction("walk");
        }
        else{
            //player not moving
            this.playAction("idle");
        }

        super.moveUpdate(delta);

    }

    public rotateToView():void{
        //set y axis rotation equal to the camera:
        let rotationY:number = this.propLevel.cam.viewRotY;
        this.rY = rotationY;
    }

    public getCameraRotation():number{
        return this.cameraRotation;
    }

    public update(delta: number){

        super.update(delta);
    }

}
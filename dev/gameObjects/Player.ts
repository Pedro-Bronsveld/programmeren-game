/// <reference path="MobileModel.ts" />

class Player extends MobileModel{
    private upKey: number;
    private leftKey: number;
    private downKey: number;
    private rightKey: number;
    private jumpKey: number;
    private cameraRotation: number;
    private rotationSpeed: number;

    // key states
    private forward: boolean;
    private backward: boolean;
    private left: boolean;
    private right: boolean;

    // direction values
    readonly dirForward: number;
    readonly dirBackward: number;
    readonly dirLeft: number;
    readonly dirRight: number;

    // health
    private health: number;
    private maxHealth: number;
    private dead: boolean;
    private timeSinceDeath: number;

    private gun: Gun;

    constructor(level: Level, rotateY:number=0){
        super(level, "player");
        this.cameraRotation = 0;
        this.hasCollision = true;
        this.hasGravity = true;

        // number of radians the player can rotate in one second
        this.rotationSpeed = 5*Math.PI;

        // setup health
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.health = 100;
        this.dead = false;
        this.timeSinceDeath = 0;

        // set initial key states
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;

        // set direction values
        this.dirForward = 1;
        this.dirBackward = -1;
        this.dirLeft = 1;
        this.dirRight = -1;

        // setup input keycodes
        // Up - W
        this.upKey = 87;
        // Left - A
        this.leftKey = 65;
        // Down - S
        this.downKey = 83;
        // Right - D
        this.rightKey = 68;
        // Jump - spacebar
        this.jumpKey = 32;

        // add event listeners
        this.level.game.events.moveStart = this.keyDownHandler;
        this.level.game.events.moveStop = this.keyUpHandler;

        // create gun
        this.gun = new Gun(this.level, this);

        if(this.hasCollision){
            // create collision box
            this.collisionBox = new CollisionBox(this, 2, 7.5, 2, 0, 7.5/2, 0, 5, true, false, new THREE.Vector3(1,2,1), true, [this.modelName, "turret_top"] );
        }

        // rotate player when loaded
        this.rY = rotateY;

        // set animation
        // this.actions.idle.play();
        this.playAction("idle", undefined, false);

        // set walk action speed
        this.actionTimeScale("walk", 1.7);

    }

    public get hp():number{ return this.health; }
    public get maxHp():number{ return this.maxHealth; }
    public get isDead():boolean{ return this.dead };

    public hit(damage:number):number{
        if(this.health > 0){
            this.health -= damage;
        }
        if(this.health < 0){
            this.health = 0;
        }

        if(this.health <= 0){
            // dead
            this.dead = true;
            this.playAction("death", 0);
        }
        return 0.05;
    }

    private keyDownHandler = (e: KeyboardEvent):void => {
        e.stopPropagation();
        if(!e.repeat){
            switch(e.keyCode){
                case this.upKey:
                    // move forward
                    this.moving.forward = this.dirForward;
                    this.forward = true;
                    break;
                case this.leftKey:
                    // move left
                    this.moving.sideways = this.dirLeft;
                    this.left = true;
                    break;
                case this.downKey:
                    // move backward
                    this.moving.forward = this.dirBackward;
                    this.backward = true;
                    break;
                case this.rightKey:
                    // move right
                    this.moving.sideways = this.dirRight;
                    this.right = true;
                    break;
                case this.jumpKey:
                    // jump
                    this.jump = true;
                    break;
            }
        }
    }

    private keyUpHandler = (e: KeyboardEvent):void => {
        if(!e.repeat){

            switch(e.keyCode){
                case this.upKey:
                    // stop moving forward
                    if(this.moving.forward == this.dirForward && !this.backward){
                        this.moving.forward = 0;
                    }
                    else if(this.backward){
                        this.moving.forward = this.dirBackward;
                    }
                    this.forward = false;
                    break;
                case this.leftKey:
                    // stop moving left
                    if(this.moving.sideways == this.dirLeft && !this.right){
                        this.moving.sideways = 0;
                    }
                    else if(this.right){
                        this.moving.sideways = this.dirRight;
                    }
                    this.left = false
                    break;
                case this.downKey:
                    // stop moving backward
                    if(this.moving.forward == this.dirBackward && !this.forward){
                        this.moving.forward = 0;
                    }
                    else if(this.forward){
                        this.moving.forward = this.dirForward;
                    }
                    this.backward = false;
                    break;
                case this.rightKey:
                    // stop moving right
                    if(this.moving.sideways == this.dirRight && !this.left){
                        this.moving.sideways = 0;
                    }
                    else if(this.left){
                        this.moving.sideways = this.dirLeft;
                    }
                    this.right = false;
                    break;
                case this.jumpKey:
                    this.jump = false;
                    break;
            }

        }
    }

    protected moveUpdate(delta: number){

        if(!this.dead){
            
            if(this.gun.isFiring){
                // rotate player to view if fire button is being held
                this.rotateToView(delta);
            }
            
            if(this.moving.forward != 0 || this.moving.sideways != 0){
                // player is moving
                if(!this.gun.isFiring){
                    this.rotateToView(delta);
                }

                // determine animation to play
    
                if(this.yVelocity > 0.1 && this.bottomDistance > 0.1){
                    // jump 
                    this.playAction("jump", 0);
                }
                else if(this.yVelocity <= 0.1 && this.bottomDistance > 0.5){
                    // falling
                    this.playAction("falling");
                }
                else if(this.moving.forward > 0 && this.moving.sideways == 0){
                    // walking forwards
                    this.actionTimeScale("walk", 1.7);
                    this.playAction("walk");
                }
                else if(this.moving.sideways == 0){
                    // walking backwards
                    this.actionTimeScale("walk", -1.7);
                    this.playAction("walk");
                }
                else if(this.moving.sideways > 0 && this.moving.forward >= 0){
                    // walking left or forward and left
                    this.actionTimeScale("strafe_left", 1.7);
                    this.playAction("strafe_left");
                }
                else if(this.moving.sideways < 0 && this.moving.forward >= 0){
                    // walking right or forward and left
                    this.actionTimeScale("strafe_right", 1.7);
                    this.playAction("strafe_right");
                }
                else if(this.moving.forward < 0 && this.moving.sideways > 0){
                    // walking left and backwards
                    this.actionTimeScale("strafe_right", -1.7);
                    this.playAction("strafe_right");
                }
                else if(this.moving.forward < 0 && this.moving.sideways < 0){
                    // walking right and backwards
                    this.actionTimeScale("strafe_left", -1.7);
                    this.playAction("strafe_left");
                }
    
                
            }
            else if(this.yVelocity > 0.1 && this.bottomDistance > 0.1){
                // jump 
                this.playAction("jump", 0);
            }
            else if(this.yVelocity < -1 && this.bottomDistance > 1){
                // falling
                this.playAction("falling");
            }
            else{
                // player not moving
                this.playAction("idle");
            }
    
            super.moveUpdate(delta, new THREE.Vector3(0, this.level.playerCam.viewRotY, 0));
        }

        this.rY = ( (this.rY + (3*Math.PI)) % (2 * Math.PI) ) - Math.PI;


    }

    private rotateToView(delta:number, instant:boolean=false):void{
        let camRotationY:number = this.level.playerCam.viewRotY;
        if(instant){
            // set y axis rotation equal to the camera
            this.rY = camRotationY;
        }
        else{
            // gradually turn to match camera rotation
            this.rY = this.tween.radians(this.rY, camRotationY, this.rotationSpeed * delta);
        }
    }

    public getCameraRotation():number{
        return this.cameraRotation;
    }

    public update(delta: number){
            
        super.update(delta);

        if(this.dead){
            this.timeSinceDeath += delta;

            // show game over screen after dying
            if(this.timeSinceDeath > 1.5){
                this.level.game.menu.visible = true;
                this.level.game.renderer.unlockPointer();
            }
        }

    }

}
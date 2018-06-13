/// <reference path="Model.ts" />

// a model able to be moved backward and forward, have collision and gravity
class MobileModel extends Model{

    protected moving: Moving;
    protected velocity: number;
    protected hasCollision: boolean;
    protected collisionBox: CollisionBox;
    protected hasGravity: boolean;
    protected yVelocity: number;
    protected jump: boolean;
    protected bottomDistance: number;

    constructor(level: Level, model: string, modelSource: ModelSource = new ModelSource(), autoAdd:boolean=true){
        super(level, model, modelSource, autoAdd);
        // collision
        this.hasCollision = false;
        this.collisionBox = new CollisionBox(this);
        
        // vertical movement
        this.hasGravity = false;
        this.yVelocity = 0;
        this.jump = false;
        this.bottomDistance = 0;

        // horizontal movement
        this.moving = new Moving();
        // velocity in units/second
        this.velocity = 35;
    }
    
    public get collisionEnabled():boolean{
        return this.hasCollision;
    }

    // move the model relative to its rotation
    protected moveUpdate(delta: number):void{

        // get move direction
        let moveZ:number = Math.abs(this.moving.forward);
        let moveX:number = Math.abs(this.moving.sideways);
        let moveTotal:number = moveZ + moveX;

        let direction: THREE.Vector2 = new THREE.Vector2(moveX, moveZ).normalize();

        if(this.collisionBox.collisionVisible){
            // set rotation for debugging collision box mesh
            this.collisionBox.rX = -this.rX;
            this.collisionBox.rY = -this.rY;
            this.collisionBox.rZ = -this.rZ;
        }

        if(moveTotal > 0){

            // caluclate amount to move forward and sideways
            let dirZ:number = this.moving.forward / moveZ;
            let dirX:number = this.moving.sideways / moveX;

            if(isNaN(dirZ)){
                dirZ = 0;
            }
            if(isNaN(dirX)){
                dirX = 0;
            }

            let velocityZ = direction.y * dirZ * this.velocity * delta;
            let velocityX = direction.x * dirX * this.velocity * delta;

            // check collision in front and on the sides,
            // this is the maximim distance the model can be translated before hitting something
            let front: number = this.collisionBox.front().distance;
            let back: number = this.collisionBox.back().distance;
            let right: number = this.collisionBox.right().distance;
            let left: number = this.collisionBox.left().distance;

            // set the transformation to the direction the camera is facing
            let transform: THREE.Vector3 = new THREE.Vector3(velocityX, 0, velocityZ);
            transform.applyAxisAngle(new THREE.Vector3(0,1,0), this.rY);
            
            // check for collision
            if(this.hasCollision){
                // forward and backward
                if(transform.z > 0){
                    // moving forward on z axis
                    if(front < transform.z){
                        transform.z = front;
                    }
                }
                else if(transform.z < 0){
                    // moving backward on z axis
                    if(back < -transform.z){
                        transform.z = -back;
                    }
                }

                // sideways
                if(transform.x > 0){
                    // moving left on x axis
                    if(left < transform.x){
                        transform.x = left;
                    }
                }
                else if(transform.x < 0){
                    // moving right on x axis
                    if(right < -transform.x){
                        transform.x = -right;
                    }
                }
            }
            
            // apply transoformation
            this.mesh.position.x += transform.x;
            this.mesh.position.z += transform.z;

        }

        // vertical movement
        if(this.hasGravity){

            // get distance on bottom
            let bottom: number = this.collisionBox.bottom().distance;
            let top: number = this.collisionBox.top().distance;
            this.bottomDistance = bottom;

            // ammount to translate y
            let amount: number = 0;

            // check bottom
            if(bottom <= 0 && this.yVelocity < 0){
                // on or under the floor
                amount = -bottom;
            }
            else{
                // in the air
                this.yVelocity -= 2.4 * delta;

                if(this.yVelocity < 0){

                    if(bottom < -this.yVelocity ){
                        this.yVelocity = -bottom;
                    }

                }

                amount = this.yVelocity;

                // check for a ceiling
                if(this.yVelocity > 0 && top < this.yVelocity){
                    this.yVelocity = 0;
                    amount = top;
                }
            }

            if(bottom <= 0.3 && this.jump){
                this.yVelocity = 0.9;
                amount = this.yVelocity;
                this.jump = false;
            }
            else{
                this.jump = false;
            }

            this.mesh.translateY(amount);

        }

    }

    public update(delta:number){
        super.update(delta);

        // updating position
        this.moveUpdate(delta);
    }

}
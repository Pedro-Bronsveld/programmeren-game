/// <reference path="MobileModel.ts" />

class Bullet extends MobileModel{

    private despawnTimeout:number;

    constructor(level: Level, gun: Gun, target:THREE.Vector3){
        super(level, "bullet");
        
        this.hasCollision = true;
        this.collisionBox = new CollisionBox(this, 0.8, 0.8, 4, 0, 0, -1, 5, false, true);

        //change material of bullet:
        var bulletMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        this.mesh.material = bulletMaterial;

        //time in seconds before bullet despawns:
        this.despawnTimeout = 5;

        //move bullet to barrel of gun:
        let position: THREE.Vector3 = new THREE.Vector3();
        position.x = -5;
        position.z = -0.75;

        position.applyMatrix4( gun.getWorldMatrix() );
        console.log();   
        this.posVector = position;

        this.mesh.lookAt(target);

        this.moving.forward = 1;

        //velocity in units/second
        this.velocity = 180;
        
    }

    protected moveUpdate(delta: number):void{

        this.despawnTimeout -= delta;

        if(this.despawnTimeout <= 0){
            this.remove();
        }
        
        //check collision:
        if(this.moving.forward > 0){
            let front: RayData = this.collisionBox.front();

            if(front.distance <= 0 && front.intersected){
                this.collided(front);
            }

            if(this.moving.forward > 0){
                //amount to translate:
                let amount: number = this.velocity * delta;

                //check for collision:
                if(front.distance < amount && front.intersected){
                    amount = front.distance + 0.2;
                    this.collided(front);
                }

                this.mesh.translateZ(amount);

            }
        }
        else if(this.despawnTimeout > 1){
            this.despawnTimeout = 1;
        }

    }

    private collided(rayData: RayData):void{
        //set movement to 0
        this.moving.forward = 0;

        //check if collision was with practice_target:
        if(rayData.model.name == "practice_target"){
            let model:Model = this.level.getModelByName(rayData.model.userData.uniqueName)!;
            model.hit();
        }
    }

    public remove():void{
        this.level.removeModel(this);
    }

    public update(delta: number){
        this.moveUpdate(delta);
    }

    
}
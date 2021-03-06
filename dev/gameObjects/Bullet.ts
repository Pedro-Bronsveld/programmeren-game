/// <reference path="MobileModel.ts" />

class Bullet extends MobileModel{

    private despawnTimeout:number;
    private damage: number

    constructor(
        level: Level,
        worldMatrix: THREE.Matrix4,
        target:THREE.Vector3,
        barelOffset:THREE.Vector3,
        ignoreModels:Array<string>=new Array<string>(),
        ignoreNames:Array<string>=new Array<string>(),
        color:number=0xff0000,
        damage:number=10
        ){
        super(level, "bullet");
        // damage the bullet does on impact
        this.damage = damage;
        
        this.hasCollision = true;
        this.collisionBox = new CollisionBox(this, 1, 0.9, 6, 0, 0, -1.5, 5, false, true, new THREE.Vector3(1,1,1), true, ignoreModels, ignoreNames);

        // change material of bullet
        var bulletMaterial = new THREE.MeshBasicMaterial( { color: color } );
        this.mesh.material = bulletMaterial;

        // time in seconds before bullet despawns without hitting anything
        this.despawnTimeout = 5;

        // move bullet to barrel of gun
        let position: THREE.Vector3 = new THREE.Vector3();
        position.x = barelOffset.x;
        position.y = barelOffset.y;
        position.z = barelOffset.z;

        position.applyMatrix4( worldMatrix ); 
        this.posVector = position;

        this.mesh.lookAt(target);

        this.moving.forward = 1;

        // velocity in units/second
        this.velocity = 180;
        
    }

    protected moveUpdate(delta: number):void{

        this.despawnTimeout -= delta;

        if(this.despawnTimeout <= 0){
            this.remove();
        }
        
        // check collision
        if(this.moving.forward > 0){
            let front: RayData = this.collisionBox.front();

            // check for colision
            if(front.distance <= 0 && front.intersected ){
                this.colided(front);
                return;
            }

            // amount to translate
            let amount: number = this.velocity * delta;

            // check for incomming colision
            if(front.distance < amount && front.intersected){
                amount = front.distance + 0.5;
                this.mesh.translateZ(amount);
                this.colided(front);
                return;
            }

            this.mesh.translateZ(amount);

        }

    }

    private colided(rayData: RayData):void{
        // set movement to 0
        this.moving.forward = 0;

        // tell model it was hit
        let model:Model = this.level.getModelByName(rayData.model.userData.uniqueName)!;
        this.despawnTimeout = model.hit(this.damage);
    }

    public remove():void{
        this.level.removeModel(this);
    }

    public update(delta: number){
        this.moveUpdate(delta);
    }

    
}
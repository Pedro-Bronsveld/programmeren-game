class TurretTop extends Model{
    private target: THREE.Vector3;
    private cooldown: number;
    private turretBase: TurretBase;
    private intersectsFilter: IntersectsFilter;
    private targetOffset: THREE.Vector3;
    private playerSpotted: boolean;
    
    private health: number;
    private destroyed: boolean;

    constructor(level: Level, turretBase: TurretBase){
        super(level, "turret_top");
        this.turretBase = turretBase;
        this.target = new THREE.Vector3();
        this.cooldown = 1;
        this.intersectsFilter = new IntersectsFilter(this.level, ["practice_target"], [this.name, this.turretBase.name]);
        this.targetOffset = new THREE.Vector3(0, 3.5, 0);
        //this.turnSpeed = Math.PI;

        this.playerSpotted = false;

        this.health = 100;
        this.destroyed = false;
    }

    public hit():void{
        if(this.health > 0){
            this.health -= 10;
        }
        
        if(this.health <= 0 && !this.destroyed){
            this.destroyed = true;

            //set turret horizontal:
            let target: THREE.Vector3 = new THREE.Vector3(this.level.player.posVector.x, this.pY, this.level.player.posVector.z );
            this.mesh.lookAt(target);

            //ignore collision of turret top from now on:
            this.level.addNoCollisionName(this.name);

            this.playAction("destroy", 0);
        }
    }

    /*
    private turnToTarget(delta: number):void{

        let target:THREE.Vector3 = new THREE.Vector3();
        target.subVectors(this.target, this.posVector);

        //calculate rotation:
        function calcAngle(x:number, y:number) {
            return Math.atan2(y, x);
        }

        let rYstart = this.rY;

        this.rX = 0;
        this.rY = 0;
        this.rZ = 0;

        //rotation on x axis:
        //calculate horizontal distance between turret and player:
        let distanceX:number = Math.abs(target.x);
        let distanceZ:number = Math.abs(target.z);
        let distance:number = Math.sqrt( Math.pow(distanceX,2) + Math.pow(distanceZ,2) );

        let rotX:number = -calcAngle(distance, target.y);
        //this.rX = rotX;
        this.mesh.rotateOnWorldAxis(new THREE.Vector3(1,0,0), rotX);

        


        //rotation on y axis:
        let rotY:number = calcAngle(-target.x, target.z) - Math.PI/2;
        //this.rY = rotY;
        

        if(rYstart - this.rY > this.turnSpeed * delta){
            this.
        }

        

    }
    */

    public fire():void{
        new Bullet(this.level, this.mesh.matrixWorld, this.target, new THREE.Vector3(0,0,7), undefined, [this.name, this.turretBase.name], 0xccff00, 0.05 );
    }

    public update(delta:number):void{
        super.update(delta);

        let newTarget: THREE.Vector3 = this.level.player.posVector;
        newTarget.y += this.targetOffset.y;

        let distanceToTarget:number = this.posVector.distanceTo( newTarget );

        if(!this.destroyed && !this.level.player.isDead && distanceToTarget < 300){
    
            let direction: THREE.Vector3 = new THREE.Vector3();
            direction.subVectors(newTarget, this.posVector).normalize();
    
            let raycaster: THREE.Raycaster = new THREE.Raycaster(this.posVector, direction, 0, 200);
            let intersects: Array<THREE.Intersection> = raycaster.intersectObjects(this.level.getScene().children);
            
            intersects = this.intersectsFilter.check(intersects);
    
            if(this.cooldown > 0){
                this.cooldown -= delta;
            }
    
            if(intersects.length > 0 && intersects[0].object.name == "player"){
                //target is in line of sight
                this.target = newTarget;
    
                this.mesh.lookAt(this.target);
                this.playerSpotted = true;
    
            }
    
            if(this.cooldown <= 0 && this.playerSpotted){
                this.fire();
                this.cooldown = 1;
            }
        }

    }

}
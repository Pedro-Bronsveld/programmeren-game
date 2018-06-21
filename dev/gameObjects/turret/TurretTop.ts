class TurretTop extends Model{
    private target: THREE.Vector3;
    private cooldown: number;
    private turretBase: TurretBase;
    private intersectsFilter: IntersectsFilter;
    private targetOffset: THREE.Vector3;
    private playerSpotted: boolean;
    private rotationSpeed: number;
    
    private health: number;
    private destroyed: boolean;

    private currentRotX:number;
    private currentRotY:number;

    private sound: ModelSound;

    constructor(level: Level, turretBase: TurretBase){
        super(level, "turret_top");
        this.turretBase = turretBase;
        this.target = new THREE.Vector3();
        this.cooldown = 0.5;
        this.intersectsFilter = new IntersectsFilter(this.level, ["practice_target"], [this.name, this.turretBase.name]);
        this.targetOffset = new THREE.Vector3(0, 3.5, 0);

        // number of radians the turret can rotate in one second
        this.rotationSpeed = Math.PI/2;

        this.currentRotX = this.rX;
        this.currentRotY = this.rY;

        this.playerSpotted = false;

        this.health = 100;
        this.destroyed = false;

        this.sound = new ModelSound(this.level.game, this, ["laser_2"]);
    }

    public hit():number{
        if(this.health > 0){
            this.health -= 10;
        }
        
        if(this.health <= 0 && !this.destroyed){
            this.destroyed = true;

            // set turret horizontal
            let target: THREE.Vector3 = new THREE.Vector3(this.level.player.posVector.x, this.pY, this.level.player.posVector.z );
            this.mesh.lookAt(target);

            // ignore collision of turret top from now on
            this.level.addNoCollisionName(this.name);

            this.playAction("destroy", 0);
        }
        return 0.5;
    }

    private turnToTarget(delta: number):void{

        let target:THREE.Vector3 = new THREE.Vector3();
        target.subVectors(this.target, this.posVector);

        // calculate rotation
        function calcAngle(x:number, y:number) {
            return Math.atan2(y, x);
        }

        this.rX = 0;
        this.rY = 0;
        this.rZ = 0;

        // rotation on x axis
        // calculate horizontal distance between turret and player
        let distanceX:number = Math.abs(target.x);
        let distanceZ:number = Math.abs(target.z);
        let distance:number = Math.sqrt( Math.pow(distanceX,2) + Math.pow(distanceZ,2) );

        // x rotation to turn to
        let toRotX:number = -calcAngle(distance, target.y);
        this.currentRotX = this.tween.radians(this.currentRotX, toRotX, this.rotationSpeed * delta);
        //this.rX = this.currentRotX;
        this.mesh.rotateOnWorldAxis( new THREE.Vector3(1,0,0), this.currentRotX );

        // y rotation to turn to
        let toRotY:number = calcAngle(target.z, target.x);
        this.currentRotY = this.tween.radians(this.currentRotY, toRotY, this.rotationSpeed * delta);
        //this.rY = this.currentRotY;
        this.mesh.rotateOnWorldAxis( new THREE.Vector3(0,1,0), this.currentRotY );
        
    }

    public fire():void{
        this.sound.play("laser_2", 1, true);
        new Bullet(this.level, this.mesh.matrixWorld, this.currentTarget, new THREE.Vector3(0,0,7), undefined, [this.name, this.turretBase.name], 0xccff00, 10 );
    }

    private get currentTarget():THREE.Vector3{
        //returns a target at the position the turret is currently facing.
        let vector: THREE.Vector3 = new THREE.Vector3(0,0,10);
        vector.applyMatrix4(this.getWorldMatrix());
        return vector;
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
                // target is in line of sight
                this.target = newTarget;
    
                //this.mesh.lookAt(this.target);
                this.turnToTarget(delta);

                this.playerSpotted = true;
    
            }
    
            if(this.cooldown <= 0 && this.playerSpotted){
                this.fire();
                this.cooldown = 0.5;
            }
        }

    }

}
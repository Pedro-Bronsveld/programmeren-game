class TurretTop extends Model{
    private target: THREE.Vector3;
    private cooldown: number;
    private turretBase: TurretBase;
    private intersectsFilter: IntersectsFilter;
    private targetOffset: THREE.Vector3;
    constructor(level: Level, turretBase: TurretBase){
        super(level, "turret_top");
        this.turretBase = turretBase;
        this.target = new THREE.Vector3();
        this.cooldown = 1;
        this.intersectsFilter = new IntersectsFilter(undefined, [this.name, this.turretBase.name]);
        this.targetOffset = new THREE.Vector3(0, 3.5, 0);
    }

    public update(delta:number):void{

        let newTarget: THREE.Vector3 = this.level.player.posVector;
        newTarget.y += this.targetOffset.y;

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
            
            let rYstart: number = this.rY;

            this.mesh.lookAt(this.target);

        }

        if(this.cooldown <= 0){
            this.fire();
            this.cooldown = 1;
        }

    }

    private turnToTarget():void{

        let target:THREE.Vector3 = new THREE.Vector3();
        target.subVectors(this.target, this.posVector);

        //calculate rotation:
        function calcAngle(x:number, y:number) {
            return Math.atan2(y, x);
        }

        /*
        //rotation on x axis:
        //calculate horizontal distance between turret and player:
        let distanceX:number = Math.abs(target.x);
        let distanceZ:number = Math.abs(target.z);
        let distance:number = Math.sqrt( Math.pow(distanceX,2) + Math.pow(distanceZ,2) );

        let rotX:number = -calcAngle(distance, target.y);
        this.rX = rotX;

        //rotation on y axis:
        let rotY:number = calcAngle(-target.x, target.z) - Math.PI/2;
        this.rY = rotY;
        */


        var position = new THREE.Vector3();
        var quaternion = new THREE.Quaternion();
        var scale = new THREE.Vector3();

        this.getWorldMatrix().decompose( position, quaternion, scale );


    }

    public fire():void{
        new Bullet(this.level, this.mesh.matrixWorld, this.target, new THREE.Vector3(0,0,7), undefined, [this.name, this.turretBase.name], 0xccff00, 0.05 );
    }

}
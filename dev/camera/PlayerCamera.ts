class PlayerCamera extends Camera{
    private targetModel: Player;
    private viewRotateX: number;
    private viewRotateY: number;
    private yOffset: number;
    private distance: number;
    private defaultDistance: number;
    private targetIntersectsFilter: IntersectsFilter;
    private cameraIntersectsFilter: IntersectsFilter;

    constructor(level: Level, model: Player){
        super(level);
        this.targetModel = model;

        //y offset of the camera
        this.yOffset = 10;
        //default distance between the player and the camera:
        this.defaultDistance = 15;
        this.distance = this.defaultDistance;

        this.viewRotateX = 0;
        this.viewRotateY = 0;

        //setup intersects filter:
        this.targetIntersectsFilter = new IntersectsFilter(this.level ,undefined, [this.targetModel.name]);
        this.cameraIntersectsFilter = new IntersectsFilter(this.level, ["turret_top"], [this.targetModel.name]);

        //add mouse event listeners:
        window.addEventListener("mousemove", this.mouseHandler);

        //add crosshair:
        let crosshair: Model = new Model(level, "crosshair", undefined, false);
        var crosshairMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.75});
        crosshair.material = crosshairMaterial;

        crosshair.pZ = -0.1;
        crosshair.sY = 0.002;
        crosshair.sX = 0.002;

        //add crosshair to camera:
        this.camera.add(crosshair.getMesh());
        
    }

    public getTarget():THREE.Vector3{
        //set direction vector to the side the camera is facing
        let direction = new THREE.Vector3( 0, 0, -1 );
        direction.applyQuaternion( this.camera.quaternion );

        //max distance a ray will be cast:
        let maxDistance = 200;

        //create raycaster
        let rayCaster: THREE.Raycaster = new THREE.Raycaster(this.camera.position, direction, 0, maxDistance);
        //get intersected objects:
        let intersects: THREE.Intersection[] = rayCaster.intersectObjects( this.level.getScene().children );

        //filter intersects array:
        intersects = this.targetIntersectsFilter.check(intersects);

        if(intersects.length > 0){
            return intersects[0].point;
        }
        else{
            //calculate furthest point of the raycaster:
            let maxPoint:THREE.Vector3 = new THREE.Vector3(0,0,-maxDistance);
            maxPoint.applyQuaternion( this.camera.quaternion );
            /*maxPoint.applyAxisAngle( new THREE.Vector3(1, 0, 0), this.camera.rotation.x );
            maxPoint.applyAxisAngle( new THREE.Vector3(0, 1, 0), this.camera.rotation.y ); */

            //maxPoint.applyMatrix4(this.camera.matrixWorld);
            maxPoint.x += this.camera.position.x;
            maxPoint.y += this.camera.position.y;
            maxPoint.z += this.camera.position.z;
            
            return maxPoint;
        }
    }

    private mouseHandler = (e: MouseEvent) => {
        if(this.level.game.renderer.pointerIsLocked){

            let sens:number = 0.0015;

            this.viewRotateX += e.movementY * sens;
            this.viewRotateY -= e.movementX * sens;

            //x axis rotation limits:
            let xMax:number = Math.PI/2 - 0.0001;
            let xMin:number = -xMax;
            if(this.viewRotateX > xMax){
                this.viewRotateX = xMax;
            }
            else if(this.viewRotateX < xMin){
                this.viewRotateX = xMin;
            }

        }
    }

    public get viewRotY():number{
        return this.viewRotateY;
    }
    public get viewRotX():number{
        return this.viewRotateX;
    }

    public update():void{

        function changeDirection(inputVector:THREE.Vector3, angleX:number, angleY:number):THREE.Vector3{
            //change the direction of a vector:
            //x and y axis:
            let axisX: THREE.Vector3 = new THREE.Vector3(1,0,0);
            let axisY: THREE.Vector3 = new THREE.Vector3(0,1,0);

            //create output vector:
            let directionVector: THREE.Vector3 = new THREE.Vector3().copy(inputVector);
            //change direction:
            directionVector.applyAxisAngle(axisX, angleX);
            directionVector.applyAxisAngle(axisY, angleY);
            return directionVector;
        }

        //create the target vector of the camera:
        let cameraTarget:THREE.Vector3 = this.targetModel.posVector;
        cameraTarget.y += this.yOffset;

        //updating the camera rotation:

        //angles to rotate:
        let angleX:number = this.viewRotateX;
        let angleY:number = this.viewRotateY;

        //check if there's no objects between the camera and the player:
        //set directional vector:
        let raycasterDirection: THREE.Vector3 = new THREE.Vector3(0,0,-1);
        //change rotation of vector:
        raycasterDirection = changeDirection(raycasterDirection, angleX, angleY);
        //create raycaster, origin point is the camera target vector:
        let rayCaster: THREE.Raycaster = new THREE.Raycaster(cameraTarget, raycasterDirection, 0, this.distance + 1);
        let intersects: Array<THREE.Intersection> = rayCaster.intersectObjects( this.level.getScene().children );

        //filter intersects:
        intersects = this.cameraIntersectsFilter.check(intersects);

        //ignore player model:
        for(let i = 0; i < intersects.length; ){
            if( intersects[i].object.userData.uniqueName == this.level.player.modelName ){
                intersects.splice(i, 1);
            }
            else{
                i++;
            }
        }

        //relative offset - distance between the player model and the camera:
        let cameraOffset:THREE.Vector3;
        if(intersects.length > 0){
            //object intersected, camera needs to be closer to the target:
            let distance: number = intersects[0].distance - 1;
            cameraOffset = new THREE.Vector3(0,0,-distance);

        }
        else{
            cameraOffset = new THREE.Vector3(0,0,-this.distance);
        }


        //change rotation of camera vector:
        cameraOffset = changeDirection(cameraOffset, angleX, angleY);
        
        //move camera up:
        cameraOffset.y += this.yOffset;

        //set camera position and rotation relative to the player model:
        let modelPos = this.targetModel.posVector;
        cameraOffset.x += modelPos.x;
        cameraOffset.y += modelPos.y;
        cameraOffset.z += modelPos.z;
        
        this.camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);

        this.camera.lookAt(cameraTarget);

    }
}
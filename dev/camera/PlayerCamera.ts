class PlayerCamera extends Camera{
    private targetModel: Player;
    private viewRotateX: number;
    private viewRotateY: number;
    private renderElement: HTMLElement;
    private pointerLocked: boolean;
    private yOffset: number;
    private distance: number;

    constructor(level: Level, model: Player){
        super(level);
        this.targetModel = model;

        //y offset of the camera
        this.yOffset = 10;
        //distance between the player and the camera:
        this.distance = 15;        

        this.viewRotateX = 0;
        this.viewRotateY = 0;
        this.pointerLocked = false;

        this.renderElement = this.level.game.renderer.element;

        //add mouse event listeners:
        window.addEventListener("mousemove", this.mouseHandler);

        this.renderElement.requestPointerLock = this.renderElement.requestPointerLock;
            
        document.exitPointerLock = document.exitPointerLock;

        this.renderElement.addEventListener("click", this.lockPointer );
        document.addEventListener('pointerlockchange', this.pointerLockChange, false);

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
        let rayCaster: THREE.Raycaster = new THREE.Raycaster(this.camera.position, direction, this.distance, maxDistance);
        //get intersected objects:
        let intersects: THREE.Intersection[] = rayCaster.intersectObjects( this.level.getScene().children );

        //filter intersects array:
        let i:number = 0;
        while(i < intersects.length){
            if( this.level.noCollisionModels.indexOf(intersects[i].object.name) != -1 ){
                intersects.splice(i, 1);
            }
            else{
                i++;
            }
        }

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
    
    private lockPointer = ():void => {
        this.renderElement.requestPointerLock();
        this.pointerLocked = true;
    }
    private unlockPointer = ():void => {
        document.exitPointerLock();
        this.pointerLocked = false;
    }

    private pointerLockChange = ():void => {
        if(document.pointerLockElement !== this.renderElement){
            this.unlockPointer();
        }
    }

    public get pointerIsLocked():boolean{
        return this.pointerLocked;
    }

    private mouseHandler = (e: MouseEvent) => {
        if(this.pointerLocked){

            let sens:number = 0.004;

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

    public update(){

        //relative offset - distance between the player model and the camera:
        let cameraOffset:THREE.Vector3 = new THREE.Vector3(0,0,-this.distance);

        //rotate the camera on two axis:
        let axisX: THREE.Vector3 = new THREE.Vector3(1,0,0);
        let angleX:number = this.viewRotateX;

        let axisY: THREE.Vector3 = new THREE.Vector3(0,1,0);
        let angleY:number = this.viewRotateY;
        //apply rotation:
        cameraOffset.applyAxisAngle(axisX, angleX);
        cameraOffset.applyAxisAngle(axisY, angleY);
        //move camera up:
        cameraOffset.y += this.yOffset;

        

        //set camera position and rotation relative to the player model:
        //cameraOffset.applyMatrix4( this.targetModel.getWorldMatrix() );
        let modelPos = this.targetModel.posVector;
        cameraOffset.x += modelPos.x;
        cameraOffset.y += modelPos.y;
        cameraOffset.z += modelPos.z;

        //set the target vector of the camera:
        let cameraTarget:THREE.Vector3 = this.targetModel.posVector;
        cameraTarget.y += this.yOffset;
        

        this.camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);

        this.camera.lookAt(cameraTarget);

    }
}
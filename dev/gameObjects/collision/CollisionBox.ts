class CollisionBox{
    
    private model: MobileModel;

    private boxSize:THREE.Vector3;
    private boxOffset:THREE.Vector3;
    private extraDistance: number;

    private sideZ:THREE.PlaneGeometry;
    private sideX:THREE.PlaneGeometry;
    private sideY:THREE.PlaneGeometry;

    private sides:Array<CollisionSide>;
    private rotationEnabled: boolean;

    private box:THREE.LineSegments;

    constructor(model:MobileModel, sizeX:number=0, sizeY:number=0, sizeZ:number=0, offsetX:number=0, offsetY:number=0, offsetZ:number=0, extraDistance:number=1, gravity:boolean=false, rotationEnabled:boolean=false, givenSegments:THREE.Vector3=new THREE.Vector3()){
        this.model = model;
        this.rotationEnabled = rotationEnabled;

        //for development:
        let collisionVisible:boolean = false;

        //how far the raycaster rays should check beyond the collision box:
        this.extraDistance = extraDistance;

        this.sideZ = new THREE.PlaneGeometry(0,0);
        this.sideX = new THREE.PlaneGeometry(0,0);
        this.sideY = new THREE.PlaneGeometry(0,0);
        this.sides = new Array<CollisionSide>();

        this.boxSize = new THREE.Vector3(sizeX, sizeY, sizeZ);
        this.boxOffset = new THREE.Vector3(offsetX, offsetY, offsetZ);

        this.box = new THREE.LineSegments();

        if(model.collisionEnabled && sizeX > 0 && sizeY > 0 && sizeZ > 0){

            //calculate segments:
            let segments: THREE.Vector3 = new THREE.Vector3();
            function setSegment(seg: number):number{
                seg = Math.floor(seg);
                if(seg < 1){
                    return 1;
                }
                else{
                    return seg
                }
            }
            if(givenSegments.x == 0){
                segments.x = setSegment(this.boxSize.x);
            }
            else{
                segments.x = setSegment(givenSegments.x);
            }
            
            if(givenSegments.y == 0){
                segments.y = setSegment(this.boxSize.y);
            }
            else{
                segments.y = setSegment(givenSegments.y);
            }

            if(givenSegments.z == 0){
                segments.z = setSegment(this.boxSize.z);
            }
            else{
                segments.z = setSegment(givenSegments.z);
            }

            //make box visible:
            //create box geometry:
            let boxGeometry: THREE.BoxGeometry = new THREE.BoxGeometry( this.boxSize.x, this.boxSize.y, this.boxSize.z, segments.x, segments.y, segments.z);
            //set offset:
            boxGeometry.translate(this.boxOffset.x, this.boxOffset.y, this.boxOffset.z);
            let boxEdges: THREE.EdgesGeometry = new THREE.EdgesGeometry( boxGeometry, 0 );
            let boxLine: THREE.LineSegments = new THREE.LineSegments( boxEdges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
            this.box = boxLine;
            //add lines to model to see size of collision box:

            if(collisionVisible){ 
                model.getMesh().add(this.box);
            }

            //create geometry:
            let sideGeomtries: Array<SideGeometry> = [
                {side:"z", geometry: new THREE.PlaneGeometry(this.boxSize.x, this.boxSize.y, segments.x, segments.y), color: 0xff0000}, //side facing front and back
                {side:"x", geometry: new THREE.PlaneGeometry(this.boxSize.z, this.boxSize.y, segments.z, segments.y), color: 0x0000ff}, //side facing left and right
                {side:"y", geometry: new THREE.PlaneGeometry(this.boxSize.x, this.boxSize.z, segments.x, segments.z), color: 0x00ff00}  //side facing up and down
            ];

            if(segments.x <= 1 && segments.z <= 1 && gravity){
                sideGeomtries[0].geometry.vertices.push( new THREE.Vector3() );
            }

            for(let sideGeo of sideGeomtries){
                //ignore lowest vertices:
                if(gravity){
                    if(sideGeo.side == "x" || sideGeo.side == "z"){
                        for(let vertex of sideGeo.geometry.vertices){
                            //raising lowest vertices:
                            if(vertex.y == -this.boxSize.y/2){
                                //vertex.y += (this.boxSize.y / segments.y)/2;
                                if(this.boxSize.y >= 1){
                                    vertex.y += 1;
                                }
                            }

                            //bringing outer vertices inward slightly:
                            if(vertex.x == this.boxSize.x/2){
                                vertex.x -= (this.boxSize.x / segments.x)/10;
                            }
                            if(vertex.x == -this.boxSize.x/2){
                                vertex.x += (this.boxSize.x / segments.x)/10;
                            }
                        }
                    }
                    if(sideGeo.side == "y"){
                        //sideGeo.geometry.scale(0.5, 0.5, 1);
                        for(let vertex of sideGeo.geometry.vertices){
                            if(vertex.y == this.boxSize.z/2){
                                vertex.y -= (this.boxSize.z / segments.z)/3;
                            }
                            if(vertex.y == -this.boxSize.z/2){
                                vertex.y += (this.boxSize.z / segments.z)/3;
                            }
                            if(vertex.x == this.boxSize.x/2){
                                vertex.x -= (this.boxSize.x / segments.x)/3;
                            }
                            if(vertex.x == -this.boxSize.x/2){
                                vertex.x += (this.boxSize.x / segments.x)/3;
                            }
                        }
                    }
                }
                //set rotation:
                if(sideGeo.side == "x"){
                    sideGeo.geometry.rotateY(Math.PI/2);
                }
                else if(sideGeo.side == "y"){
                    sideGeo.geometry.rotateX(Math.PI/2);
                }
                //set offset:
                sideGeo.geometry.translate(this.boxOffset.x, this.boxOffset.y, this.boxOffset.z);

                if(collisionVisible){
                    //make side visible:
                    let edges: THREE.EdgesGeometry = new THREE.EdgesGeometry( sideGeo.geometry, 0 );
                    let line: THREE.LineSegments = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: sideGeo.color } ) );
                    //add to mesh:
                    this.box.add(line);
                }

                if(sideGeo.side == "x"){
                    this.sideX = sideGeo.geometry;
                }
                else if(sideGeo.side == "y"){
                    this.sideY = sideGeo.geometry;
                }
                else if(sideGeo.side == "z"){
                    this.sideZ = sideGeo.geometry;
                }
                
            }

            //put sides in array:
            this.sides.push( new CollisionSide("front", this.sideZ, this.boxSize.x, new THREE.Vector3(0,0,1) ) );
            this.sides.push( new CollisionSide("back", this.sideZ, this.boxSize.x, new THREE.Vector3(0,0,-1)) );

            this.sides.push( new CollisionSide("right", this.sideX, this.boxSize.z, new THREE.Vector3(-1,0,0)) );
            this.sides.push( new CollisionSide("left", this.sideX, this.boxSize.z, new THREE.Vector3(1,0,0)) );

            this.sides.push( new CollisionSide("top", this.sideY, this.boxSize.y, new THREE.Vector3(0,1,0)) );
            this.sides.push( new CollisionSide("bottom", this.sideY, this.boxSize.y, new THREE.Vector3(0,-1,0)) );

        }
    }

    //get and set rotation:
    public get rX():number{ return this.box.rotation.x };
    public set rX(x: number){ this.box.rotation.x = x };

    public get rY():number{ return this.box.rotation.y };
    public set rY(y: number){ this.box.rotation.y = y };

    public get rZ():number{ return this.box.rotation.z };
    public set rZ(z: number){ this.box.rotation.z = z };

    //check for collision:
    //returns the distance until collision on one side of the collision box:
    private checkSide(sideName:string):RayData{
        //get side data from array:
        let rayData: RayData = new RayData(0, new THREE.Vector3(), new THREE.Object3D(), false, 0);
        for(let side of this.sides){
            if(side.side == sideName){
                //setup side variables:
                let direction: THREE.Vector3 = new THREE.Vector3().copy(side.direction);
                let geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(0,0).copy(side.geometry);
                let distance:number;
                distance = side.size/2 + this.extraDistance;

                //apply transformations to direction and geometry:
                if(this.rotationEnabled){
                    //direction.applyAxisAngle(new THREE.Vector3(0,1,0), this.model.rY);
                    direction.applyQuaternion(this.model.getMesh().quaternion);
                }
                //geometry.applyMatrix(this.model.getMesh().matrixWorld);
                geometry.translate( this.model.pX, this.model.pY, this.model.pZ );

                //objects names to skip when ray casting:
                let skipObjects: Array<string> = [];
                skipObjects.push(this.model.name);

                //variable for the hortest distance detected by raycasters:
                let shortestDistance: number = distance;
                let closestPoint: THREE.Vector3 = new THREE.Vector3();
                let closestModel: THREE.Object3D = new THREE.Object3D();
                let intersected: boolean = false;
                let faceIndex: number = 0;
                //check all vertices of geometry:
                for(let vertex of geometry.vertices){
                    //create raycaster and cast rays:
                    let raycaster = new THREE.Raycaster(vertex , direction, 0, distance );
                    //get array with objects intersected by raycaster:
                    let intersects = raycaster.intersectObjects( this.model.level.getScene().children);
                    //loop through intersected objects:
                    for(let intersect of intersects){
                        //check if object should be skipped:
                        if(skipObjects.indexOf(intersect.object.name) == -1 && this.model.level.noCollisionModels.indexOf(intersect.object.name) == -1 ){
                            //check if the distance to the object is shorter than the shortest measured distance:
                            if(intersect.distance < shortestDistance){
                                shortestDistance = intersect.distance;
                                closestPoint = intersect.point;
                                closestModel = intersect.object;
                                intersected = true;
                                faceIndex = intersect.faceIndex;
                            }
                        }
                    }
                }
                rayData = new RayData(shortestDistance - side.size/2, closestPoint, closestModel, intersected, faceIndex);
            }
        }
        return rayData;
    }

    public front():RayData{ return this.checkSide("front"); }
    public back():RayData{ return this.checkSide("back"); }

    public right():RayData{ return this.checkSide("right"); }
    public left():RayData{ return this.checkSide("left"); }

    public top():RayData{ return this.checkSide("top"); }
    public bottom():RayData{ return this.checkSide("bottom"); }
}
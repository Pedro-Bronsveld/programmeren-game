class RayData{
    distance: number;
    point: THREE.Vector3;
    model: THREE.Object3D;
    intersected: boolean;
    faceIndex: number;
    constructor(distance:number, point:THREE.Vector3, model:THREE.Object3D, intersected:boolean, faceIndex:number){
        this.distance = distance;
        this.point = point;
        this.model = model;
        this.intersected = intersected;
        this.faceIndex = faceIndex;
    }
}
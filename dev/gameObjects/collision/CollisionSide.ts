class CollisionSide{
    readonly side: string;
    readonly geometry: THREE.PlaneGeometry;
    readonly direction: THREE.Vector3;
    readonly size: number;
    constructor(side:string, geometry: THREE.PlaneGeometry, size: number, direction: THREE.Vector3){
        this.side = side;
        this.geometry = geometry;
        this.direction = direction;
        this.size = size;
    }
}
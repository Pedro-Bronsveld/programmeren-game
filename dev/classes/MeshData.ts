class MeshData{
    public name:string;
    private templateMesh: THREE.Mesh | THREE.SkinnedMesh;
    public geometry: THREE.Geometry;

    constructor(name:string, mesh:THREE.Mesh | THREE.SkinnedMesh, geometry: THREE.Geometry){
        this.name = name;
        this.templateMesh = mesh;
        this.geometry = geometry;
    }

    public get mesh():THREE.Mesh{
        return this.templateMesh.clone();
    }
}
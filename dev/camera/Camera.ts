class Camera{
    public camera: THREE.PerspectiveCamera;
    protected level: Level;
    //protected orbit: THREE.OrbitControls;
    constructor(level: Level){
        //create camera:
        this.level = level;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.09, 1000);
        //this.orbit = new THREE.OrbitControls(this.camera);

        window.addEventListener("resize", this.setSize);

    }

    public getRotation():THREE.Euler{
        return this.camera.rotation;
    }

    protected setSize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    public assignToRenderer(renderer: Renderer): void{
        renderer.camera = this.camera;
    }

    public update(){
        //this.orbit.update();
        //console.log(this.camera.position);
    }
}
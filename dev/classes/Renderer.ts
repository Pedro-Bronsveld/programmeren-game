class Renderer{
    private renderer: THREE.WebGLRenderer;
    private assignedCamera: THREE.PerspectiveCamera;
    private assignedScene: THREE.Scene;
    constructor(){
        this.assignedCamera = new THREE.PerspectiveCamera();
        this.assignedScene = new THREE.Scene();
        //create new three js renderer with anti aliasing
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.setSize();

        //enable shadows:
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        //add canvas to body:
        document.body.appendChild( this.renderer.domElement );

        //resize when window size changes:
        window.addEventListener("resize", this.setSize);

        this.renderer.domElement.id = "renderer";
    }

    public get element():HTMLElement{
        return this.renderer.domElement;
    }

    public set scene(scene: THREE.Scene){
        this.assignedScene = scene;
    }

    public set camera(camera: THREE.PerspectiveCamera){
        this.assignedCamera = camera;
    }

    private setSize = (): void => {
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    public update(): void{
        this.renderer.render(this.assignedScene, this.assignedCamera);
    }
}
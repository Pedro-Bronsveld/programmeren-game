class Renderer{
    private renderer: THREE.WebGLRenderer;
    private assignedCamera: THREE.PerspectiveCamera;
    private assignedScene: THREE.Scene;
    private pointerLocked: boolean;

    constructor(){
        this.assignedCamera = new THREE.PerspectiveCamera();
        this.assignedScene = new THREE.Scene();
        // create new three js renderer with anti aliasing
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.setSize();

        // enable shadows
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // add canvas to body
        document.getElementsByTagName("game")[0].appendChild( this.renderer.domElement );

        // resize when window size changes
        window.addEventListener("resize", this.setSize);

        // pointer lock
        this.pointerLocked = false;
        this.element.requestPointerLock = this.element.requestPointerLock;
        this.element.addEventListener("click", () => this.lockPointer() );
        document.addEventListener('pointerlockchange', this.pointerLockChange, false);

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
        
    public lockPointer = ():void => {
        this.element.requestPointerLock();
        this.pointerLocked = true;
    }
    public unlockPointer = ():void =>{
        document.exitPointerLock();
        this.pointerLocked = false;
    }

    private pointerLockChange = ():void => {
        if(document.pointerLockElement !== this.element){
            this.pointerLocked = false;
        }
        else{
            this.pointerLocked = true;
        }
    }

    public get pointerIsLocked():boolean{
        return this.pointerLocked;
    }

    public update(): void{
        this.renderer.render(this.assignedScene, this.assignedCamera);
    }
}
class EventHandler{

    public viewRotate: Function;
    public moveStart: Function;
    public moveStop: Function;
    public cameraResize: Function;
    public playerCameraReize: Function;
    public menuKeys: Function;
    public gunFireStart: Function;
    public gunFireStop: Function;

    constructor(){
        this.viewRotate = new Function();
        this.moveStart = new Function();
        this.moveStop = new Function();
        this.cameraResize = new Function();
        this.playerCameraReize = new Function();
        this.menuKeys = new Function;
        this.gunFireStart = new Function;
        this.gunFireStop = new Function;

        window.addEventListener("mousemove", (e: MouseEvent) => this.viewRotate(e) );
        window.addEventListener("keydown", (e: KeyboardEvent) => this.moveStart(e) );
        window.addEventListener("keyup", (e: KeyboardEvent) => this.moveStop(e) );
        window.addEventListener("resize", (e: Event) => {
            this.cameraResize(e);
            this.playerCameraReize(e);
        } );
        window.addEventListener("keypress", (e: KeyboardEvent) => this.menuKeys(e) );
        window.addEventListener("mousedown", (e:MouseEvent) => this.gunFireStart(e) );
        window.addEventListener("mouseup", (e:MouseEvent) => this.gunFireStop(e) );
    }
    
}
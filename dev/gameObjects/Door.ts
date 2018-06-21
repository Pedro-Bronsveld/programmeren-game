class Door extends Model{
    private doorLeft: Model;
    private doorRight: Model;

    private isOpen: boolean;

    private openOffset: THREE.Vector3;
    private closeOffset: THREE.Vector3;

    private openSpeed: number;
    private sound: ModelSound;
    private detect: boolean;

    constructor(level: Level, modelSource: ModelSource = new ModelSource(), detect:boolean=false){
        super(level, "door_frame", modelSource);
        this.detect = detect;

        this.isOpen = false;

        // load doors
        this.doorLeft = this.loadDoor();
        this.doorRight = this.loadDoor(-1);

        // setup open and closed offset vectors
        this.closeOffset = new THREE.Vector3(0,0,0);
        this.openOffset = new THREE.Vector3(7.8,0,0);
        this.openOffset.applyAxisAngle( new THREE.Vector3(1,0,0), this.rX );
        this.openOffset.applyAxisAngle( new THREE.Vector3(0,1,0), this.rY );
        this.openOffset.applyAxisAngle( new THREE.Vector3(0,0,1), this.rZ );

        // how fast the door should move in one second
        this.openSpeed = 20;

        // create sound object
        this.sound = new ModelSound(this.level.game, this, ["door"]);
        
    }

    public get open():boolean{
        return this.isOpen;
    }
    public set open(state:boolean){
        this.isOpen = state;
    }

    private loadDoor(side:number=1):Model{
        let door: Model = new Model(this.level, "door");
        // position door
        door.posVector = this.posVector;
        door.rotVector = this.rotVector;
        // set side
        door.sX = side;
        return door;
    }

    private detectPlayer():void{
        // if player is close enough, open the door
        let distance:number = this.posVector.distanceTo(this.level.player.posVector);
        this.open = distance < 20;
    }

    public update(delta:number){
        let wasOpen:boolean = this.open;
        
        if(this.detect){
            // atomatically open
            this.detectPlayer();
        }
        else{
            // check if all trigger targets in the level have been hit
            let targetsDown:number = 0;
            for(let target of this.level.triggerTargets){
                if(target.isDown){
                    targetsDown++;
                }
            }

            this.open = targetsDown >= this.level.triggerTargets.length;
        }

        if(wasOpen != this.open){
            this.sound.play("door", 1, true);
        }

        let newLeftPos: THREE.Vector3 = new THREE.Vector3().copy(this.posVector);
        let newRightPos: THREE.Vector3 = new THREE.Vector3().copy(this.posVector);
        if(this.open){
            // left door
            newLeftPos.add(this.openOffset);
            newRightPos.add( new THREE.Vector3().copy(this.openOffset).multiplyScalar(-1));
        }
        else{
            // left door
            newLeftPos.add(this.closeOffset);
            newRightPos.add( new THREE.Vector3().copy(this.closeOffset).multiplyScalar(-1));
        }

        this.doorLeft.posVector = this.tween.vector(this.doorLeft.posVector, newLeftPos, this.openSpeed * delta);
        this.doorRight.posVector = this.tween.vector(this.doorRight.posVector, newRightPos, this.openSpeed * delta);

    }
}
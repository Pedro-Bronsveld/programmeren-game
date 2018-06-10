/// <reference path="../node_modules/@types/three/index.d.ts" />

class Game{

    private propLevel: Level;
    private propRenderer: Renderer;
    private propClock: THREE.Clock;
    private propHud: Hud;
    private propElement: HTMLElement;

    private levelsData: Array<LevelSrcData>;
    private meshesData: Array<MeshData>;

    constructor(levelsData: Array<LevelSrcData>, meshesData: Array<MeshData>){
        this.levelsData = levelsData;
        this.meshesData = meshesData;
        this.propElement = <HTMLElement>document.getElementsByTagName("game")[0];

        //renderer
        this.propRenderer = new Renderer();

        //level
        this.propLevel = new Level(this, "level_1");
        this.propLevel.assignToRenderer(this.propRenderer);

        //clock:
        this.propClock = new THREE.Clock();

        //hud:
        this.propHud = new Hud(this);

        //start gameloop
        this.gameloop();
    }

    //getters:
    public get level():Level{ return this.propLevel };
    public get renderer():Renderer{ return this.propRenderer };
    public get clock():THREE.Clock{ return this.propClock };
    public get element():HTMLElement{ return this.propElement };
    public get hud():Hud{ return this.propHud };

    public getRenderer():Renderer{return this.propRenderer;}

    //get level data by level name:
    public levelDataByName(name: string):LevelSrcData{
        for(let levelData of this.levelsData){
            if(levelData.name == name){
                return levelData;
            }
        }
        return this.levelsData[0];
    }

    //get mesh data by name:
    public meshDataByName(name: string):MeshData{
        for(let meshData of this.meshesData){
            if(meshData.name == name){
                return meshData;
            }
        }
        return this.meshesData[0];
    }

    gameloop = () =>{
        
        //time in seconds passed between frames:
        let delta = this.propClock.getDelta();


        this.level.update(delta);
        
        this.renderer.update();

        this.hud.update();

        requestAnimationFrame( () => this.gameloop() );
    }


}

//start game on load:
//window.addEventListener("load", () => game = new Game() );
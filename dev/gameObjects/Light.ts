class Light extends GameObject{
    private propLight: THREE.DirectionalLight | THREE.HemisphereLight | THREE.SpotLight | THREE.PointLight;
    private lightSource: LightSource;

    constructor(level: Level, model: string, lightSource: LightSource = new LightSource()){
        super(level, model, "Light");
        this.lightSource = lightSource;

        let showShadowHelper:boolean = false;

        //convert rgb to hex color:
        let color : number = parseInt( "0x" + utils.toHEX(lightSource.data.color) );
        if(lightSource.data.type == "SUN"){
            //lamp is sun
            this.propLight = new THREE.DirectionalLight(color, lightSource.data.energy);
            if(lightSource.data.cast_shadow){
                this.propLight.shadow.camera = new THREE.OrthographicCamera( -100, 100, 100, -100, 0.5, 200 );
                this.propLight.target = this.level.player.getMesh();
                if(showShadowHelper){
                    let camHelper : THREE.CameraHelper = new THREE.CameraHelper(this.light.shadow.camera);
                    camHelper.name = "ShadowHelper";
                    this.level.getScene().add(camHelper);
                }
            }
            
            
        }
        else if(lightSource.data.type == "HEMI"){
            //lamp is hemi
            let horizon_color : number = parseInt( "0x" + utils.toHEX(this.propLevel.skyColor) );
            this.propLight = new THREE.HemisphereLight( horizon_color, color, lightSource.data.energy );
        }
        else if(lightSource.data.type == "SPOT"){
            //lamp is spot
            this.propLight = new THREE.SpotLight( color, lightSource.data.energy, lightSource.data.distance, lightSource.data.spot_size, lightSource.data.spot_blend, lightSource.data.decay );
        }
        else{
            //lamp is point
            this.propLight = new THREE.PointLight(color, lightSource.data.energy, lightSource.data.distance, lightSource.data.decay);   
            
        }
        //wether to cast a shadow from this light:
        this.propLight.castShadow = lightSource.data.cast_shadow;
        if(this.propLight.castShadow){
            //set shadow resolution:
            this.propLight.shadow.mapSize.width = 1000;
            this.propLight.shadow.mapSize.height = 1000;
        }
        this.propLight.position.set(lightSource.location.x, lightSource.location.y, lightSource.location.z);        
        
        this.propLevel.addLight(this);
    }

    public get light(): THREE.DirectionalLight | THREE.HemisphereLight | THREE.SpotLight | THREE.PointLight{
        return this.propLight;
    }

    //position:
    public get pX():number{ return this.light.position.x };
    public get pY():number{ return this.light.position.y };
    public get pZ():number{ return this.light.position.z };

    public set pX(x: number){ this.light.position.x = x };
    public set pY(y: number){ this.light.position.y = y };
    public set pZ(z: number){ this.light.position.z = z };

    public get posVector():THREE.Vector3{
        return new THREE.Vector3(this.pX, this.pY, this.pZ);
    }
    public set posVector(vector3:THREE.Vector3){
        this.pX = vector3.x;
        this.pY = vector3.y;
        this.pZ = vector3.z;
    }

    //update in gameloop:
    update():void{
        if(this.modelName == "Sun"){
            this.propLight.position.set(
                this.lightSource.location.x + this.level.player.pX, 
                this.lightSource.location.y + this.level.player.pY, 
                this.lightSource.location.z + this.level.player.pZ);  
        }
    }
}
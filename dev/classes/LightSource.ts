class LightSource implements ObjectSource{
    public name: string;
    public model: string;
    public type: string;
    public location: LocRot;
    public rotation: LocRot;
    public scale: Scale;
    public data: {
        spot_blend: number;
        decay: number;
        type: string;
        distance: number;
        cast_shadow: boolean;
        color: RgbColor;
        energy: number;
        spot_size: number;
    };
    constructor(){
        this.name = "new_light";
        this.model = "point";
        this.type = "LAMP";
        this.location = new LocRot();
        this.rotation = new LocRot();
        this.scale = new Scale();
        this.data = {
            spot_blend: 0,
            decay: 2,
            type: "POINT",
            distance: 25,
            cast_shadow: true,
            color: {
              r: 255,
              g: 255,
              b: 255
            },
            energy: 1,
            spot_size: 0
        }
    }
}
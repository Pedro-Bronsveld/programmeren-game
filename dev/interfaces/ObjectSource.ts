interface ObjectSource{
    name: string;
    model: string;
    type: string;
    location: LocRot;
    rotation: LocRot;
    scale: Scale;
    data: {
        spot_blend: number;
        decay: number;
        type: string;
        distance: number;
        cast_shadow: boolean;
        color: RgbColor;
        energy: number;
        spot_size: number;
    };
}
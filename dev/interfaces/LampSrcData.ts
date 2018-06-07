interface LampSrcData extends ObjectSource{
    data:{
        type: string;
        color:{
            r: number;
            g: number;
            b: number;
        },
        energy: number;
        distance: number;
        decay: number;
        spot_size: number;
        spot_blend: number;
        cast_shadow: boolean;
    }
}
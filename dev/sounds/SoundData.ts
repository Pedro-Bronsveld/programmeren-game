class SoundData{
    readonly name:string;
    readonly buffer:THREE.AudioBuffer;

    constructor(name:string, buffer:THREE.AudioBuffer){
        this.name = name;
        this.buffer = buffer;
    }
}
class ModelSound{
    private sounds: Array<THREE.PositionalAudio>;
    private audioListener:THREE.AudioListener;
    readonly soundNames: Array<string>;
    constructor(game:Game, model:Model, soundNames:Array<string>=[]){
        this.soundNames = soundNames;

        // create array for audio objects
        this.sounds = new Array<THREE.PositionalAudio>();
        // link to audio listener
        this.audioListener = game.sound.listener;

        // create audio objects
        for(let soundName of soundNames){
            let buffer:THREE.AudioBuffer = game.soundDataByName(soundName).buffer;
            let sound:THREE.PositionalAudio = new THREE.PositionalAudio(this.audioListener);
            sound.name = soundName;
            sound.setBuffer(buffer);
            sound.setVolume(0.5);
            this.sounds.push(sound);
            // add audio to mesh
            model.getMesh().add(sound);
        }
        
    }

    public play(name:string, volume:number=1,restart:boolean=false):void{
        for(let sound of this.sounds){
            if(sound.name == name){
                if(restart && sound.isPlaying){
                    sound.stop();
                }
                if(!sound.isPlaying){
                    sound.setVolume(volume);
                    sound.play();
                }
                return;
            }
        }
    }

    public pause(name:string, stop:boolean=false):void{
        for(let sound of this.sounds){
            if(sound.name == name){
                if(stop && sound.isPlaying){
                    sound.stop();
                }
                else if(sound.isPlaying){
                    sound.pause();
                }
                return;
            }
        }
    }

}
class GlobalSound{
    private sounds:Array<THREE.Audio>;
    private audioListener:THREE.AudioListener;
    constructor(game:Game){
        // sounds to be loaded globally
        let soundNames:Array<string> = ["menu_button_hover", "menu_button_click"];

        // create global audio listener
        this.audioListener = new THREE.AudioListener();

        // create array for audio objects
        this.sounds = new Array<THREE.Audio>();

        // create audio objects
        for(let soundName of soundNames){
            let buffer:THREE.AudioBuffer = game.soundDataByName(soundName).buffer;
            let sound:THREE.Audio = new THREE.Audio(this.listener);
            sound.name = soundName;
            sound.setBuffer(buffer);
            sound.setVolume(0.5);
            this.sounds.push(sound);
        }
    }

    public get listener():THREE.AudioListener{
        return this.audioListener;
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
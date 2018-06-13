class EventManager{
    private events: Array<EventData>;
    constructor(){
        this.events = new Array<EventData>();
    }

    public add(object: HTMLElement|Document|Window, event: string, func: EventListenerOrEventListenerObject, permanent: boolean=true):void{
        this.events.push({
            object: object,
            event: event,
            func: func,
            permanent: permanent
        });
    }

    public clear = ():void => {
        // remove all events that are not permanent
        for(let event of this.events){
            if(!event.permanent){
                event.object.removeEventListener(event.event, event.func);
            }
        }
    }
}
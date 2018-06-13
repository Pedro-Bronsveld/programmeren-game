interface EventData{
    object: HTMLElement|Document|Window;
    event: string;
    func: EventListenerOrEventListenerObject;
    permanent: boolean;
}
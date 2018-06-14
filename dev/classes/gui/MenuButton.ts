class MenuButton{
    private el: HTMLElement;
    readonly name: string;
    private isVisible: boolean;
    readonly states: Array<string>;

    constructor(name: string, func: Function, states:Array<string> ,visible:boolean=false){
        this.el = document.createElement("menubutton");
        this.el.addEventListener("click", () => func() );
        this.name = name;
        this.el.innerHTML = name;
        this.isVisible = visible;
        this.states = states;

        // update element visibility
        this.visible = visible;
    }

    public get element():HTMLElement{ return this.el };

    public get visible():boolean{
        return this.isVisible;
    }
    public set visible(visible: boolean){
        this.isVisible = visible;
        // set visibility of element
        this.element.dataset.visible = String(visible);
    }
}
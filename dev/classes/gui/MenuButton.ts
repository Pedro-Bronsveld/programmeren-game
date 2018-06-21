class MenuButton{
    private el: HTMLElement;
    private menu:Menu;
    readonly name: string;
    private isVisible: boolean;
    readonly states: Array<string>;

    constructor(menu:Menu, name: string, func: Function, states:Array<string> ,visible:boolean=false){
        this.el = document.createElement("menubutton");
        this.el.addEventListener("click", () => func() );
        this.menu = menu;
        this.name = name;
        this.el.innerHTML = name;
        this.isVisible = visible;
        this.states = states;

        // have button make a sound when mouse hovers over it and clicks
        this.element.addEventListener("mouseenter", () => this.menu.game.sound.play("menu_button_hover", 0.5, true) );
        this.element.addEventListener("click", () => this.menu.game.sound.play("menu_button_click", 1, true) );

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
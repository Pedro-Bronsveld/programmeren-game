class LoadingScreen{
    private el:HTMLElement;
    private loadingContainer:HTMLElement;
    private header: HTMLElement;
    private loadingBar:HTMLElement;
    constructor(){
        this.el = document.createElement("loadingscreen");
        document.body.appendChild(this.el);

        // create header:
        this.header = document.createElement("h1");
        this.header.innerHTML = "Loading...";
        this.el.appendChild(this.header);

        // create container for loading bar
        this.loadingContainer = document.createElement("loadingcontainer");
        this.el.appendChild(this.loadingContainer);

        // create loading bar
        this.loadingBar = document.createElement("loadingbar");
        this.loadingContainer.appendChild(this.loadingBar);
    }

    public update(loadedItems:number, totalItems:number):void{
        let scaleX:number = loadedItems/totalItems;
        //let translateX:number = -(1 - scaleX)*100/2;
        //this.loadingBar.style.transform = `translateX(${translateX}%) scaleX(${scaleX})`;
        this.loadingBar.style.width = (scaleX * 100) + "%";
    }
}
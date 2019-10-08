import GuiItem from "../../GuiItem.js";

class InstaPlayButton extends GuiItem {
    constructor() {
        super();
        this.html = document.createElement("div");
        this.html.className = "InstaPlayButton LibraryItem";

        
        const titleContainer = document.createElement("div");
        titleContainer.className = "title";
        this.textContent = new Text("TEST TEXT");

        titleContainer.append(this.textContent);

        this.iconDiv = document.createElement("div");
        this.iconDiv.className = "icon";
        this.iconDiv.style.backgroundImage = `url('./images/buttons/play.svg');`;
        this.iconDiv.innerHTML = "&nbsp;"

        this.html.append(this.iconDiv, titleContainer);

        this.listen(this.html, "click", () => { this.emit("play"); });
    }
    get text() {
        return this.textContent.data;
    }
    set text(value) {
        this.textContent.data = value;
    }

    /** @type {boolean} **/
    get visible() {
        return this.html.style.display != "none";
    }
    set visible(value) {
        this.html.style.display = !!value ? "" : "none";
    }
}

export default InstaPlayButton;
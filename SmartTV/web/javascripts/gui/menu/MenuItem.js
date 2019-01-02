import EventEmitter from "../../lib/event-emitter.js";
//import ListMenu from "./ListMenu.js";
/**
 * @typedef {import("./ListMenu").default} ListMenu
 * */
class MenuItem extends EventEmitter {
    constructor(title, iconUrl, callback) {
        super();
        if (typeof callback == "function") {
            this.onclick = callback;
        }
        this.mainElement = document.createElement("li");
        this.mainElement.className = "MenuItem";
        this.text = document.createTextNode(title);
        this.mainElement.appendChild(this.text);

        this.closeMenuOnClick = true;

        if (iconUrl) {
            this.mainElement.style.backgroundImage = "url('" + iconUrl + "')";
        }
        this.mainElement.addEventListener("click", this.clickListener = (e) => {
            this.emit("click");
            if (this.onclick) {
                this.onclick(e);
            }
        });
    }
    hasSubMenu() {
        return false;
    }
    /**
     * @returns {ListMenu}
     * */
    createSubMenu() {
        return null;
    }
    get main() {
        return this.mainElement;
    }

    destroy() {
        if (this.mainElement) {
            if(this.mainElement.parentNode)
                this.mainElement.parentNode.removeChild(this.mainElement);
            this.mainElement.removeEventListener("click", this.clickListener);
            this.mainElement = null;
        }
    }

}

export default MenuItem;
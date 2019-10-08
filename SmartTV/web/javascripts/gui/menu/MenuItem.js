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
            this.active = true;
        });
        /** @type {boolean} **/
        this._active = false;
    }
    hasSubMenu() {
        return false;
    }

    set active(value) {
        /** @type {boolean} **/
        value = !!value;
        if (value != this._active) {
            this._active = value;
            this.mainElement.classList.toggle("active", value);
            // item was activated
            if (value) {
                this.emit("click");
                if (this.onclick) {
                    this.onclick();
                }
            }
        }
    }
    /** @type {boolean} **/
    get active() {
        return this._active;
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
    get title() {
        return this.text.data;
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
import EventEmitter from "../../lib/event-emitter.js";
import MenuItem from "./MenuItem.js";
import MenuItemScreen from "./MenuItemScreen.js";
/**
 * @typedef {import("./MainMenu").default} MainMenu
 * */

class ListMenu extends EventEmitter {
    /**
     * 
     * @param {MainMenu} menu
     */
    constructor(menu) {
        super();
        this.menu = menu;
        this.mainElement = document.createElement("ul");
        this.mainElement.className = "ListMenu";
        /** @type {MenuItem[]} **/
        this._items = [];
    }
    get main() {
        this.render();
        return this.mainElement;
    }
    /**
     * 
     * @param {MenuItem} item
     */
    addItem(item) {
        this._items.push(item);
        this.render();
        item.on("click", (e) => {
            if(item.closeMenuOnClick)
                this.menu.closeMenu();
            if (item instanceof MenuItemScreen) {
                this.showScreen(item);
            }
        });
    }
    showScreen(menuItem) {
        for (const item of this._items) {
            if (item instanceof MenuItemScreen) {
                item.screen.visible = (item.screen == menuItem.screen);
            }
        }
    }

    render() {
        for (const item of this._items) {
            this.mainElement.appendChild(item.main);
        }
    }
    destroy() {
        for (const item of this._items) {
            item.destroy();
        }
        this.mainElement.innerHTML = "";
        this._items.length = 0;
        this.mainElement = null;
    }
}

export default ListMenu;
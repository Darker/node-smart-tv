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

        this._changedByUserAction = false;
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
            for (const otherItem of this.itemsExcept(item)) {
                otherItem.active = false;
            }
            this.emit("change", item);
        });
    }

    showScreen(menuItem) {
        for (const item of this._items) {
            item.active = item == menuItem;
        }
    }

    get activeItem() {
        for (const item of this._items) {
            if (item.active) {
                return item;
            }
        }
        return null;
    }
    set activeItem(value) {
        this.showScreen(value);
    }
    /**
     * 
     * @param {...MenuItem} unwantedItems
     */
    *itemsExcept(...unwantedItems) {
        for (const item of this._items) {
            if (unwantedItems.indexOf(item) == -1) {
                yield item;
            }
        }
    }
    /**
     * 
     * @param {string} name title of the item that should be shown
     */
    showScreenByName(name) {
        const screen = this._items.find((x) => x.title == name);
        if (screen) {
            console.log("Showing screen by name: ", name, screen);
            this.showScreen(screen);
        }
        else {
            console.log("Cannot show ", name, "- not found in", this._items.map((x) => x.title));
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
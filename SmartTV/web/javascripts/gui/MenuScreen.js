import EventEmitter from "../lib/event-emitter.js";

/**
 * @typedef {import("./menu/MenuItemScreen.js").default} MenuItemScreen
 * */
/**
 * This class represents a main screen (visible content)
 * that can be toggled by menu item
 * */
class MenuScreen extends EventEmitter {
    constructor() {
        super();
        /** @type {MenuItemScreen[]} list of items that manage this screen. Screen is visible as long as one of the items is active**/
        this.menuItems = [];
    }
    /** @type {HTMLElement} the main element. You mut override this to provide elm that can be hidden or shown **/
    get main() {
        throw new Error("Pure virtual method call!");
    }

    get visible() {
        return this.main.classList.contains("visible");
    }
    set visible(value) {
        this.main.classList.toggle("visible",!!value);
    }

    updateVisibility() {
        this.visible = this.oneOfMenuItemsActive();
    }

    oneOfMenuItemsActive() {
        for (const item of this.menuItems) {
            if (item.active) {
                return true;
            }
        }
        return false;
    }
}

export default MenuScreen;
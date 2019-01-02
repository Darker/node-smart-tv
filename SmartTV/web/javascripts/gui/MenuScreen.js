import EventEmitter from "../lib/event-emitter.js";
/**
 * This class represents a main screen (visible content)
 * that can be toggled by menu item
 * */
class MenuScreen extends EventEmitter {
    constructor() {
        super();

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
}

export default MenuScreen;
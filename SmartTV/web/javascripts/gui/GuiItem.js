import EventEmitter from "../lib/event-emitter.js";
import ListenerManager from "../util/ListenerManager.js";
class GuiItem extends EventEmitter {
    constructor() {
        super();
        this.listeners = new ListenerManager();
    }
    /**
     * 
     * @param {EventTarget|EventEmitter} target
     * @param {string} name
     * @param {function} listener
     * @param {...any} args any further arguments for addEventListener()
     */
    listen(target, name, listener, ...args) {
        this.listeners.listen(target, name, listener, ...args);
    }
    // removes any event listeners
    cleanup() {
        this.listeners.destroy();
    }
    // Cleans up and destroys HTML
    destroy() {
        this.cleanup();
    }
}

export default GuiItem;
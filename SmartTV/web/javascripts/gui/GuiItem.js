import EventEmitter from "../lib/event-emitter.js";
import ListenerManager from "../util/ListenerManager.js";
class GuiItem extends EventEmitter {
    constructor() {
        super();
        this.listeners = new ListenerManager();
    }
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
import RemovableListener from "./RemovableListener.js";
/**
 * @typedef {import("../lib/event-emitter.js").EventEmitterListenerFunc} EventEmitter
 * */

class ListenerManager {
    constructor() {
        /** @type {RemovableListener[]} **/
        this.listeners = [];
    }

    static isEventEmitter(object) {
        return object.on && object.once && object.removeListener;
    }
    static isEventTarget() {
        return object.addEventListener && object.removeEventListener;
    }
    /**
     * 
     * @param {EventTarget|EventEmitter} target
     * @param {string} name
     * @param {function} listener
     * @param {...any} args any further arguments for addEventListener()
     */
    listen(target, name, listener, ...args) {
        if (target) {
            let failed = false;
            if (RemovableListener.isEventTarget(target)) {
                target.addEventListener(name, listener, ...args);
            }
            else if (RemovableListener.isEventEmitter(target)) {
                target.on(name, listener, ...args);
            }
            else {
                failed = true;
                console.warn("Cannot attach a " + name + " listener to given object, object type unknown.", target);
            }
            if (!failed) {
                this.listeners.push(new RemovableListener(target, name, listener));
            }
        }
        else {
            console.warn("Cannot attach a " + name + " listener to a node, given node was null.");
        }
    }

    destroy() {
        for (const listener of this.listeners) {
            listener.remove();
        }
        this.listeners.length = 0;
    }
}

export default ListenerManager;
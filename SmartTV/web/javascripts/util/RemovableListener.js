/**
 * I mean yeah, all listeners are removeble, but the mechanism is kinda clumsy
 * */
class RemovableListener {
    /**
     * 
     * @param {EventTarget} eventTarget
     * @param {string} name
     * @param {function} listener
     */
    constructor(eventTarget, name, listener) {
        this.target = eventTarget;
        this.name = name;
        this.listener = listener;
    }

    static isEventEmitter(object) {
        return object.on && object.once && object.off;
    }
    static isEventTarget(object) {
        return object.addEventListener && object.removeEventListener;
    }

    get targetIsEventEmitter() {
        return RemovableListener.isEventEmitter(this.target);
    }

    get targetIsEventTarget() {
        return RemovableListener.isEventTarget(this.target);
    }

    remove() {
        if (this.targetIsEventEmitter) {
            this.target.off(this.name, this.listener);
        }
        else if (this.targetIsEventTarget) {
            this.target.removeEventListener(this.name, this.listener);
        }
        
        // help with freeing captured scope
        this.listener = null;
    }
}

export default RemovableListener;
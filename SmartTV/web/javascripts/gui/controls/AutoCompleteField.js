import EventEmitter from "../../lib/event-emitter.js";
import EventThrottler from "../../util/EventThrottler.js";

class AutoCompleteField extends EventEmitter {
    constructor() {
        super();
        this.element = document.createElement("input");
        this.throttler = new EventThrottler(this);

        this._cbEventChange = () => {
            this.emit("change", this.value);
        };
        this.html.addEventListener("input", this._cbEventChange);
    }

    get value() {
        return this.element.value;
    }
    get html() {
        return this.element;
    }

    cleanup() {
        this.element.removeEventListener("input", this._cbEventChange);
    }
    destroy() {
        this.cleanup();
        if(this.element.parentNode)
            this.element.parentNode.removeChild(this.element);

    }
}

export default AutoCompleteField;
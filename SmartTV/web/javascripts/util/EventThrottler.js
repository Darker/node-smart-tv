// mareda-util event throttler
class PlannedEmit {
    /**
     * 
     * @param {string} name Event name
     * @param {EventThrottler} parent
     */
    constructor(name, parent) {
        this.timeout = -1;
        this.started = new Date().getTime();
        this.lastReset = -1;
        /** @type {EventThrottler} **/
        this.parent = parent;

        this.name = name;
    }
    /**
     * 
     * @param {any[]} args
     */
    reset(args) {
        this.args = args;
        this.lastReset = new Date().getTime();
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => { this.parent.finishEmit(this); }, this.evtDelay);
    }
    get evtDelay() {
        const rTime = this.remainingLifetime;
        if (rTime > this.timeoutSettings.dispatchTimeout) {
            return this.timeoutSettings.dispatchTimeout;
        }
        else {
            return rTime;
        }
    }
    get age() {
        return new Date().getTime() - this.started;
    }
    get remainingLifetime() {
        return Math.max(this.timeoutSettings.maxWaitDuration - this.age, 0);
    }
    destroy() {
        clearTimeout(this.timeout);
        delete this.parent;
    }

    get timeoutSettings() {
        return this.parent.getTimeoutSettings(this.name);
    }
}

/**
 * @typedef {Object} TimeoutSettings - settings of timeout for individual events
 * @property {number} dispatchTimeout
 * @property {number} maxWaitDuration
 */


class EventThrottler {
    /**
     * 
     * @param {EventEmitter|EventTarget|function} target
     */
    constructor(target) {
        /** @type {{[evtName:string]:PlannedEmit}} **/
        this.emitDb = {

        };
        /** @type {{[evtName:string]:TimeoutSettings}} **/
        this.delayConfigs = {};
        this.target = target;
        /** @type {TimeoutSettings} **/
        this.delayDefaults = { dispatchTimeout: 200, maxWaitDuration: 1000 };
    }
    throttledEmit(name, ...args) {
        if (!this.emitDb[name]) {
            this.emitDb[name] = new PlannedEmit(name, this);
        }
        this.emitDb[name].reset(args);
    }
    /**
     * 
     * @param {string} name event name
     * @param {boolean} noDefault if true, returns null instead of default
     */
    getTimeoutSettings(name, noDefault = false) {
        if (typeof name != "string") {
            return this.delayDefaults;
        }

        return this.delayConfigs[name] || ( noDefault ? null : this.delayDefaults);
    }
    /**
     * 
     * @param {TimeoutSettings} value
     * @param {string} name
     */
    setTimeoutSettings(value, name) {
        let settings = this.getTimeoutSettings(name, true);

        if (!settings) {
            settings = this.delayConfigs[name] = {};
            for (const [key, value] of Object.entries(this.delayDefaults)) {
                settings[key] = value;
            }
        }

        for (const [key, value] of Object.entries(value)) {
            settings[key] = value;
        }
    }
    /**
     * 
     * @param {PlannedEmit} plannedEmit
     */
    finishEmit(plannedEmit) {
        delete this.emitDb[plannedEmit.name];
        plannedEmit.destroy();
        this._dispatchEvent(plannedEmit.name, plannedEmit.args);
    }
    destroy() {
        for (const [key, value] of Object.entries(this.emitDb)) {
            value.destroy();
        }
        delete this.target;
    }
    /**
     * 
     * @param {string} name
     * @param {any[]} args
     */
    _dispatchEvent(name, args) {
        if (this.target.addEventListener && this.target.dispatchEvent) {
            const evt = new CustomEvent(name, { detail: args });
            this.target.dispatchEvent(evt);
        }
        else if (this.target.on && this.target.emit) {
            this.target.emit(name, ...args);
        }
        else if (typeof this.target == "function") {
            this.target(name, ...args);
        }
    }
}

export default EventThrottler;
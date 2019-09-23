const DeferredPromise = require("./DeferredPromise");


module.exports = class PromiseCriticalSection {
    constructor() {
        this._deferred = new DeferredPromise();
        this.locked = false;
    }
    async lock() {
        while (this.locked) {
            await this._deferred._promise;
        }
        this.locked = true;
        this._deferred = new DeferredPromise();
    }
    unlock() {
        this.locked = false;
        this._deferred.resolve(true);
    }
}
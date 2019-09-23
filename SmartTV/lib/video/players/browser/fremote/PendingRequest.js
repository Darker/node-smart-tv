const DeferredPromise = require("../../../../util/DeferredPromise");


class PendingRequest extends DeferredPromise {
    /**
     * 
     * @param {RDMessageRequest} data
     */
    constructor(data) {
        super();
        this.data = data;
        // set to true once the request is sent and is waiting for response
        this.isActive = false;
    }
    get to() {
        return this.data.to;
    }
    /**
     * 
     * @param {PendingRequest} other
     */
    hasSameTarget(other) {
        return other instanceof PendingRequest && this.to == other.to;
    }
}
module.exports = PendingRequest;
const EventEmitter = require('events');
const PendingRequest = require("./PendingRequest");
const PendingNotification = require("./PendingNotification");
const spliced = require("../../../../util/collections/spliced");
/**
 * @typedef {import("net").Socket} Socket
 * */
/** List of events that arrive on their own, without being requested */
const UNSOLICITED_EVENTS = [
    'tabNavigated', 'styleApplied', 'propertyChange', 'networkEventUpdate', 'networkEvent',
    'propertyChange', 'newMutations', 'appOpen', 'appClose', 'appInstall', 'appUninstall',
    'frameUpdate', 'tabListChanged', 'forwardingCancelled', 'tabDetached'
];

const LENGTH_DELIMITER = ":";
class FSocket {
    /**
     * 
     * @param {Socket} socket
     */
    constructor(socket) {
        this.socket = socket;
        this.buffer = "";
        /** @type {PendingRequest[]} **/
        this.pendingRequests = [];
        /** Pending unsolicited event requests **/
        /** @type {PendingNotification[]} **/
        this.pendingNotifications = [];

        socket.on("data", (data) => {
            const datastr = data + "";
            this.buffer += data;
            this.checkBufferStatus();
        });
    }
    get bufferRequiredLength() {
        const index = this.delimiterIndex;
        if (index >= 0) {
            const length = parseInt(this.buffer.substring(0, index));
            if (!Number.isNaN(length)) {
                return length;
            }
        }
        return Infinity;
    }
    get delimiterIndex() {
        const index = this.buffer.indexOf(LENGTH_DELIMITER);
        return index;
    }
    checkBufferStatus() {
        while (true) {
            const remainingLength = this.buffer.length - 1 - this.delimiterIndex;
            const requiredLength = this.bufferRequiredLength;
            //console.log("[FSocket]", remainingLength, " bytes of ", requiredLength);
            if (remainingLength >= requiredLength) {
                /** @type {string} **/
                const message = this.buffer.substr(this.delimiterIndex + 1, requiredLength);
                if (!message.startsWith(`{"type":"frameUpdate"`)) {
                    console.log("[FSocket] Extracted message: ", message);
                }
                
                this.buffer = this.buffer.substr(this.delimiterIndex + 1 + requiredLength);
                /** @type {RDMessageResponse} **/
                let messageJSON = null;
                try {
                    messageJSON = JSON.parse(message);
                }
                catch (e) {
                    this.emit("message-error", e.message);
                }
                // check if there's a pending request for that message
                const pendingRequest = this.pendingRequests.findIndex((r) => { return r.isActive && r.to == messageJSON.from; });
                if (!FSocket.isUnsolicitedEvent(messageJSON)) {
                    if (pendingRequest != -1) {
                        const req = this.pendingRequests[pendingRequest];
                        this.pendingRequests.splice(pendingRequest, 1);
                        console.log("[FSocket] Resolve: ", req);
                        req.resolve(messageJSON);
                    }
                    else {
                        console.log("[FSocket] Pending:", this.pendingRequests, "\n");
                        throw new Error("[FSocket] Unexpected response!" + message);
                        process.exit(1);
                    }
                }
                else {
                    this.emit(messageJSON.type, messageJSON);
                    // if someone is waiting for the event, unlock the promise
                    const waitingObjects = [...spliced(this.pendingNotifications, (x) => x.checkEvent(messageJSON))];
                    for (const notif of waitingObjects) {
                        notif.resolve(messageJSON);
                    }
                }
            }
            else {
                break;
            }
        }
    }
    static isUnsolicitedEvent(event) {
        if (event) {
            if (UNSOLICITED_EVENTS.includes(event.type)) {
                return true;
            }
            else if (event.applicationType && event.traits && event.from == "root") {
                return true;
            }
        }
        return false;
    }
    send(message) {
        const stringified = JSON.stringify(message);
        const write = stringified.length + LENGTH_DELIMITER + stringified;
        this.socket.write(write);
        console.log("[FSocket] Sent: ", write);

    }
    async sendAndAwaitResponse(message) {
        const pendingRequest = new PendingRequest(message);
        // await for any request of same type before this one
        const otherReq = this.pendingRequests.find((x) => x.hasSameTarget(pendingRequest));
        // add this request to queue, following requests will have to wait for it
        this.pendingRequests.push(pendingRequest);
        if (otherReq) {
            console.log("[FSocket] Waiting for previous request.");
            await otherReq._promise;
        }
        pendingRequest.isActive = true;
        // now we can send the message and await response
        this.send(pendingRequest.data);
        return await pendingRequest._promise;
    }
    /**
     * Unlocks on the first notification that matches the description.
     * @param {PendingNotification} pendingReq
     */
    async notificationPromise(pendingReq) {
        this.pendingNotifications.push(pendingReq);
        return await pendingReq._promise;
    }
    on() {
        this.socket.on.apply(this.socket, arguments);
    }

    emit() {
        this.socket.emit.apply(this.socket, arguments);
    }


}
module.exports = FSocket;
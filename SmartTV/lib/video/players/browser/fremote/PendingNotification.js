const DeferredPromise = require("../../../../util/DeferredPromise");

class PendingNotification extends DeferredPromise {
    /**
     * 
     * @param {string|false} name name of the notification, or false to ignore name
     * @param {function} validator optional message validator
     */
    constructor(name, validator = ()=>true) {
        super();
        this.name = name;
        this.validator = validator;
    }
    static NavigationEnd(tabActorName) {
        return new PendingNotification("tabNavigated", (x) => { return x.state == "stop" && x.from == tabActorName });
    }
    /**
     * 
     * @param {RDMessageResponse} evt
     */
    checkEvent(evt) {
        return (evt.type == this.name || this.name === false) && this.validator(evt);
    }
}
PendingNotification.INTRODUCTION_REQUEST = new PendingNotification(false, (msg) => { return !!msg.applicationType && !!msg.traits && msg.from == "root"; });

module.exports = PendingNotification;
const EventEmitter = require("events");
/**
 * @typedef {import("./Video.js")} Video
 * */
class VideoSubscription extends EventEmitter {
    /**
     * 
     * @param {function(Video):boolean} filter
     */
    constructor(filter, id) {
        super();
        this.creation = new Date().getTime();
        this.filter = filter;
    }
    /**
     * @description The age of subscription is used to determine whether the subscription is outdated
     * @type {number}
     * */
    get age() {
        return new Date().getTime() - this.creation;
    }
    /***
     * @description Resets age to 0, use this when client has renewed their subscription.
     * */
    updateAge() {
        this.creation = new Date().getTime();
    }
    /**
     * 
     * @param {Video} video
     */
    videoFound(video, library) {
        if (typeof this.filter == "function") {
            if (this.filter(video)) {
                this.emit("video", { video, library });
            }
        }
        else {
            this.emit("video", { video, library });
        }
    }
    destroy() {
        this.removeAllListeners();
    }
}
module.exports = VideoSubscription;
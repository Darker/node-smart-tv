/**
 * This class represents a library of videos
 * 
 * */
const EventEmitter = require("events");
const findMax = require("../util/collections/findMax");
const removableIterator = require("../util/collections/removableIterator");
/**
 * @typedef {import("./Video")} Video
 * @typedef {import("./VideoSubscription")} VideoSubscription
 * */

class VideosResult {
    constructor() {
        /** @type {Video[]} **/
        this.videos = [];
        /**
         * @description If true, no more videos may ever be loaded.
         * */
        this.end = true;
    }
}

const VIDEOS_END = new VideosResult();


class MediaLibrary extends EventEmitter {
    /**
     * 
     * @param {string} libraryIdentifier
     */
    constructor(libraryIdentifier) {
        super();
        /** @type {Video[]} **/
        this.videos = [];
        /** @type {VideoSubscription[]} **/
        this.subscriptions = [];

        this.uniqueId = libraryIdentifier;

        this._label = null;
        this.iconURL = null;

        this.maxSubscriptionsAge = 60 * 1000;
    }
    toSimpleStruct() {
        return {
            uniqueID: this.uniqueId,
            label: this.label,
            features: this.features
        };
    }
    get label() {
        return this._label || this.uniqueId;
    }
    set label(value) {
        this._label = value;
    }
    /**
     * If true, this library allows text based search and will provide 
     * search results.
     * */
    get canSearch() {
        return false;
    }
    /**
     * If true, this library can provide temporary video for a string
     * entry that may be played with some of the players.
     * 
     * */
    get canPlayString() {
        return false;
    }
    get features() {
        return {
            playString: this.canPlayString,
            search: this.canSearch
        };
    }
    /**
     * @description Shorhand for getting VideoResult that marks the end of videos.
     * */
    get videosEnd() {
        return VIDEOS_END;
    }
    /**
     * Search for videos in a given resource. This search function should
     * never find same video twice.
     * 
     * @param {number} maxDuration if set, limits the duration of a search
     * @returns {Promise<VideosResult>}
     */
    async searchForVideos(maxDuration = Infinity, maxCount = Infinity) {
        return VIDEOS_END;
    }
    /**
     * Subscribing for videos may cause this library to fetch more videos if possible.
     * 
     * Subscriptions that were not removed in due time will be deleted.
     * 
     * @param {VideoSubscription} subscription
     */
    subscribeToVideos(subscription) {
        this.subscriptions.push(subscription);
    }
    /**
     * @returns {VideoSubscription}
     * */
    newestSubscription() {
        return findMax.findMax(this.subscriptions, (vs) => { return -vs.age; });
    }
    /**
     * Returns the time until the last subscription is invalid
     * @returns {number}
     * */
    untilSubscriptionsExpire() {
        const newest = this.newestSubscription();
        return newest ? this.maxSubscriptionsAge - newest.age : 0;
    }
    removeOldSubscriptions() {
        for (const riter of removableIterator(this.subscriptions)) {
            if (riter.entry.age >= this.maxSubscriptionsAge) {
                riter.remove();
            }
        }
    }
    backgroundSearchLoop() {
        if (!this._bgLoopRunning) {
            this._bgLoopAllowed = true;
            this._bgLoopRunning = this._backgroundSearch;
        }

        return this._bgLoopRunning;
    }
    async _backgroundSearch() {
        while (this._bgLoopAllowed) {
            this.removeOldSubscriptions();
            if (this.subscriptions.length > 0) {
                const results = await this.searchForVideos(this.untilSubscriptionsExpire(), Infinity);
                if (results.end) {
                    await new Promise((resolve) => setTimeout(resolve, 30000));
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
    /**
     * 
     * @param {Video} video
     */
    containsVideo(video) {
        for (let vid of this.videos) {
            if (video.equals(vid)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Adds video IFF the video is not in this 
     * library yet
     * @param {Video} video
     * @returns {boolean} true if video was added
     */
    addUnique(video) {
        if (!this.containsVideo(video)) {
            this.videos.push(video);
            return true;
        }
        return false;
    }
    /**
     * Finds a video by it's FULL video ID (libraryId.videoId)
     * @param {string} id
     * @returns {Video}
     */
    findVideo(id) {
        for (const vid of this.videos) {
            if (vid.uniqueID == id) {
                return vid;
            }
        }
        return null;
    }
}
module.exports = MediaLibrary;
module.exports.VideosResult = VideosResult;
/**
 * This class represents a library of videos
 * 
 * */
const EventEmitter = require("events");
/**
 * @typedef {import("./Video")} Video
 * */

class MediaLibrary extends EventEmitter {
    /**
     * 
     * @param {string} libraryIdentifier
     */
    constructor(libraryIdentifier) {
        super();
        /** @type {Video[]} **/
        this.videos = [];

        this.uniqueId = libraryIdentifier;

        this._label = null;
        this.iconURL = null;
    }
    toSimpleStruct() {
        return {
            uniqueID: this.uniqueId,
            label: this.label
        };
    }
    get label() {
        return this._label || this.uniqueId;
    }
    set label(value) {
        this._label = value;
    }
    /**
     * Search for videos in a given resource. This search function should
     * never find same video twice.
     * 
     * @param {number} maxDuration if set, limits the duration of a search
     * @returns {Promise<Video[]>}
     */
    async searchForVideos(maxDuration=Infinity) {
        return [];
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
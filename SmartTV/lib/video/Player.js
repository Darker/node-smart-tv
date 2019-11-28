const EventEmitter = require("events");
const UnsupportedMediaError = require("./exceptions/UnsupportedMediaError");
/**
 * @typedef {import("./Video")} Video
 * */
/**
 * @typedef {import("../../web/javascripts/typedefs/EventTypes")} EventTypes
 * */

/**
 * @event "timeupdate"
 * 
 * */
class Player extends EventEmitter {
    constructor() {
        super();
        this.autoplay = true;

        this._duration = NaN;
        this._currentTime = 0;

    }
    /**
     * 
     * @param {Video} video
     */
    canPlay(video) {
        return false;
    }
    /**
     * Loads media, returns when done. Should throw exception on failure
     * @param {Video} video
     * @returns {void}
     * */
    async openMedia(video) {
        throw new UnsupportedMediaError("Dummy player cannot open any media.");
    }
    /**
     * Returns loaded video if it's loaded or null
     * @returns {Video|null}
     * */
    getLoadedMedia() {
        return null;
    }
    /**
     * Starts playing current media. Shold never throw.
     * Return false on failure.
     * */
    async play() { return false;}
    async pause() { return false; }
    async togglePlay() { return false; }
    /**
     * This MUST succeed without an exception.
     * If it can't, just kill the entire Node process
     * */
    async stop() { }

    async isPlaying() { return false; }
    /**
     * Returns true if media is loaded.
     * 
     * After succesful @see {#stop} call, 
     * this should return false.
     * */
    async isMediaOpen() { return false; }
    /**
     * Sets volume of the player.
     * @param {number} number value between 0 and 1, percentage of volume
     * @returns {Promise<number>} final volume value, also between 0 and 1
     */
    async setVolume(number) { return NaN; }

    /**
     * Retrieves and returns current time.
     * Returns current audio time in seconds.
     * @returns {Promise<number>}
     * */
    async getCurrentTime() {
        return this._currentTime;
    }
    /**
     * Retrieves duration of the current media
     * value may be cached
     * @returns {Promise<number>}
     * */
    async getDuration() {
        return NaN;
    }
    
    /**
     * Seek at a time in seconds. Fraction of seconds may be supported
     * but is not required.
     * @param {number} seconds
     * @returns {Promise<boolean>} true on success, false on failure
     */
    async seek(seconds) { return false; }

    /**
     * Returns information about the player
     * @returns {PlayerInfoEvent}
     */
    async getInfo() {
        const duration = await this.getDuration();
        const loadedMedia = this.getLoadedMedia();
        return {
            progress: await this.getCurrentTime(),
            preloaded: duration,
            duration: duration,
            isPlaying: await this.isPlaying(),
            loadedMedia: loadedMedia?loadedMedia.toSimpleStruct():null
        };
    }

    /**
     * Seek using seek definition
     * @param {SeekEvent} seekObject
     * @returns {Promise<boolean>} true on success, false on failure
     */
    async smartSeek(seekObject) {
        if (seekObject.type == "percentage") {
            const length = await this.getDuration();
            return await this.seek((seekObject.quantity / 100) * length);
        }
        else if (seekObject.type == "time") {
            return await this.seek(seekObject.quantity);
        }
        else if (seekObject.type == "offset_time") {
            return await this.relativeSeek(seekObject.quantity);
        }

        return false;
    }

    /**
     * Seeks by an offset from current time.
     * @param {number} dtseconds
     * @returns {Promise<boolean>} true on success, false on failure
     */
    async relativeSeek(dtseconds) {
        const targetTime = dtseconds + (await this.getCurrentTime());
        if (!isNaN(targetTime)) {
            return await this.seek(targetTime);
        }
        else {
            return false;
        }
    }

    /** @type {number} approximate current time in seconds **/
    get currentTime() {
        return this._currentTime;
    }
}
module.exports = Player;
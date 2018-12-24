const EventEmitter = require("events");
const UnsupportedMediaError = require("./exceptions/UnsupportedMediaError");
/**
 * @typedef {import("./Video")} Video
 * */
class Player extends EventEmitter {
    constructor() {
        super();
        this.autoplay = true;
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
     * Sets volume of the player.
     * @param {any} number value between 0 and 1, percentage of volume
     * @returns {number} final volume value, also between 0 and 1
     */
    async setVolume(number) { return NaN; }

    /**
     * Returns current audio time in seconds.
     * */
    async getCurrentTime() {
        return NaN;
    }
    /**
     * Seek at a time in seconds. Fraction of seconds may be supported
     * but is not required.
     * @param {any} seconds
     */
    async seek(seconds) { return false; }

    async relativeSeek(dtseconds) {
        const targetTime = dtseconds + (await this.getCurrentTime());
        if (!isNaN(targetTime)) {
            return await this.seek(targetTime);
        }
        else {
            return false;
        }
    }
}
module.exports = Player;
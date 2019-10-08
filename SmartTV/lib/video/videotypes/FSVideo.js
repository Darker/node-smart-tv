const Video = require("../Video");
const path = require("path");
const fs = require("mz/fs");

class FSVideo extends Video {
    /**
     * 
     * @param {string} fspath
     * @param {string} libraryID
     * 
     */
    constructor(fspath, libraryID) {
        super(libraryID);
        this.fspath = path.resolve(fspath);
    }
    get uniqueVideoID() {
        return this.fspath;
    }

    get uri() {
        return this.fspath;
    }
    get title() {
        return path.basename(this.fspath);
    }
    get videoType() {
        return Video.Type.MOVIE;
    }
    async exists() {
        return (await fs.exists(this.fspath))
            && (await fs.stat(this.fspath)).isFile()
    }
}
module.exports = FSVideo;
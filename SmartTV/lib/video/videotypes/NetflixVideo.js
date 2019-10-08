const Video = require("../Video");
/**
 * @typedef {import("../libraries/LibNetflix").JustWatchEntry} JustWatchEntry
 * */

class NetflixVideo extends Video {
    /**
     * 
     * @param {JustWatchEntry} entry
     * @param {string} libraryID
     * 
     */
    constructor(entry, libraryID) {
        super(libraryID);
        this.entry = entry;
    }
    get uniqueVideoID() {
        return this.entry.jw_entity_id;
    }
    get description() {
        return this.entry.short_description;
    }
    get uri() {
        return this.fspath;
    }
    get title() {
        return this.entry.title;
    }
    get videoType() {
        if (this.entry.object_type == "show") {
            return NetflixVideo.Type.SERIES;
        }
        else {
            return Video.Type.MOVIE;
        }
    }
}
module.exports = NetflixVideo;
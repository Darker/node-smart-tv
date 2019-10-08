class Video {
    constructor(libraryId) {
        this.lastTime = 0;
        this.libraryId = libraryId;
    }
    /** @type {string} **/
    get uri() {
        return "";
    }
    get description() {
        return "";
    }
    get title() {
        return "";
    }

    get uniqueVideoID() {
        throw new Error("Pure virtual method call!");
    }
    get uniqueID() {
        return this.libraryId + "." + this.uniqueVideoID;
    }
    get videoType() {
        return Video.Type.INVALID;
    }
    /**
     * Returns true if any of the strings that this video contains (except subtitles)
     * matches the regex. This is ideal for a naive search for a title.
     * 
     * @param {RegExp} regexSearch
     */
    matches(regexSearch) {
        return false;
    }

    toSimpleStruct() {
        return {
            library: this.libraryId,
            uniqueID: this.uniqueID,
            title: this.title,
            description: this.description,
            uri: this.uri,
            type: this.videoType.name
        };
    }

    /**
     * 
     * @param {Video} otherVideo
     * @returns {boolean}
     */
    equals(otherVideo) {
        return otherVideo.uniqueID == this.uniqueID;
    }
}
/**
 * @enum
 * */
Video.Type = {
    INVALID: {},
    MOVIE: {},
    EPISODE: {},
    SERIES: {}
}
for (let enumName in Video.Type) {
    if (Video.Type.hasOwnProperty(enumName)) {
        Video.Type[enumName].name = enumName;
    }
}


module.exports = Video;
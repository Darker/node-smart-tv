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
        return regexSearch.exec(this.title) != null || regexSearch.exec(this.description) != null;
    }
    /**
     * 
     * @param {string} searchString
     */
    matchRelevance(searchString) {
        let relevance = 0;
        const preparedString = prepareSearchString(searchString);
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
 * 
 * @param {string} str
 */
function prepareSearchString(str) {
    return str.replace(/[^a-z0-9]/g, " ").replace(/ +/g, " ").split(" ");
}
/**
 * 
 * @param {string[]} query
 * @param {string} target
 */
function evaluateStringRelevance(query, target) {
    target = prepareSearchString(target);
    let relevance = 0;
    const maxIndex = target.length;
    for (const seachEntry of query) {
        const index = target.indexOf(searchEntry);
        if (index >= 0) {
            relevance += 1 - index / maxIndex;
        }
    }
    return relevance/query.length;
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
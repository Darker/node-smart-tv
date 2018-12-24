const fs = require("mz/fs");
const path = require("path");

/**
 * @callback EntryPredicate
 * @param {PathStackEntry} entry
 * @returns {Promise<boolean>}
 */


class PathStack {
    constructor(paths) {
        /** @type {PathStackEntry[]} **/
        this.paths = [];
        /** @type {EntryPredicate} **/
        this.predicateSkip = async (entry) => { return true; };
        /** @type {EntryPredicate} **/
        this.predicateRecord = async (entry) => { return /\.(avi|mp4|mkv)$/i.test(entry.path); }

        if (paths && paths.length>0) {
            this.addPathList(paths, 0);
        }
    } 
    next() {
        return this.paths.shift();
    }
    /** @type {number} number of paths that were still unsearched **/
    get length() {
        return this.paths.length;
    }
    /**
     * 
     * @param {PathStackEntry} pathEntry
     */
    async addSubPaths(pathEntry) {
        if (await this.predicateSkip(pathEntry)) {
            this.addPathList(await pathEntry.getSubPaths(), pathEntry.depth);
        }
    }
    /**
     * 
     * @param {string[]} paths
     */
    addPathList(paths, depth=0) {
        for (const strPath of paths) {
            this.paths.push(new PathStackEntry(strPath, this.predicateRecord, depth));
        }
    }
}
class PathStackEntry {
    /**
     * 
     * @param {string} pathToFile
     * @param {EntryPredicate} isVideoPredicate
     * @param {number} depth recursion depth during crawling
     */
    constructor(pathToFile, isVideoPredicate, depth) {
        this.path = pathToFile;
        this.depth = depth;
        this.getSubPaths();
        this.predicateRecord = isVideoPredicate;
    }

    async exists() {
        if (!this._exists) {
            this._exists = fs.exists(this.path);
        }
        return this._exists;
    }

    /**
     * @returns {boolean}
     * */
    async isDirectory() {
        if (!this._isDirectory) {
            this._isDirectory = (async () => {
                if (await this.exists()) {
                    return (await fs.stat(this.path)).isDirectory();
                }
                return false;
            })();
        }
        return await this._isDirectory;
    }
    /**
     * Returns sub paths or empty array.
     * @return {Promise<string[]>}
     * */
    async getSubPaths() {
        if (!this._getSubPaths) {
            this._getSubPaths = (async () => {
                if (await this.isDirectory()) {
                    const subpaths = await fs.readdir(this.path);
                    for (let i = 0, l = subpaths.length; i < l; ++i) {
                        subpaths[i] = path.join(this.path, subpaths[i]);
                    }
                    return subpaths;
                }
                return [];
            })();
        }
        return await this._getSubPaths;
    }
    async isVideo() {
        if (!this._isVideo) {
            this._isVideo = (async () => {
                if (await this.exists()) {
                    return await this.predicateRecord(this);
                }
                return false;
            })();
        }
        return (await this._isVideo);
    }
}
module.exports = PathStack;
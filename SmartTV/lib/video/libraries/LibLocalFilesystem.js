const MediaLibrary = require("../MediaLibrary");
const fs = require("mz/fs");
const path = require("path");
const PathStack = require("./PathStack");
const FSVideo = require("../videotypes/FSVideo");

/**
 * @typedef {import("../Video")} Video
 * */

class LibLocalFilesystem extends MediaLibrary {
    /**
     * 
     * @param {string[]} paths
     */
    constructor(paths) {
        super("filesystem");
        /** @type {string[]} **/
        this.paths = [];
        if (paths != null && typeof paths[Symbol.iterator] === 'function') {
            for (const fpath of paths) {
                this.paths.push(path.resolve(fpath));
            }
        }
        /** @type {PathStack} old path stack from previous search**/
        this._oldPathStack = null;
    }

    /**
     * Search for videos in a given resource. This search function should
     * never find same video twice.
     * 
     * @param {number} maxDuration if set, limits the duration of a search
     * @returns {Promise<Video[]>}
     */
    async searchForVideos(maxDuration = Infinity) {
        const stack = this._oldPathStack || new PathStack();
        if (!this._oldPathStack) {
            stack.addPathList(this.paths);
        }
        const start = new Date().getTime();

        this._oldPathStack = stack;
        /** @type {Video[]} **/
        const result = [];

        while (stack.length > 0) {
            const currentPath = stack.next();
            console.log("Scanning path: ", currentPath.path);
            if (await currentPath.isVideo()) {
                const vid = new FSVideo(currentPath.path, this.uniqueId);
                if (this.addUnique(vid)) {
                    result.push(vid);
                }
            }
            // adds all sub paths (if any)
            await stack.addSubPaths(currentPath);

            if ((new Date().getTime() - start) > maxDuration) {
                break;
            }
        }

        return result;
    }
}
module.exports = LibLocalFilesystem;
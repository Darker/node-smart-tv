const MediaLibrary = require("../MediaLibrary");
const fs = require("mz/fs");
const path = require("path");
const PathStack = require("./PathStack");
const FSVideo = require("../videotypes/FSVideo");
const drivelist = require("drivelist");
// Generated from JSON output: https://regex101.com/r/Muzlob/1

/**
 * Structure containing drivelist info
 * @typedef {Object} MountPoint
 * @property {string} path path to the root directory
 * @property {string} label
 * */

/**
 * Structure containing drivelist info
 * @typedef {Object} DriveInfo
 * @property {'IDE'} enumerator
 * @property {'SATA'} busType
 * @property {'2.0'} busVersion
 * @property {'\\\\.\\PhysicalDrive0'} device
 * @property {null} devicePath
 * @property {'\\\\.\\PhysicalDrive0'} raw
 * @property {'Samsung SSD 860 EVO 1TB'} description
 * @property {null} error
 * @property {number} size
 * @property {number} blockSize
 * @property {number} logicalBlockSize
 * @property {MountPoint[]} mountpoints
 * @property {boolean} isReadOnly
 * @property {boolean} isSystem
 * @property {boolean} isVirtual
 * @property {boolean} isRemovable
 * @property {boolean} isCard
 * @property {boolean} isSCSI
 * @property {boolean} isUSB
 * @property {boolean} isUAS
 * */

/**
 * @returns {Promise<DriveInfo[]>}
 * 
 * */
function drivelistPromise() {
    return new Promise(function (resolve, reject) {
        drivelist.list((error, list) => {
            if (error)
                reject(error);
            else {
                resolve(list);
            }
        });
    });
}

/**
 * @typedef {import("../Video")} Video
 * */

class LibRemovableDrives extends MediaLibrary {
    /**
     * 
     * @param {string[]} paths
     */
    constructor(paths, name) {
        super(name||"filesystem_removable");
        /** @type {string[]} **/
        this.paths = [];
        if (paths != null && typeof paths[Symbol.iterator] === 'function') {
            for (const fpath of paths) {
                this.paths.push(path.resolve(fpath));
            }
        }
        /** @type {PathStack} old path stack from previous search**/
        this.pathStack = new PathStack();

        this.pathStack.predicateSkip = async (e) => {
            if (e.depth > 4) {
                return false;
            }
            const paths = await e.getSubPaths();
            if (paths.find((val) => { return /\.(exe|nvm|iso|ply)$/i.test(val); })) {
                return false;
            }
            return true;
        };
        /** @type {{[device:string]:DriveInfo}} **/
        this.drivesCache = null;
        this.drivesCache = {};
    }
    get canSearch() {
        return true;
    }
    /**
     * Search for videos in a given resource. This search function should
     * never find same video twice.
     * 
     * @param {number} maxDuration if set, limits the duration of a search
     * @returns {Promise<Video[]>}
     */
    async searchForVideos(maxDuration = Infinity) {
        

        const start = new Date().getTime();

        const drives = (await drivelistPromise()).filter((drive) => { return drive.isRemovable; });

        let changed = false;
        let removed = false;
        const newDriveNames = [];
        // add new drives
        for (const drive of drives) {
            newDriveNames.push(drive.device);
            if (this.drivesCache[drive.device]) {
                if (this.drivesCache[drive.device].description != drive.description) {
                    changed = true;
                    removed = true;
                    console.log("Drive removed/replaced: ", this.drivesCache[drive.device].description, " -> ", drive.description);
                    this.drivesCache[drive.device] = drive;
                }
            }
            else {
                this.drivesCache[drive.device] = drive;
                changed = true;
                console.log("Drive added: ", drive.description);
            }
        }
        const existingDrives = [];
        // remove drives no longer available
        for (let name in this.drivesCache) {
            if (this.drivesCache.hasOwnProperty(name)) {
                if (newDriveNames.indexOf(name) == -1) {
                    changed = true;
                    removed = true;
                    console.log("Drive removed: ", this.drivesCache[name].description);
                    delete this.drivesCache[name];
                }
                else {
                    const drive = this.drivesCache[name];
                    
                    if (!drive.scanning) {
                        if (drive.mountpoints.length >= 1) {
                            drive.scanning = true;
                            existingDrives.push(drive.mountpoints[0].path);
                        }
                    }
                }
            }
        }
        // filter files that are lost
        //if(removed)
        //    this.videos.length = 0;


        const stack = this.pathStack;
        stack.addPathList(existingDrives);
        this._oldPathStack = stack;
        /** @type {Video[]} **/
        const result = [];

        // filter all videos tha

        while (stack.length > 0) {
            const currentPath = stack.next();
            if (currentPath.path.endsWith("mkv")) {
                console.log("Should add: ", currentPath.path);
            }
            if (await currentPath.isVideo()) {
                const vid = new FSVideo(currentPath.path, this.uniqueId);
                if (this.addUnique(vid)) {
                    console.log("Add video: ", currentPath.path);
                    result.push(vid);
                }
            }
            // adds all sub paths (if any)
            await stack.addSubPaths(currentPath);

            if ((new Date().getTime() - start) > maxDuration) {
                break;
            }
        }

        return { videos: result, end: false };
    }
    createPathStack() {

    }
}
module.exports = LibRemovableDrives;
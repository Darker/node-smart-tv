/**
 * @typedef {Object} SeekEvent - request to seek for the player
 * @property {number} quantity
 * @property {"offset_time"|"time"|"percentage"} type type of seek, percentage is 0-100, the rest is in seconds
 */

/**
 * @typedef {import("../../../lib/video/Video")} Video
 * */

/**
 * @typedef {Object} VideoDataStruct - simplified object containing video info
 * @property {string} library
 * @property {string} uniqueID
 * @property {string} title
 * @property {string} description
 * @property {string} uri
 * @property {"INVALID"|"MOVIE"|"EPISODE"|"SERIES"} type
 */

/**
 * @typedef {Object} PlayerInfoEvent - request to seek for the player
 * @property {number} progress seconds of progress
 * @property {number} preloaded seconds of preloaded video
 * @property {number} duration
 * @property {boolean} isPlaying
 * @property {VideoDataStruct} loadedMedia currently loaded video info
 */
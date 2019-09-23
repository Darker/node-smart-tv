/**
 * @typedef {import("../FSocket.js")} FSocket
 * */

class Actor {
    /**
     * 
     * @param {FSocket} fsocket
     */
    constructor(fsocket) {
        this.fsocket = fsocket;

    }
}
module.exports = Actor;
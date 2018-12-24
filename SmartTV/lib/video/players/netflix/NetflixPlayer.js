const Player = require("./Player");
/**
 * @typedef {import("../../../net/RemoteClient")} RemoteClient
 * */
class NetflixPlayer extends Player {
    constructor() {
        super();
        /** @type {RemoteClient} **/
        this.client = null;
    }

    /**
     * 
     * @param {RemoteClient} client
     */
    setPlayerClient(client) {
        this.emit("player.set");
    }
}
module.exports = NetflixPlayer;
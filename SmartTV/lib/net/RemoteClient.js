/** @type {NodeRequire} **/
const requireES6 = require("../../es6import");
/**
 * @typedef {import("../../web/javascripts/net/Client").default} ClientClass
 * */
/** @type {new()=>ClientClass} **/
const Client = requireES6(require.resolve("../../web/javascripts/net/Client"));

/**
 * @typedef {import("../tv/SmartTV")} SmartTV
 * */

class RemoteClient extends Client {
    /**
     * 
     * @param {SocketIO.Socket} io
     * @param {SmartTV} tv
     */
    constructor(io, tv) {
        super(io);
        this.tv = tv;
        this.io.on('disconnect', () => {
            this.emit("destroyMe");
        });

        this.registerLocalRPC("playerToggle", () => {
            if (this.tv && this.tv.activePlayer) {
                return this.tv.activePlayer.togglePlay();
            }
        });
        this.registerLocalRPC("playerPlay", async (videoID) => {
            if (this.tv) {
                await this.tv.playVideoById(videoID);
                return "DONE!";
            }
        });
        this.registerLocalRPC("playerStop", async (videoID) => {
            if (this.tv && this.tv.activePlayer) {
                return this.tv.activePlayer.stop();
            }
        });

        this.registerRemoteRPC("libraryAdd");
        this.registerRemoteRPC("libraryMetadata");
        this.initInfo();

    }
    async initInfo() {
        await this.libraryMetadata(this.tv.libraries.map((lib) => { return lib.toSimpleStruct(); }));
        await this.libraryAdd([...this.tv.allVideoStructs()]);
        this.io.emit("player.playing", await this.tv.isPlaying());
        this.io.emit("player.medialoaded", await this.tv.activePlayerNoNull.isMediaOpen());
    }
    get session() {
        return this.io.handshake.session;
    }
    /**
     * RPC, will be overwritten
     * @param {[]} videos
     */
    async libraryAdd(videos) {

    }
    /**
     * @param {[]} metadata
     */
    async libraryMetadata(metadata) {

    }
}
module.exports = RemoteClient;
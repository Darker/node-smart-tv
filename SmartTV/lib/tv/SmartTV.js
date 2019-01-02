const EventEmitter = require("events");
const forwardEvents = require("../events/forwardEvents");
const Player = require("../video/Player");


/**
 * @typedef {import("../video/MediaLibrary")} MediaLibrary
 * */
/**
 * @typedef {import("../video/Video")} Video
 * */


function Timeout(t) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, t);
    });
}

class SmartTV extends EventEmitter {
    constructor() {
        super();
        /** @type {Player[]} **/
        this.players = [];
        /** @type {MediaLibrary[]} **/
        this.libraries = [];

        this.activePlayerIndex = -1;

        this._fakeActivePlayer = new Player();

    }
    /** @type {Player} player that is handling currently selected audio/video **/
    get activePlayer() {
        if (this.activePlayerIndex >= 0 && this.activePlayerIndex < this.players.length) {
            const player = this.players[this.activePlayerIndex];
            return player;
        }
        else {
            return null;
        }
    }

    get activePlayerNoNull() {
        const player = this.activePlayer;
        if (player != null) {
            return player;
        }
        else {
            return this._fakeActivePlayer;
        }
    }

    async isPlaying() {
        if (this.activePlayer) {
            return await this.activePlayer.isPlaying();
        }
        return false;
    }
    /**
     * @param {Player} player
     * */
    addPlayer(player) {
        this.players.push(player);
        forwardEvents(player, 
            {
                playing: "player.playing",
                medialoaded: "player.medialoaded",
                timeupdate: "player.timeupdate"
            }
            , this);
        
    }
    /**
     * Tries to find a video within the 
     * libraries.
     * @param {string} uniqueID
     */
    getVideo(uniqueID) {
        const libraryID = uniqueID.split(".", 1)[0];
        const lib = this.findLibrary(libraryID);
        if (lib) {
            return lib.findVideo(uniqueID);
        }
    }
    findLibrary(id) {
        for (const lib of this.libraries) {
            if (lib.uniqueId == id) {
                return lib;
            }
        }
        return null;
    }
    /**
     * @returns {IterableIterator<Video>}
     * */
    * allVideos() {
        for (const lib of this.libraries) {
            for (const vid of lib.videos) {
                yield vid;
            }
        }
    }
    /**
     * @returns {IterableIterator<Video>}
     * */
    * allVideoStructs() {
        for (const vid of this.allVideos()) {
            yield vid.toSimpleStruct();
        }
    }
    /**
     * Tries to find a player that can play this video
     * 
     * Returns true on success, false if no player found
     * 
     * 
     * @param {Video} video
     */
    async playVideo(video) {
        if (video == null) {
            return;
        }

        if (this.activePlayer) {
            await this.activePlayer.stop();
        }
        // find a player
        for (let i = 0, l = this.players.length; i < l; ++i) {
            const item = this.players[i];
            if (item.canPlay(video)) {
                this.activePlayerIndex = i;
                break;
            }
        }
        await this.activePlayer.openMedia(video);
        return await this.activePlayer.play();
    }
    /**
     * @see #playVideo
     * 
     * 
     * @param {string} uniqueID
     */
    async playVideoById(uniqueID) {
        return await this.playVideo(this.getVideo(uniqueID));
    }
    async startLoadingMedia(really=false) {
        if (really) {
            await Timeout(10);
            while (this.mediaLoaderPromise != null) {
                if (await this.isPlaying()) {
                    await Timeout(10000);
                    continue;
                }
                let sleep = 500;

                for (const lib of this.libraries) {
                    const videos = await lib.searchForVideos(1000);
                    if(videos.length > 0)
                        this.emit("media.new", videos);
                    await Timeout(sleep);
                }
            }
            this.mediaLoaderPromise = null;
            return null;
        }
        else if (!this.mediaLoaderPromise) {
            this.mediaLoaderPromise = this.startLoadingMedia(true);
        }
        return await this.mediaLoaderPromise;
    }
}
module.exports = SmartTV;
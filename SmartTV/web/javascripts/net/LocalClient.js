import Client from "./Client.js";

class LocalClient extends Client {
    /**
     * 
     * @param {SocketIO.Socket} io
     */
    constructor(io) {
        super(io);
        this.registerRemoteRPC("playerToggle");
        this.registerRemoteRPC("playerPlay");
        this.registerRemoteRPC("playerStop");
        this.registerRemoteRPC("playerPlayString");

        this.registerLocalRPC("libraryAdd", (videoInfos) => {
            console.log("Videos found: ", videoInfos);
            this.emit("library.add", videoInfos);
        });
        this.registerLocalRPC("libraryMetadata", (infos) => {
            console.log("Library metadata!", infos);
            this.emit("library.metadata", infos);
        });
    }
    /**
     * Toggle between playing and paused.
     * */
    async playerToggle() {}
    
    /**
     * Play a video from the video library
     * @param {string} videoId
     * */
    async playerPlay(videoId) {
        
    }
    /**
     * Plays video by string search query, if the library supports it
     * @param {{library: string, string: string}} data
     */
    async playerPlayString(data) {}
}
export default LocalClient;
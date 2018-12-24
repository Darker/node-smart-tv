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

        this.registerLocalRPC("libraryAdd", (videoInfos) => {
            console.log("Videos found: ", videoInfos);
            this.emit("library.add", videoInfos);
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
}
export default LocalClient;
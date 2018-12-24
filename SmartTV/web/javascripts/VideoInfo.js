class VideoInfo {
    /**
     * 
     * @param {VideoInfo} props
     */
    constructor(props) {
        if (props == null) {
            props = {};
        }

        this.uniqueID = props.uniqueID || "";
        this.title = props.title || "INVALID";
        this.library = "INVALID";

    }
}

export default VideoInfo;
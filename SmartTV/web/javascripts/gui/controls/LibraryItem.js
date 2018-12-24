import EventEmitter from "../../lib/event-emitter.js";
import VideoInfo from "../../VideoInfo.js";

class LibraryItem extends EventEmitter {
    /**
     * 
     * @param {VideoInfo} videoInfo
     */
    constructor(videoInfo) {
        super();
        this.info = videoInfo;
    }
    get main() {
        if (!this.mainContainer) {
            this.mainContainer = document.createElement("div");
            this.mainContainer.className = "LibraryItem";

            this.titleContainer = document.createElement("div");
            this.titleContainer.className = "title";
            this.titleText = document.createTextNode("");

            this.mainContainer.appendChild(this.titleContainer);
            this.titleContainer.appendChild(this.titleText);

            this.mainContainer.addEventListener("click", () => {
                this.emit("click");
            });
        }
        return this.mainContainer;
    }
    get uniqueID() {
        return this.info.uniqueID;
    }
    render() {
        const unused = this.main;

        this.titleText.data = this.info.title;
    }
}

export default LibraryItem;
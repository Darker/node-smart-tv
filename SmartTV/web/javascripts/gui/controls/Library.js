import EventEmitter from "../../lib/event-emitter.js";
import VideoInfo from "../../VideoInfo.js";
import LibraryItem from "./LibraryItem.js";

class Library extends EventEmitter {
    constructor() {
        super();
        this.main = document.createElement("div");
        this.main.className = "Library";

        this.heading = document.createElement("div");
        this.heading.className = "heading";
        this.headingTextH2 = document.createElement("h2");
        this.headingText = document.createTextNode("Library");
        this.headingTextH2.appendChild(this.headingText);

        this.items = document.createElement("div");
        this.items.className = "items";


        this.main.appendChild(this.heading);
        this.main.appendChild(this.items);

        /** @type {LibraryItem[]} **/
        this.videos = [];
    }
    render() {
        for (const item of this.videos) {
            item.render();
            const main = item.main;
            if (main.parentElement == null) {
                this.items.appendChild(main);
            }
        }
    }
    set label(value) {
        this.headingText.data = value;
    }
    get label() {
        return this.headingText.data;
    }
    set selected(value) {
        this.main.classList.toggle("selected", !!value);
    }
    get selected() {
        this.main.classList.contains("selected");
    }

    get uniqueID() {
        return this.main.getAttribute("data-library");
    }
    set uniqueID(value) {
        return this.main.setAttribute("data-library", value);
    }
    findVideoById(id) {
        return this.videos.find((v) => { return v.uniqueID == id; });
    }
    findVideoIndexById(id) {
        return this.videos.findIndex((v) => { return v.uniqueID == id; });
    }
    containsVideoId(id) {
        return this.findVideoIndexById(id) >= 0;
    }
    /**
     * 
     * @param {VideoInfo[]} infos
     */
    addVideosFromInfo(infos) {
        let changed = false;
        for (const info of infos) {
            if (!this.containsVideoId(info.uniqueID)) {
                const newitem = new LibraryItem(info);
                this.videos.push(newitem);
                newitem.on("click", () => {
                    this.emit("video.click", { uniqueID: newitem.uniqueID });
                });
                changed = true;
            }
            else {
                console.log("Video ", info, "already present in library listing.");
            }
        }
        if (changed) {
            this.render();
        }
    }
}

export default Library; 
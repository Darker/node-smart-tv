import VideoInfo from "../../VideoInfo.js";
import LibraryItem from "./LibraryItem.js";
import AutoCompleteField from "./AutoCompleteField.js";
import InstaPlayButton from "./library/InstaPlayButton.js";
import GuiItem from "../GuiItem.js";

class Library extends GuiItem {
    constructor() {
        super();
        this.main = document.createElement("div");
        this.main.className = "Library";

        this.heading = document.createElement("div");
        this.heading.className = "heading";
        this.headingTextH2 = document.createElement("h2");
        this.headingText = document.createTextNode("Library");
        this.headingTextH2.appendChild(this.headingText);
        this.heading.appendChild(this.headingTextH2);

        this.toolsTop = document.createElement("div");
        this.toolsTop.className = "tools top toolblock";

        this.searchFieldArea = document.createElement("div");
        this.searchFieldArea.className = "search";
        this.searchField = new AutoCompleteField();
        this.listen(this.searchField, "change", () => {
            this.updateSearchArea();
        });
        this.searchField.html.className = "search";
        this.searchFieldArea.appendChild(this.searchField.html);

        this.searchInstaPlay = new InstaPlayButton();
        this.listen(this.searchInstaPlay, "play", () => {
            this.emit("play.string", { string: this.searchField.value, library: this.uniqueID });
        });

        //this.searchInstaPlay.style.display = "none";

        this.toolsTop.appendChild(this.searchFieldArea);
        this.toolsTop.appendChild(this.searchInstaPlay.html);


        this.items = document.createElement("div");
        this.items.className = "items toolblock";

        this.main.appendChild(this.heading);
        this.main.appendChild(this.toolsTop);
        this.main.appendChild(this.items);

        /** @type {LibraryItem[]} **/
        this.videos = [];

        this.features = {};
    }
    render() {
        for (const item of this.videos) {
            item.render();
            const main = item.main;
            this.items.appendChild(main);
        }
    }
    updateSearchArea() {
        const shouldShow = this.searchField.value.length > 0 && !!this.features.playString;
        console.log(`const ${shouldShow} = ${this.searchField.value.length} > 0 && ${!!this.features.playString};`)
        this.searchInstaPlay.visible = shouldShow;
        if (shouldShow) {
            this.searchInstaPlay.text = this.searchField.value;
        }
    }
    /**
     * Should be called whenever list if features updates
     * */
    featuresUpdated() {
        this.searchInstaPlay.visible = this.features.playString && this.features.search;
        this.updateSearchArea();
    }
    set label(value) {
        //console.log("#" + this.uniqueID + " \""+this.label+"\" -> \""+value+"\"");
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
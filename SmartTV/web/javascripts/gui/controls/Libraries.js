import EventEmitter from "../../lib/event-emitter.js";
import Library from "./Library.js";
/**
 * @typedef {import("../../VideoInfo.js").default} VideoInfo
 * */
class Libraries extends EventEmitter {
    constructor() {
        super();
        /** @type {{[id:string]:Library}} **/
        this.libs = null;
        this.libs = {};

        this.libraryMenu = document.createElement("div");
        this.libraryMenu.className = "libraryMenu";

        

        this.libraryContainer = document.createElement("div");
        this.libraryContainer.className = "libraryContainer";
        /**
         * Shouldbe set to true if anything that affects visuals has changed
         * and was not projected to DOM.
         * */
        this.dirty = false;
    }
    * libraries() {
        for (let name in this.libs) {
            if (this.libs.hasOwnProperty(name)) {
                yield this.libs[name];
            }
        }
    }
    get main() {
        this.render();
        return this.libraryContainer;
    }
    render() {
        this.libraryMenu.innerHTML = "";
        for (const lib of this.libraries()) {
            lib.render();
            const main = lib.main;
            if (main.parentNode != this.libraryContainer) {
                this.libraryContainer.appendChild(main);
            }

            const libButton = document.createElement("button");
            libButton.className = "libButton";
            libButton.setAttribute("data-library", lib.uniqueID);
            libButton.appendChild(document.createTextNode(lib.label));
            this.libraryMenu.appendChild(libButton);
        }

    }
    /**
     * 
     * @param {{uniqueID:string,label:string}[]} metadata
     */
    setLibraryMetadata(metadata) {
        for (const meta of metadata) {
            const lib = this.getLibraryById(meta.uniqueID);
            lib.label = meta.label;
        }
        if (this.dirty) {
            this.render();
        }
    }
    getLibraryById(id) {
        if (!this.libs[id]) {
            const lib = this.libs[id] = new Library();
            lib.uniqueID = id;
            lib.on("video.click", (x) => {
                this.emit("video.click", x);
            });
            this.dirty = true;
        }
        return this.libs[id];
    }
    /**
     * Adds videos and sorts them in libraries
     * @param {VideoInfo[]} videos
     */
    videosAdded(videos) {
        for (const vid of videos) {
            const lib = this.getLibraryById(vid.library);
            lib.addVideosFromInfo([vid]);
        }
        if (this.dirty) {
            this.render();
        }
    }
}

export default Libraries;
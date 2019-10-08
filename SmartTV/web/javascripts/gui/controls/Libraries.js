import Library from "./Library.js";
import MenuScreen from "../MenuScreen.js";
import MenuItemScreen from "../menu/MenuItemScreen.js";
/**
 * @typedef {import("../../VideoInfo.js").default} VideoInfo
 * */
/**
 * @typedef {import("../menu/ListMenu").default} ListMenu
 * */

class Libraries extends MenuScreen {
    constructor() {
        super();
        /** @type {{[id:string]:Library}} **/
        this.libs = {};
        /** @type {ListMenu} **/
        this._libraryMenu = null;
        
        this.libraryContainer = document.createElement("div");
        this.libraryContainer.className = "Libraries MenuScreen";
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
    /** @type {ListMenu} **/
    get libraryMenu() {
        return this._libraryMenu;
    }
    set libraryMenu(value) {
        this._libraryMenu = value;
        this.render();
    }
    get main() {
        this.render();
        return this.libraryContainer;
    }
    render() {
        for (const lib of this.libraries()) {
            lib.render();
            const main = lib.main;
            if (main.parentNode != this.libraryContainer) {
                this.libraryContainer.appendChild(main);
            }

            if (this._libraryMenu && !lib._menuitem) {
                const item = lib._menuitem = new MenuItemScreen(this, lib.label, null, () => { this.showLibrary(lib.uniqueID); });
                this._libraryMenu.addItem(item);
            }
        }
    }
    showLibrary(id) {
        for (const lib of this.libraries()) {
            if (lib.uniqueID != id) {
                lib.selected = false;
            }
            else {
                lib.selected = true;
            }
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
            if (meta.features) {
                let updated = false;
                for (const [name, value] of Object.entries(meta.features)) {
                    if (lib.features[name] !== value) {
                        updated = true;
                        lib.features[name] = value;
                    }
                    
                }
                if (updated) {
                    lib.featuresUpdated();
                }
                
            }
        }
        if (this.dirty) {
            this.render();
        }
    }
    /**
     * 
     * @param {string} id
     */
    getLibraryById(id) {
        if (!this.libs[id]) {
            const lib = this.libs[id] = new Library();
            lib.uniqueID = id;
            lib.on("video.click", (x) => {
                this.emit("video.click", x);
            });
            lib.on("play.string", (x) => { this.emit("play.string", x); });
            this.dirty = true;
            if (Object.getOwnPropertyNames(this.libs).length == 1) {
                lib.selected = true;
            }
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
import EventEmitter from "../../lib/event-emitter.js";
import EventCoordinates from "../EventCoordinates.js";


const CSS_VAR_PROGRESS = "--progress";
const CSS_VAR_PRELOADED = "--preloaded";
class PlayerControls extends EventEmitter {
    constructor() {
        super();
        this.mainContainer = document.createElement("div");
        this.mainContainer.className = "PlayerControls";
        this.playPauseButton = document.createElement("button");
        this.playPauseButton.className = "playpause";
        this.playPauseText = document.createTextNode("►");

        this.playPauseButton.appendChild(this.playPauseText);

        this.stopButton = document.createElement("button");
        this.stopButton.appendChild(document.createTextNode("◼"));
        this.stopButton.className = "stop";

        this.progressBar = document.createElement("div");
        this.progressBar.className = "progress";

        this._progress = 0;
        this._preloaded = 0;
        this.progress = this._progress;
        this.preloaded = this._preloaded;
        //this.progressBar.style.setProperty("--color-progress", "blue");

        this.mainContainer.appendChild(this.playPauseButton);
        this.mainContainer.appendChild(this.stopButton);
        this.mainContainer.appendChild(this.progressBar);

        this.playPauseButton.addEventListener("click", this.onPlayPauseClick = (e) => {
            this.emit("toggle");
        });
        this.stopButton.addEventListener("click", this.onStopClick = (e) => {
            this.emit("stop");
        });
        this.progressBar.addEventListener("click", this.onProgressClick = (e) => {
            const rect = this.progressBar.getBoundingClientRect();
            this.mouseSeek(EventCoordinates.getCoords(e).x, rect.left, rect.right - rect.left);
        });
        //setInterval(() => {
        //    if (Math.random() > 0.2) {
        //        const value = Math.random();
        //        this.preloaded += value;
        //        if (Math.random() > 0.1) {
        //            this.progress += Math.min(Math.random(), value);
        //        }
        //    }
        //}, 100);
    }
    get main() {
        return this.mainContainer;
    }
    get playing() {
        return this.mainContainer.classList.contains("playing");
    }
    set playing(value) {
        this.mainContainer.classList.toggle("playing", value);
    }

    get medialoaded() {
        return this.mainContainer.classList.contains("medialoaded");
    }
    set medialoaded(value) {
        this.mainContainer.classList.toggle("medialoaded", value);
    }

    set progress(value) {
        value = Math.max(0, Math.min(value, 100));
        //this.progressBar.style.setProperty(CSS_VAR_PROGRESS, value);
        this._progress = value;
        if (this.preloaded < value) {
            this.preloaded = value;
        }
    }
    /** @type {number} **/
    get progress() {
        return this._progress;
        //const prop = this.progressBar.style.getProperty(CSS_VAR_PROGRESS);
        //if (!isNaN(prop * 1)) {
        //    return prop;
        //}
        //else {
        //    return 0;
        //}
    }

    get preloaded() {
        return this._preloaded;
        //const prop = this.progressBar.style.getProperty(CSS_VAR_PRELOADED);
        //if (!isNaN(prop * 1)) {
        //    return prop;
        //}
        //else {
        //    return this.progress;
        //}
    }
    set preloaded(value) {
        //console.log("preloaded = ",value);
        value = Math.max(value, this.progress);
        value = Math.max(0, Math.min(value, 100));
        //this.progressBar.style.setProperty(CSS_VAR_PRELOADED, value);
        this._preloaded = value;
    }
    /**
     * 
     * @param {number} position mouse X position
     * @param {number} left position of the left corner
     * @param {number} width width ofthe seek bar
     */
    mouseSeek(position, left, width) {
        const percentage = ((position - left) / width) * 100;
        console.log("Mouse seek", "((" + position + " - " + left + ") / " + width + ") * 100 = ", percentage)
        this.seek(percentage);
    }

    seek(percentage) {
        console.log("seek", percentage);
        this.emit("seek", percentage);
    }
}


export default PlayerControls;
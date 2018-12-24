import EventEmitter from "../../lib/event-emitter.js";
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

        this.mainContainer.appendChild(this.playPauseButton);
        this.mainContainer.appendChild(this.stopButton);
        this.mainContainer.appendChild(this.progressBar);

        this.playPauseButton.addEventListener("click", this.onPlayPauseClick = (e) => {
            this.emit("toggle");
        });
        this.stopButton.addEventListener("click", this.onStopClick = (e) => {
            this.emit("stop");
        });
    }
    get main() {
        return this.mainContainer;
    }
}

export default PlayerControls;
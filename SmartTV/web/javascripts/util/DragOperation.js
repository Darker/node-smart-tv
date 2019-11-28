import EventCoordinates from "./EventCoordinates.js";
import ListenerManager from "./ListenerManager.js";
import CoordinatesTime from "./CoordinatesTime.js";
import EventEmitter from "../lib/event-emitter.js";

class DragOperation extends EventEmitter {
    /**
     * 
     * @param {MouseEvent|TouchEvent} startDragEvent
     */
    constructor(startDragEvent) {
        super();
        this.startCoordinates = new CoordinatesTime(...EventCoordinates.GetXYCoordinates(startDragEvent));
        this.lastCoordinates = this.startCoordinates;

        this.evman = new ListenerManager();
        this.evman.listen(document, "mousemove", (event) => {
            this.handleMove(new CoordinatesTime(...EventCoordinates.GetXYCoordinates(event)));
        });
        this.evman.listen(document, "touchmove", (event) => {
            this.handleMove(new CoordinatesTime(...EventCoordinates.GetXYCoordinates(event)));
        });
        this.evman.listen(document, "mouseup", (event) => {
            this.end();
        });
        this.evman.listen(document, "touchend", (event) => {
            this.end();
        });
        this.logTrack = false;
        this.track = [];
    }

    handleMove(coordinates) {
        if (this.logTrack) {
            this.track.push(coordinates);
        }
        this.lastCoordinates = coordinates;
        this.emit("moved", this);
    }
    end() {
        this.emit("end", this);
        this.destroy();
    }
    destroy() {
        this.evman.destroy();
        if (this.removeAllListeners) {
            this.removeAllListeners();
        }
        if (this._listeners) {
            this._listeners = {};
        }
    }
    
}

export default DragOperation;

import EventCoordinates from "../EventCoordinates.js";
import MenuScreen from "../MenuScreen.js";
class TouchPad extends MenuScreen {
    constructor() {
        super();
        this.mainElement = document.createElement("div");
        this.mainElement.className = "TouchPad MenuScreen";
        this.mainElement.addEventListener("touchstart", this.touchstart = this.touchstart.bind(this));
        this.mainElement.addEventListener("touchmove", this.touchmove = this.touchmove.bind(this));
        this.mainElement.addEventListener("touchend", this.touchend = this.touchend.bind(this));

        this.lastMove = { x: 0, y: 0 };
        // Time when the finger touched the screen
        this.lastDown = 0;
        // only taps faster than this count as clicks
        this.clickThreshold = 100;
        // speeds up the mouse movement
        this.speedMultiplier = 3;
        // wait before sending click
        // if screen is touched again, send mousedown instead
        this.clickDelay = 100;

        this.clickTimeoutId = 0;
        this.mousedownTimeoutId = 0;
        this.mousedownDelay = 100;

        this.mousedown = false;
        
    }
    get main() {
        return this.mainElement;
    }
    /**
     * 
     * @param {TouchEvent} e
     */
    touchstart(e) {
        this.lastMove = EventCoordinates.getCoords(e);
        this.lastDown = performance.now();

        if (this.clickTimeoutId != 0) {
            clearTimeout(this.clickTimeoutId);
            this.clickTimeoutId = 0;
            this.mousedownTimeoutId = setTimeout(() => {
                this.emit("button", { left: "down" });
                this.mousedownTimeoutId = 0;
                this.mousedown = true;
            }, this.mousedownDelay);
        }
        e.preventDefault();
    }
    /**
     * 
     * @param {TouchEvent} e
     */
    touchmove(e) {
        const coords = EventCoordinates.getCoords(e);
        const delta = this.getDeltaVector(coords);
        this.emit("move.delta", delta);
        console.log("Movement: ", delta);
        this.lastMove = coords;

        e.preventDefault();
    }
    /**
     * 
     * @param {{x:number, y:number}} coordinates
     */
    getDeltaVector(coordinates) {
        return {
            dx: (coordinates.x - this.lastMove.x) * this.speedMultiplier,
            dy: (coordinates.y - this.lastMove.y) * this.speedMultiplier
        };
    }
    /**
     * 
     * @param {TouchEvent} e
     */
    touchend(e) {
        if (this.clickTimeoutId == 0 && ((performance.now() - this.lastDown) < this.clickThreshold)) {
            console.log("Tap under click threshold, starting click timer!");
            this.clickTimeoutId = setTimeout(() => {
                console.log("Emit click.");
                this.emit("button", { left: "click" });
                this.clickTimeoutId = 0;
            }, this.clickDelay);
        }
        else if (this.mousedownTimeoutId != 0) {
            clearTimeout(this.mousedownTimeoutId);
            this.mousedownTimeoutId = 0;
            console.log("Mousedown canceled, emitting double click instead.")
            this.emit("button", { left: "doubleclick" });
        }
        else if (this.mousedown) {
            this.emit("button", { left: "up" });
        }

        e.preventDefault();
    }

}

export default TouchPad;
const EventEmitter = require("events");
const robotjs = require("robotjs");
/**
 * @typedef {import("../../web/javascripts/gui/controls/ControlEvents").ButtonEvent} ButtonEvent
 * */

class MouseControl extends EventEmitter {
    constructor() {
        super();
        
    }

    /**
     * 
     * @param {{dx:number,dy:number}} vector
     */
    moveDelta(vector) {
        const pos = robotjs.getMousePos();
        robotjs.moveMouse(pos.x + vector.dx, pos.y + vector.dy);
    }

    click() {
        robotjs.mouseClick("left");
    }
    /**
     * 
     * @param {ButtonEvent} action
     */
    buttonAction(action) {
        if (action.left) {
            if (action.left.indexOf("click")!=-1) {
                robotjs.mouseClick("left", action.left == "doubleclick");
            }
            else if (action.left == "down" || action.left == "up") {
                robotjs.mouseToggle(action.left, "left");
            }
        }
    }
}
module.exports = MouseControl;
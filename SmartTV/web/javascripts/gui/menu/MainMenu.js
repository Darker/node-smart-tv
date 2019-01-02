import EventEmitter from "../../lib/event-emitter.js";
import ListMenu from "./ListMenu.js";
import MenuItem from "./MenuItem.js";
import EventCoordinates from "../EventCoordinates.js";



class MainMenu extends EventEmitter {
    constructor() {
        super();
        this.mainElement = document.createElement("div");
        this.mainElement.className = "MainMenu";

        this.dragArrow = document.createElement("div");
        this.dragArrow.className = "dragArrow";
        //this.dragArrow.appendChild(document.createTextNode("test"))

        this.mainElement.appendChild(this.dragArrow);

        this.content = new ListMenu(this);

        this.resetMenuDrag();

        window.addEventListener("touchstart", (e) => {
            const touches = EventCoordinates.getCoords(e);
            
            //console.log("Touch start at: ", touches);

            if (this.isMenuDragStart(touches.x)) {
                console.log("Menu drag!");
                this.drag.start = touches;
                this.drag.isMenuStart = true;
                this.menuOpen = false;
            }
        });
        window.addEventListener("touchmove", (e) => {
            
            if (this.drag.isMenuStart) {
                const touches = EventCoordinates.getCoords(e);
                this.drag.current = touches;
                this.drag.evts++;
                //console.log("Drag:", touches, this.drag.evts);
                if (this.drag.evts > 5) {

                    if (this.drag.isMenuDirection) {
                        const menuparent = this.mainElement.parentNode;
                        const newLeft = Math.max(document.body.clientWidth - touches.x,0);
                        console.log("Move menu to ",newLeft)
                        if (menuparent) {
                            menuparent.style.right = newLeft + "px";
                            menuparent.style.left = "auto";
                        }
                    }
                    else if (Math.abs(touches.y - this.drag.start.y) < window.screen.availWidth / 5) {
                        console.log("Menu unlocked!");
                        this.drag.isMenuDirection = true;
                    }
                    else {
                        console.log("Drag cancelled - ", Math.abs(touches.y - this.drag.start.y), " > ", window.screen.availWidth / 5);
                        this.drag.isMenuStart = false;
                    }
                }
            }
        });
        window.addEventListener("touchend", (e) => {
            const menuparent = this.mainElement.parentNode;
            if (this.drag.isMenuStart && this.drag.isMenuDirection) {
                //const touches = getCoords(e);
                console.log("Menu drag ended at ", (this.drag.current.x / window.screen.availWidth))
                // if the drag is over 50% of the screen
                if (this.drag.current.x > window.screen.availWidth / 2) {
                    //console.log("Docking menu at full screen")
                    this.menuOpen = true;
                    this.drag.isMenuDirection = false;
                    this.drag.isMenuStart = false;
                    if (menuparent) {
                        menuparent.style.right = "0px";
                        menuparent.style.left = "auto";
                        console.log("Docking menu at full screen", menuparent.style.right)
                    }
                }
                else {
                    this.resetMenuDrag();
                    if (menuparent) {
                        menuparent.style.right = "";
                        menuparent.style.left = "";
                    }
                }
            }
            else if (this.menuOpen) {
               
            }
            else {
                if (menuparent) {
                    menuparent.style.right = "";
                    menuparent.style.left = "";
                }
                this.resetMenuDrag();
            }
        });
    }
    resetMenuDrag() {
        return this.drag = {
            start: { x: NaN, y: NaN },
            current: { x: NaN, y: NaN },
            evts: 0,
            isMenuStart: false,
            isMenuDirection: false,
            isMenuOpen: false
        };
    }

    closeMenu() {
        const p = this.menuParent;
        if (p && this.menuOpen) {
            p.style.right = "";
            p.style.left = "";
            this.menuOpen = false;
        }
    }
    get menuParent() {
        return this.mainElement.parentNode;
    }
    get menuDragStartArea() {
        if (this.drag.isMenuOpen) {
            return document.body.clientWidth;
        }
        else {
            return 0;
        }
    }
    get menuOpen() {
        return this.drag.isMenuOpen;
    }
    set menuOpen(value) {
        this.drag.isMenuOpen = value;
        this.mainElement.classList.toggle("open", value);
    }
    get menuDragStartMargin() {
        return window.screen.availWidth / 10;
    }
    isMenuDragStart(coordinateX) {
        return Math.abs(coordinateX - this.menuDragStartArea) < this.menuDragStartMargin;
    }
    get main() {
        this.mainElement.appendChild(this.content.main);
        return this.mainElement;
    }

}

export default MainMenu;
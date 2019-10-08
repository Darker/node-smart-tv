import MenuItem from "./MenuItem.js";
import MenuScreen from "../MenuScreen.js";
class MenuItemScreen extends MenuItem {
    /**
     * 
     * @param {MenuScreen} controlledScreen
     * @param {string} title
     * @param {string} iconUrl
     * @param {function} callback
     */
    constructor(controlledScreen, title, iconUrl, callback) {
        super(title, iconUrl, callback);
        this.screen = controlledScreen;
        this.screen.menuItems.push(this);
    }
    get active() {
        return super.active;
    }
    set active(value) {
        super.active = value;
        this.screen.updateVisibility();
    }

}

export default MenuItemScreen;
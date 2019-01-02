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
    }
}

export default MenuItemScreen;
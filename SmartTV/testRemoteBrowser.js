const SETTINGS = require("./lib/config/configLoader")();
const BrowserPlayer = require("./lib/video/players/browser/BrowserPlayer");

const player = new BrowserPlayer(SETTINGS.paths.firefox_path, 6462);


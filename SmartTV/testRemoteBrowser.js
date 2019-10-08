const SETTINGS = require("./lib/config/configLoader")();
const BrowserPlayer = require("./lib/video/players/browser/BrowserPlayer");

function timeout(millis) {
    return new Promise((resolve) => setTimeout(resolve, millis));
}

const player = new BrowserPlayer(SETTINGS, 6462);
const startTime = new Date().getTime();
(async () => {
    await player.initFox();
    await timeout(500);
    await player.openMedia({ title: "Blade Runner 2049" });
    console.log("Media loaded in ", new Date().getTime() - startTime);
    console.log("Duration: ", await player.getDuration());
    await timeout(2000);
    //for (let i = 0; i < 3; ++i) {
    //    console.log("Current time: ", await player.getCurrentTime());
    //    await timeout(2000);
    //}
    //player.setVolume(0);
    //await timeout(1000);
    //player.relativeSeek(-10);
    //await timeout(1000);
    //player.relativeSeek(9);
    //await timeout(1000);
    //player.seek(15 * 60);
    //console.log("Current time: ", await player.getCurrentTime());
    //await timeout(10000);
    await player.stop();
    console.log("Test done in ", new Date().getTime() - startTime);
})();

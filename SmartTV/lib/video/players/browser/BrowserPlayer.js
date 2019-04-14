const Player = require("../../Player");
const child_process = require("child_process");

/**
 * @typedef {import("../../../net/RemoteClient")} RemoteClient
 * */
//--start-debugger-server 1234
const DEBUG_FLAG = "--start-debugger-server";
const PROFILE_FLAG = "-P \"node-smart-tv\"";
const NO_REMOTE = "-no-remote";
class BrowserPlayer extends Player {
    constructor(firefoxPath = "firefox", debugPort = 6660) {
        super();
        const command = "\"" + firefoxPath + "\" " + DEBUG_FLAG + " " + debugPort + " " + PROFILE_FLAG + " " + NO_REMOTE;
        console.log("Running firefox via: " + command);
        this.firefox = child_process.exec(
            command,
            {
                windowsHide: true
            },
            (error, stdout, stderr) => {
                console.log("Firefox terminated. \nSTDERR:\n" + stderr + "\n\nSTDOUt:\n" + stdout + "\n\nERROR:" + error);
            }
        );
        this.firefox.on("close", (e) => console.log("Firefox closed!"));
        this.firefox.on("error", (e) => console.log("Firefox error: " + e));
    }

}
module.exports = BrowserPlayer;
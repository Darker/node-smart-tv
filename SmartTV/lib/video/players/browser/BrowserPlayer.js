const Player = require("../../Player");
const child_process = require("child_process");
const net = require("net");
const promiseSocketConnect = require("../../../util/promiseSocketConnect");
const JsonSocket = require("json-socket");
const FSocket = require("./fremote/FSocket");
const PendingNotification = require("./fremote/PendingNotification");
const Tab = require("./fremote/actors/Tab");


/**
 * @typedef {import("../../../net/RemoteClient")} RemoteClient
 * */
//--start-debugger-server 1234
const DEBUG_FLAG = ["--start-debugger-server"];
const PROFILE_FLAG = ["-P", "node-smart-tv"];
const NO_REMOTE = ["-no-remote"];
class BrowserPlayer extends Player {
    constructor(firefoxPath = "firefox", debugPort = 6660) {
        super();
        this.firefoxPath = firefoxPath;
        this.debugPort = debugPort;
        //this.foxPromise = Foxdriver.launch({
        //    url: 'https://www.netflix.com',
        //    bin: firefoxPath,
        //    //args: ["-P", "\"node-smart-tv\""]
        //});
        const args = [...DEBUG_FLAG, debugPort, ...PROFILE_FLAG, ...NO_REMOTE]
        const command = "\"" + firefoxPath + "\" " + DEBUG_FLAG + " " + debugPort + " " + PROFILE_FLAG + " " + NO_REMOTE;
        console.log("Running firefox via: " + command);
        this.firefox = child_process.spawn(
            "" + firefoxPath + "",
            args,
            {
                windowsHide: true
            }
        );
        console.log("Firefox PID: ", this.firefox.pid);
        this.firefox.on("close", (e) => console.log("Firefox stdout closed!"));
        this.firefox.on("error", (e) => console.log("Firefox error: " + e));
        this.firefox.on("exit", (code, signal) => { console.log(`Firefox exit with code ${code}`); });
        this.initFox();
    }
    async initFox() {
        //await new Promise((resolve) => setTimeout(resolve, 800));
        var client = new FSocket(new net.Socket());
        const initPromise = client.notificationPromise(PendingNotification.INTRODUCTION_REQUEST);
        await promiseSocketConnect(client.socket, { port: this.debugPort, host: "127.0.0.1" });
        console.log("Connected to firefox.");
        await initPromise;
        console.log("Initialized.");
        //client.on("data", (data) => { console.log("[FIREFOX][MSG]", ""+data); });
        // const jsonClient = new JsonSocket(client, { delimiter: ":" });
        //jsonClient.on("message", function () {
        //    console.log("[FIREFOX][MSG]", ...arguments);
        //});
        client.on("close", () => { console.log("Firefox closed socket."); });
        await new Promise((resolve) => setTimeout(resolve, 300));
        /** @type {RDMessageResponseTabs} **/
        const tabs = await client.sendAndAwaitResponse({ "to": "root", "type": "listTabs" });
        //console.log("TABS: ", tabs.tabs);
        const tab = new Tab(client, tabs.tabs[0]);
        await tab.navigateTo("https://www.netflix.com", true);
        
        //console.log("EVAL RESULT: ", await tab.js(`true`, true)===true);

        if (await tab.js(`window.location.href == "https://www.netflix.com/browse"`)) {
            console.log("[Netflix] Already logged in!");
        }
        else {
            console.log("[Netflix] Not logged in, going to login:");
            await tab.navigateTo("https://www.netflix.com/cz/login", true);
            console.log("[Netflix] Landed on login page.");
        }

        //const attachRes = await client.sendAndAwaitResponse({ to: tabs.tabs[0].actor, type: "attach" });
        //const navRes = await client.sendAndAwaitResponse({ to: tabs.tabs[0].actor, type: "navigateTo", url: "https://www.netflix.com" });
        //console.log("Waiting for navigation to finish.");
        //await client.notificationPromise(PendingNotification.NavigationEnd(tabs.tabs[0].actor));
        //console.log("Navigation done");

        ////const evalRes = await client.sendAndAwaitResponse({ to: tabs.tabs[0].consoleActor, type: "evaluateJS", text: "alert('d')" });
        ////console.log("EVAL RESULT: ", evalRes);
        //console.log("EVAL RESULT: ", await client.sendAndAwaitResponse({ to: tabs.tabs[0].consoleActor, type: "evaluateJS", text: "document.title" }));
        //console.log("EVAL RESULT: ", await client.sendAndAwaitResponse({ to: tabs.tabs[0].consoleActor, type: "evaluateJS", text: `document.querySelector(".authLinks.redButton").click()` }));
        //document.querySelector(".authLinks.redButton")
        // ------
        //const { browser, tab } = await this.foxPromise;
        //const preferences = await browser.preference.getAllPrefs();
        //await tab.console.startListeners();
        ////console.log(preferences);
        //await new Promise((resolve) => setTimeout(resolve, 20000));

        //const script = "window.location.hash = \"blablabla\"";
        //console.log(await tab.console.request('evaluateJS', { text: script }));
        //console.log(await tab.console.evaluateJS("window.location.hash = \"blablabla\""));


    }

}

module.exports = BrowserPlayer;
const Player = require("../../Player");
const child_process = require("child_process");
const net = require("net");
const promiseSocketConnect = require("../../../util/promiseSocketConnect");
const JsonSocket = require("json-socket");
const FSocket = require("./fremote/FSocket");
const PendingNotification = require("./fremote/PendingNotification");
const Tab = require("./fremote/actors/Tab");
const NetflixVideo = require("../../videotypes/NetflixVideo");
const robotjs = require("robotjs");

/**
 * @typedef {import("../../../net/RemoteClient")} RemoteClient
 * */
/**
 * @typedef {import("../../../config/configLoader").Config} Config
 * */
/**
 * @typedef {import("../../Video")} Video
 * */
//--start-debugger-server 1234
const DEBUG_FLAG = ["--start-debugger-server"];
const PROFILE_FLAG = ["-P", "node-smart-tv"];
const NO_REMOTE = ["-no-remote"];
class BrowserPlayer extends Player {
    /**
     * 
     * @param {Config} config
     * @param {any} firefoxPath
     * @param {number} debugPort
     */
    constructor(config, debugPort = 6660) {
        super();
        this.firefoxPath = config.paths.firefox_path;
        this.debugPort = debugPort;
        this.config = config;
        //this.foxPromise = Foxdriver.launch({
        //    url: 'https://www.netflix.com',
        //    bin: firefoxPath,
        //    //args: ["-P", "\"node-smart-tv\""]
        //});
        
        this._playing = false;
        /** @type {NetflixVideo} the video that is playing now or null**/
        this.media = null;
    }
    /**
     * 
     * @param {Video} video
     */
    canPlay(video) {
        return video.libraryId == "netflix";
    }
    /**
     * 
     * @param {NetflixVideo} video
     */
    async openMedia(video) {
        console.log("Browser player to open: " + video.uniqueID);
        this.media = video;
        if (!this.tab) {
            await this.initFox();
        }

        await this.tab.navigateToIfNotThere("https://www.netflix.com/search?q=" + encodeURIComponent(video.title), true);
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (await this.tab.awaitElement("#title-card-0-0 a", 5000,100)) {
            await this.tab.clickElement("#title-card-0-0 a");
            await new Promise((resolve) => setTimeout(resolve, 500));
            if (await this.tab.js(`!!(document.querySelector("#title-card-0-0 a.slider-refocus"))`)) {
                await this.tab.js(`document.querySelector("#title-card-0-0 a.title-card-play").click()`);
            }
        }

        if (await this.tab.awaitElement(".PlayView-play .nf-big-play-pause button", 1000,300)) {
            await this.tab.clickElement(".PlayView-play .nf-big-play-pause button");
        }
        //robotjs.keyTap("f11");

        this.emit("medialoaded", true);
        this.mediaLoaded = true;
        await this.tab.awaitElement("video", 6000, 50);
        if (!this.autoplay) {
            
        }
        else {

        }
    }
    /**
     * Starts playing current media. Shold never throw.
     * Return false on failure.
     * */
    async play() {
        return await this.tab.js(`document.querySelector("video").play()`);
    }
    async pause() {
        return await this.tab.js(`document.querySelector("video").pause()`);
    }
    async togglePlay() {
        return await this.tab.js(
            `var vid = document.querySelector("video");
             vid.paused ? vid.play() : vid.pause();`
        );
    }
    async isPlaying() {
        return !(await this.tab.js(
            `document.querySelector("video").paused`
        ));
    }
    /**
     * Returns true if media is loaded.
     * 
     * After succesful @see {#stop} call, 
     * this should return false.
     * */
    async isMediaOpen() { return !!this.media }
    /**
     * Sets volume of the player.
     * @param {any} number value between 0 and 1, percentage of volume
     * @returns {number} final volume value, also between 0 and 1
     */
    async setVolume(number) {
        return await this.tab.js(`document.querySelector("video").volume = ${number}`);
    }
    async stop() {
        //this.firefox.
        this.firefox.kill();
        this.firefox.kill("SIGKILL");
        this.firefox.kill('SIGINT');
        this.firefox = null;
        this.tab = null;
        this._playing = false;
        this.media = null;
    }
    /**
     * Retrieves and returns current time.
     * Returns current audio time in seconds.
     * @returns {number}
     * */
    async getCurrentTime() {
        return this._currentTime = await this.tab.js(`document.querySelector("video").currentTime`);
    }
    /**
     * Retrieves duration of the current media
     * value may be cached
     * @returns {number}
     * */
    async getDuration() {
        return await this.tab.js(`document.querySelector("video").duration`);
    }

    /**
     * Seek at a time in seconds. Fraction of seconds may be supported
     * but is not required.
     * @param {number} seconds
     * @returns {boolean} true on success, false on failure
     */
    async seek(seconds) {
        await this.defineVideoPlayer();
        await this.tab.js(`player.seek(${seconds * 1000});`);
        return true;
    }

    ///**
    // * Seeks by an offset from current time.
    // * @param {number} dtseconds
    // * @returns {boolean} true on success, false on failure
    // */
    async relativeSeek(dtseconds) {
        await this.defineVideoPlayer();
        await this.tab.js(`player.seek(player.getCurrentTime() + ${dtseconds * 1000});`);
    }


    get currentNetflixURL() {
        if (this._playing) {
            return this.currentVideoSearchQuery;
        }
        else {
            return "https://www.netflix.com";
        }
    }
    get currentVideoSearchQuery() {
        if (this._playing) {
            return "https://www.netflix.com/search?q=" + encodeURIComponent(this._playing.title);
        }
        else {
            return "https://www.netflix.com/search?q=";
        }
    }
    async initFox() {
        const args = [...DEBUG_FLAG, this.debugPort, ...PROFILE_FLAG, ...NO_REMOTE]
        const command = "\"" + this.firefoxPath + "\" " + DEBUG_FLAG + " " + this.debugPort + " " + PROFILE_FLAG + " " + NO_REMOTE;
        console.log("Running firefox via: " + command);

        const env = {};
        for (const [name, value] of Object.entries(process.env)) {
            env[name] = value;
        }
        // Attempt to force single process
        env.MOZ_FORCE_DISABLE_E10S = "MOZ_FORCE_DISABLE_E10S";

        this.firefox = child_process.spawn(
            "" + this.firefoxPath + "",
            args,
            {
                windowsHide: true,
                env
            }
        );
        console.log("Firefox PID: ", this.firefox.pid);

        this.firefox.on("close", (e) => console.log("Firefox stdout closed!"));
        this.firefox.on("error", (e) => console.log("Firefox error: " + e));
        this.firefox.on("exit", (code, signal) => { console.log(`Firefox exit with code ${code}`); });
        //await new Promise((resolve) => setTimeout(resolve, 10000));
        //process.exit(0);

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

        const tab = new Tab(client, tabs.tabs[0]);
        this.tab = tab;
        await tab.attach();

        //const process = await client.sendAndAwaitResponse({ "to": "root", "type": "getProcess" });
        //const fwindow = await client.sendAndAwaitResponse({ "to": "root", "type": "getWindow" });
        //console.log("Process", process);
        //console.log("Window:", fwindow);
        //return;
        //console.log("TABS: ", tabs.tabs);
        
        //for (let i = 0; i < 5; ++i) {
        //    await new Promise((resolve) => setTimeout(resolve, 2000));
        //    tab.send({ to: tab.actor, type: "focus" });
        //}
        //throw new Error("done!");

        await new Promise((resolve) => setTimeout(resolve, 1500));
        await tab.navigateTo(this.currentNetflixURL, true);
        
        //console.log("EVAL RESULT: ", await tab.js(`true`, true)===true);

        if (await tab.urlContains("/browse") || await tab.urlContains("/search?")) {
            console.log("[Netflix] Already logged in!");
            await this.selectNetflixProfile(tab);
        }
        else {
            if (!await tab.urlContains("/login")) {
                console.log("[Netflix] Not logged in, going to login:");
                await tab.navigateTo("https://www.netflix.com/cz/login", true);
            }

            console.log("[Netflix] Landed on login page.");

            if (!await this.tab.awaitElement("#id_userLoginId", 5000,300)) {
                throw new Error("Cannot find login form input!");
            }
                
            await tab.js(`document.querySelector("#id_userLoginId").value = "${this.config.datasources.netflix.email}";`);
            await tab.js(`document.querySelector("#id_password").value = "${this.config.datasources.netflix.password}";`);
            await tab.js(`document.querySelector("#id_password").form.submit();`);
            console.log("[Netflix] Form sent, awaiting onload.");
            await tab.awaitLoad();
            console.log("[Netflix] loaded.");
            await this.selectNetflixProfile(tab);
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
    /**
     * 
     * @param {Tab} tab
     */
    async selectNetflixProfile(tab) {
        if (await tab.js(`!!(document.querySelector("li.profile a.profile-link"))`)) {
            await tab.js(`document.querySelector("li.profile a.profile-link").click()`);
        }

        //await tab.js(`document.querySelector(".icon-search").click();`);
        //await new Promise((resolve) => setTimeout(resolve, 100));
        //await tab.js(`document.querySelector("div.searchBox input").value = "Disenchantement"`);
        //await tab.js(`document.querySelector("div.searchBox input").dispatchEvent(new InputEvent("input"));`);

    }

    async defineVideoPlayer() {
        if (!await this.tab.js("!!(typeof player=='object' && player.seek)")) {
            const defCode = `const videoPlayer = netflix
                            .appContext
                            .state
                            .playerApp
                            .getAPI()
                            .videoPlayer
       
                            // Getting player id
                            const playerSessionId = videoPlayer
                              .getAllPlayerSessionIds()[0]
                            
                            const player = videoPlayer
                              .getVideoPlayerBySessionId(playerSessionId)`;
            await this.tab.js(defCode);
        }
    }
}

module.exports = BrowserPlayer;
const Actor = require("./Actor");
const PromiseCriticalSection = require("../../../../../util/PromiseCriticalSection");
const PendingNotification = require("../PendingNotification");
/**
 * @typedef {import("../FSocket.js")} FSocket
 * */
class Tab extends Actor {
    /**
     * 
     * @param {FSocket} fsocket
     * @param {TabInfo} meta
     */
    constructor(fsocket, meta) {
        super(fsocket);
        this.meta = meta;
        this.attached = false;

        this._attachLock = new PromiseCriticalSection();
    }
    get actor() {
        return this.meta.actor;
    }
    async attach() {
        if (!this.attached) {
            try {
                await this._attachLock.lock();
                if (!this.attached) {
                    /** @type {RDAttachResponse} **/
                    const response = await this.send({ to: this.actor, type: "attach" });
                    if (response.threadActor && !response.error) {
                        this.attached = true;
                    }
                    else {
                        throw new Error("Attach failed: " + response.error);
                    }
                }
            }
            finally {
                this._attachLock.unlock();
            }
        }
    }
    /**
     * Navigates browser tab to given URL
     * @param {string} url target address
     * @param {boolean} awaitLoad default false, set to true to wait for the tab to finish loading
     */
    async navigateTo(url, awaitLoad = false) {
        await this.attach();
        const navRes = await this.send({ to: this.actor, type: "navigateTo", url: url });
        if (awaitLoad) {
            await this.awaitLoad();
        }
        return navRes;
    }
    /**
     * Navigates to URL if the browser is not at that URL already
     * @param {string} url
     * @param {boolean} awaitLoad true if you want to wait for navigation to end
     * @returns {Object|null} Returns navigation event response if navigation occured
     */
    async navigateToIfNotThere(url, awaitLoad) {
        await this.attach();
        if (await this.js(`window.location.href != "${url}"`)) {
            return await this.navigateTo(url, awaitLoad);
        }
        return null;
    }
    async urlContains(string) {
        return await this.js(`window.location.href.indexOf("${string}") >= 0`);
    }
    /**
     * Blocks until tab is done loading.
     * */
    async awaitLoad() {
        await this.attach();
        return await this.fsocket.notificationPromise(new PendingNotification("tabNavigated", (x) => { return x.state == "stop" && x.from == this.actor }));
    }
    async awaitElement(selector, maxDuration, startDelay = 5) {
        const start = new Date().getTime();
        const maxDelay = 800;

        let delay = Math.min(startDelay, maxDelay);
        while (!await this.js(`!!document.querySelector("${selector}")`)) {
            if (delay < maxDelay) {
                delay *= 2;
            }
            else {
                delay = maxDelay;
            }
            const duration = new Date().getTime() - start;
            if (duration + delay >= maxDuration) {
                return false;
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        return true;
    }
    async clickElement(selector, trueClickEvent = false) {
        if (trueClickEvent && false) {
            //function consoleClickAction() {
            //    const event = new MouseEvent("click");
            //}
        }
        else {
            await this.js(`document.querySelector("${selector}").click()`);
        }
        
    }
    /**
     * Evaluates script string and returns the result as received from server
     * @param {string} scriptString
     */
    async eval(scriptString) {
        await this.attach();
        return await this.send({ to: this.meta.consoleActor, type: "evaluateJS", text: scriptString });
    }
    /**
     * Evaluates the script, receives response and interprets it as value. Re-throws exceptions from client 
     * @param {any} scriptString
     * @param {boolean} useJsonTranfer if true, call will be wrapped in JSON.stringify and then unpacked on the client side
     */
    async js(scriptString, useJsonTranfer = false) {
        if (useJsonTranfer) {
            scriptString = "JSON.stringify((" + scriptString + "))";
        }
        const result = await this.eval(scriptString);
        if (result.exception) {
            throw new Error("[Remote Debugger] "+result.exceptionMessage);
        }
        if (useJsonTranfer) {
            return JSON.parse(result.result);
        }
        else {
            return processRemoteJSResult(result.result);
        }
    }

    async send(message) {
        return await this.fsocket.sendAndAwaitResponse(message);
    }
}

function processRemoteJSResult(objectInfo) {
    if (typeof objectInfo != "object") {
        return objectInfo;
    }
    else {
        if (objectInfo != null) {
            if (objectInfo.type == "undefined") {
                return;
            }
            else if (objectInfo.type == "object") {
                if (objectInfo.ownPropertyLength > 0) {
                    if (!objectInfo.preview) {
                        console.log("[Tab::js] BAD INFO", objectInfo);
                        return;
                    }
                    console.log("[Tab::js]", objectInfo.preview.ownProperties);
                    return reconstructObjectPreview(objectInfo.preview.ownProperties);
                }
                else {
                    return {};
                }
            }
        }
        else {
            return null;
        }
    }
}
/**
 * @typedef {Object} PropDef
 * @property {boolean} configurable
 * @property {boolean} enumerable
 * @property {boolean} writable
 * @property {?} value
 * 
 * @typedef {{[name:string]:PropDef}} ObjDefGroup
 * 
 * @param {{[name:string]:PropDef|ObjDefGroup}} obj
 */
function reconstructObjectPreview(obj, prevResult) {
    if (typeof obj == "undefined") {
        return;
    }
    const result = prevResult || {};
    for (let prop in obj) {
        const value = obj[prop];
        if (typeof value.enumerable == "boolean" && typeof value.value != "undefined") {
            result[prop] = processRemoteJSResult(value.value);
        }
    }
    return result;
}
module.exports = Tab;
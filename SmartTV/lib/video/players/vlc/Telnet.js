class TelnetOptions {
    constructor() {
        this.host = "127.0.0.1";
        this.port = "4212";

        this.loginPrompt = /login[: ]*$/i;
        /** @type {RegExp} Password/login prompt that the host is using. Can be a string or an instance of RegExp. Defaults to regex  **/
        this.passwordPrompt = /Password: /i;
    }
}
const net = require("net");


class Telnet {
    constructor() {
        /** @type {NodeJS.Socket} **/
        this.socket = null;

        this._exchangeId = 0;

        /** @type {{resolve:function(Buffer):void, promise:Promise}} **/
        this._pendingCommand = null;
    }
    /**
     * @param {TelnetOptions} options
     * @returns {Promise<NodeJS.Socket>}
     * */
    async connect(options) {
        if (this._connect == null) {
            this._connect = new Promise((resolve, reject) => {
                this.socket = net.connect(options.port, options.host, (err, x)=> {
                    if (err) {
                        this.socket.end();
                        this.socket.removeAllListeners();
                        this.socket = null;
                        reject(err);
                    }
                    else {
                        this.socket.on("data", this.dataReceived = this.dataReceived.bind(this));
                        resolve(this.socket);
                    }
                });
            });
        }
        return this._connect;
    }
    get ready() {
        return this.socket != null;
    }
    /**
     * @param {Buffer|string} data
     * @returns {Promise<String>}
     */
    async exec(data, responseMatch) {
        if (this.socket) {
            if (this._pendingCommand) {
                await this._pendingCommand;
            }

            const id = ((++this._exchangeId) + "").padStart(4, "0");

            if (this._pendingCommand) {
                console.log("TELNET[" + id + "] BLOCKED BY #" + this._pendingCommand.id);
                await this._pendingCommand;
            }

            if (data) {
                console.log("TELNET[" + id + "] >> " + printify(data + ""));
                this.socket.write(data);
            }
            else if (responseMatch instanceof RegExp) {
                console.log("TELNET[" + id + "] await " + responseMatch.source);
            }
            else {
                throw new Error("Must provide either data or response matcher (or both) for an exec call.")
            }
            const pending = this._pendingCommand = { id, partialData: "", responseMatch};

            this._pendingCommand.promise = new Promise((resolve, reject) => {
                if (pending.data) {
                    resolve(pending.data);
                }
                else {
                    pending.resolve = resolve;
                }
            });
            
            return pending.promise;
        }
        else {
            throw new Error("Telnet client not connected!");
        }
    }

    dataReceived(data) {
        if (this._pendingCommand) {
            console.log("TELNET[" + this._pendingCommand.id + "] << " + printify(data+""));
            let isAll = true;

            if (this._pendingCommand.responseMatch instanceof RegExp) {
                this._pendingCommand.partialData += data.toString();

                if (!this._pendingCommand.responseMatch.test(this._pendingCommand.partialData)) {
                    isAll = false;
                }
                else {
                    data = this._pendingCommand.partialData;
                }
            }

            if (isAll) {
                if (typeof this._pendingCommand.resolve == "function") {
                    this._pendingCommand.resolve(data.toString());
                }
                else {
                    this._pendingCommand.data = data.toString();
                }
                this._pendingCommand = null;
            }
        }
        else {
            console.log("TELNET[void] << " + data);
            // scrap any unawaited data
        }
    }
    /**
     * Sends data on the socket without requiring telnet negotiations.
     * 
     * @param {Buffer|string} data
     * @returns {Promise<Buffer>}
     * */
    async send() { }

    destroy() {
        if (this.socket) {
            this.socket.end();
            this.socket.removeAllListeners();
        }
    }


}
function printify(inputString) {
    return inputString.replace(/[\s]/g, function (v) {
        switch (v) {
            case "\t": return "\\t";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\0": return "\\0";
            default: return v;
        }
    });
}
module.exports = Telnet;
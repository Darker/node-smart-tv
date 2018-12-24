const EventEmitter = require("eventemitter2");

/**
 * @typedef {Object} RpcRequest
 * @property {string} name
 * @property {[]} arguments
 * @property {number} transactionID
 */

/**
 * @typedef {Object} RpcResponse
 * @property {string} name
 * @property {any} retval
 * @property {string} error
 * @property {number} transactionID
 */

class Client extends EventEmitter {
    /**
     * 
     * @param {SocketIO.Socket} io
     */
    constructor(io) {
        super();
        this.io = io;
        this.transactionID = 0;
        /** @type {{[name:string]:function({}):{}}} **/
        this.rpcHandlers = {};

        const t = arguments;

        this.io.on("io-rpc", (data) => {
            console.log("Local RPC call: ", data);
            this.call_local_rpc(data);
        });
    }
    send_rpc(name, args, timeout) {
        const cleanup = (timeoutID, listener) => {
            clearTimeout(timeoutID);
            this.io.removeListener(name, listener);
        };
        return new Promise((resolve, reject) => {
            /** @type {RpcRequest} **/
            const data = { arguments: args };
            const id = this.transactionID++;
            data.transactionID = id;
            var timeoutID = -1;
            const listener = (result) => {
                if (result.transactionID == id) {
                    cleanup(timeoutID, listener);
                    if (result.error) {
                        reject(new Error(result.error));
                    }
                    else {
                        resolve(result.retval);
                    }
                }
            };
            this.io.on(name, listener);
            if (typeof timeout == "number" && timeout > 0) {
                timeoutID = setTimeout(() => {
                    cleanup(timeoutID, listener);
                    reject(new Error("RPC " + name + " timed out!"));
                }, timeout);
            };
            data.name = name;
            this.io.emit("io-rpc", data);
        });
    }
    /**
     * 
     * @param {string} name
     * @param {number} id
     * @param {any} retval
     * @param {Error} error
     */
    reply_rpc(name, id, retval, error) {
        /** @type {RpcResponse} **/
        const data = { transactionID: id, name: name };
        if (error)
            data.error = error.message;
        else
            data.retval = retval;
        this.io.emit(name, data);
    }
    /**
     * 
     * @param {RpcRequest} data
     */
    async call_local_rpc(data) {
        if (typeof this.rpcHandlers[data.name] == "function") {
            try {
                var val = this.rpcHandlers[data.name].apply(this, data.arguments || []);
                while (val instanceof Promise) {
                    val = await val;
                }
                this.reply_rpc(data.name, data.transactionID, val);
            }
            catch (e) {
                this.reply_rpc(data.name, data.transactionID, null, e);
            }
        }
        else {
            this.reply_rpc(data.name, data.transactionID, null, new Error("Undefined RPC " + data.name));
        }
    }
    registerLocalRPC(name, handler) {
        this.rpcHandlers[name] = handler;
    }
    /**
     * Create function that, when called, will be executed on the remote side
     * @param {string} name
     * @param {number} timeout in milliseconds, if larger than 0 the call will throw an error after timeout is exceeded
     */
    registerRemoteRPC(name, timeout = -1) {
        this[name] = async function () {
            const args = [];
            args.push.apply(args, arguments);
            console.log("Sending RPC request: ", name, args);
            return await this.send_rpc(name, args, timeout);
        }.bind(this);
    }
    receivedData(name, data) {
        /// override this
    }
}
module.exports = Client;
/**
 * @typedef {import("net").Socket} Socket
 * @typedef {import("net").SocketConnectOpts} SocketConnectOpts
 * */

/**
 * 
 * @param {Socket} socket
 * @param {SocketConnectOpts} options
 */
function promiseSocketConnect(socket, options) {
    return new Promise(function (resolve, reject) {
        socket.connect(options, function (err) {
            if (err) {
                reject(new Error(err));
            }
            else {
                resolve();
            }
        });
    });
}

module.exports = promiseSocketConnect;
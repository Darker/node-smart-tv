
/**
 * @typedef {import("events")} EventEmitter
 * */

/**
 * @typedef {{[sourceName:string]:string}} EventNameMap
 */


/**
 * 
 * @param {EventEmitter} eventSource
 * @param {EventNameMap} eventMap
 * @param {EventEmitter} eventTarget
 */
function forwardEventsAs(eventSource, eventMap, eventTarget) {
    for (let sourceName in eventMap) {
        if (eventMap.hasOwnProperty(sourceName)) {
            const targetName = eventMap[sourceName];
            eventSource.on(sourceName, function () {
                const args = [...arguments];
                args.unshift(targetName);
                eventTarget.emit.apply(eventTarget, args);
            });
        }
    }
}
module.exports = forwardEventsAs;
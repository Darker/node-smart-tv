const PromiseCriticalSection = require("./lib/util/PromiseCriticalSection");

/**
 * 
 * @param {number} timeout
 */
function timeout(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}

let number = 0;
let lock = new PromiseCriticalSection();
async function lockedCounter(threadId) {
    console.log(`[${threadId}] waiting on lock`);
    await lock.lock();
    console.log(`[${threadId}] Started counting`);
    for (let i = 0; i < 4; ++i) {
        await timeout(500);
        number++;
        console.log(`[${threadId}] i=${i} number=${number}`);
    }
    await timeout(100);
    console.log(`[${threadId}] Done`);
    number = 0;
    lock.unlock();
}

(async () => {
    const pro3 = Promise.all([lockedCounter("A"), lockedCounter("B"), lockedCounter("C")]);
    await timeout(2000);
    const pro2 = Promise.all([lockedCounter("X"), lockedCounter("Y")]);
    await pro3;
    await pro2;
})();
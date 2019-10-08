//mareda-util
/**
 * @description Finds max value that is maximal according to the max calculator given in second argument
 * @template T
 * @param {Iterable<T>|T[]} iterable collection of items to search in
 * @param {function(T):number} calculator function that translates value to number
 * @param {boolean} returnIndex true if index should be returned instead of entry
 * @returns {T|number} Index of the max item or -1
 */
function findMaxFunction(iterable, calculator, returnIndex = false, reverse = false) {
    if (typeof calculator !== "function") {
        throw new Error("findMaxIndex: Calculator must be given and must be function!");
    }
    let max = -Infinity;
    let maxItemIndex = -1;
    let maxItem = null;
    const multiplier = reverse ? -1 : 1;
    let index = 0;
    for (const item of iterable) {
        const itemValue = multiplier * calculator(item);
        if (typeof itemValue !== "number") {
            throw new Error("findMaxIndex: Calculator callback must return number!");
        }
        if (max < itemValue) {
            max = itemValue;
            maxItemIndex = index;
            maxItem = item;
        }
        ++index;
    }
    return returnIndex ? maxItemIndex : maxItem;
}
/**
 * @description Finds max value that is maximal according to the max calculator given in second argument
 * @template T
 * @param {Iterable<T>|T[]} iterable collection of items to search in
 * @param {function(T):number} calculator function that translates value to number
 * @returns {T|null} max item or null
 */
function findMax(iterable, calculator) {
    return findMaxFunction(iterable, calculator, false, false);
}

module.exports = { findMax, findMaxFunction };
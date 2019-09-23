// mareda-util
/**
 * Returns iterator over items that were removed from the source array based on the predicate
 * 
 * @template T
 * @param {T[]} data
 * @param {function(T):boolean} predicate
 * @returns {IterableIterator<T>}
 * 
 * */
function* spliced(data, predicate) {
    for (let i = 0, l = data.length; i < l; ++i) {
        const item = data[i];
        if (predicate(item)) {
            data.splice(i);
            i--;
            l--;
            yield item;
        }
    }
}
module.exports = spliced;
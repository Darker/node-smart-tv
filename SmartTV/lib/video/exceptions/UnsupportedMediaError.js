
class UnsupportedMediaError extends Error {
    /**
     * 
     * @param {any} param0
     */
    constructor({ message, video }) {
        super(message);

    }
}
module.exports = UnsupportedMediaError;
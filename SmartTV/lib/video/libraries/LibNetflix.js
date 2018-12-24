const MediaLibrary = require("../MediaLibrary");

class LibNetflix extends MediaLibrary {
    constructor(name, password, uniqueID="netflix") {
        super(uniqueID);

    }
}
module.exports = LibNetflix;
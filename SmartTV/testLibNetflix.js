const LibNetflix = require("./lib/video/libraries/LibNetflix");

(async () => {
    const lib = new LibNetflix();
    await lib.searchForVideos();


})();
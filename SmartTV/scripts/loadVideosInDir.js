const LibLocalFilesystem = require("../lib/video/libraries/LibLocalFilesystem");

(async () => {
    const lib = new LibLocalFilesystem(["D:\\odpad\\Terry.Pratchetts.Going.Postal.2010.1080p.BluRay.H264.AAC-RARBG"]);
    console.log(await lib.searchForVideos());
    console.log("End");
})();
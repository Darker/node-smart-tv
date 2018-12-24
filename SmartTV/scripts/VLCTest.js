const LibLocalFilesystem = require("../lib/video/libraries/LibLocalFilesystem");
const VLCMediaPlayer = require("../lib/video/players/vlc/VLCMediaPlayer");
const FSVideo = require("../lib/video/videotypes/FSVideo");

const vlcpath = "C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe";
const net = require("net");
const videopath = "D:\\odpad\\Terry.Pratchetts.Going.Postal.2010.1080p.BluRay.H264.AAC-RARBG\\Terry.Pratchetts.Going.Postal.2010.1080p.BluRay.H264.AAC-RARBG.mp4";
//net.Socket.prototype.oldwrite = net.Socket.prototype.write;
//net.Socket.prototype.write = function () {
//    console.log("Socket::write", arguments);
//    this.oldwrite.apply(this, arguments);
//};

function Timeout(t) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, t);
    });
}

(async () => {
    const player = new VLCMediaPlayer(vlcpath);
    try {
        await player.preparePlayer();
        await player.openMedia(new FSVideo(videopath));
    }
    catch (e) {
        console.log("Failure: ",e.stack);
    }
    while (true) {
        console.log("Time: ", await player.getCurrentTime());
        await Timeout(1000);
    }

    console.log("End");
})();
import LocalClient from "./net/LocalClient.js";
import PlayerControls from "./gui/controls/PlayerControls.js";
import Library from "./gui/controls/Library.js";
import Libraries from "./gui/controls/Libraries.js";

function logError(error) {
    console.warn("Error ", error.message, "\n", error.stack);
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/error");
        // @TODO add useful info
        xhr.send(JSON.stringify([{
            message: error.message,
            userAgent: navigator.userAgent,
            stack: error.stack,
            fatal: true
        }]));
    }
    catch (exception) {
        console.error("Failed to report error to the server. If you see this message please tell someone.")
    }
}
window.addEventListener("error", function (error) {
    logError(error.error);
});

const controls = new PlayerControls();
const libraries = new Libraries();


function onIo(callback) {
    if (typeof io == "function") {
        callback();
    }
    else {
        window.addEventListener("io-ready", callback);
    }
};

onIo(() => {
    const SOCKET = io();
    const CLIENT = new LocalClient(SOCKET);

    controls.on("toggle", () => {
        CLIENT.playerToggle();
    });
    controls.on("stop", () => {
        CLIENT.playerStop();
    })
    CLIENT.on("library.add", (videos) => {
        libraries.videosAdded(videos);
    });
    CLIENT.on("library.metadata", (metadata) => {
        libraries.setLibraryMetadata(metadata);
    });
    libraries.on("video.click", (data) => {
        CLIENT.playerPlay(data.uniqueID);
    });
});

document.querySelector("#main").appendChild(controls.main);
document.querySelector("#main").appendChild(libraries.main);

window.controls = controls;
window.libraries = libraries;
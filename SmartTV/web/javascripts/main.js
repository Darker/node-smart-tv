﻿import LocalClient from "./net/LocalClient.js";
import PlayerControls from "./gui/controls/PlayerControls.js";
import Library from "./gui/controls/Library.js";
import Libraries from "./gui/controls/Libraries.js";
import MainMenu from "./gui/menu/MainMenu.js";
import MenuItem from "./gui/menu/MenuItem.js";
import TouchPad from "./gui/controls/TouchPad.js";
import MenuItemScreen from "./gui/menu/MenuItemScreen.js";

/**
 * @typedef {import("./gui/Events.js").TimeupdateEvent} TimeupdateEvent
 * */

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
const menu = new MainMenu();
libraries.libraryMenu = menu.content;

const touchPad = new TouchPad();
menu.content.addItem(new MenuItemScreen(touchPad, "Touch pad"));


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
    CLIENT.io.on("player.playing", (state) => {
        controls.playing = typeof state == "object"?state.playing:state;
    });

    CLIENT.io.on("player.timeupdate",
        /**
         * @param {TimeupdateEvent} state
         * */
        (state) => {
            console.log("Timeupdate: ", state);
            controls.progress = (state.currentTime / state.duration) * 100;
        }
    );
    touchPad.on("move.delta", (vector) => {
        CLIENT.io.emit("mouse.move.delta", vector);
    });
    touchPad.on("button", (event) => {
        CLIENT.io.emit("mouse.button", event);
    });
});

document.querySelector("#main").appendChild(controls.main);
document.querySelector("#main").appendChild(libraries.main);
document.querySelector("#main").appendChild(touchPad.main);
document.querySelector("#menu").appendChild(menu.main);


window.controls = controls;
window.libraries = libraries;
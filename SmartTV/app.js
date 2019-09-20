'use strict';

/**
 * @typedef Object ServerSettings
 * @prop {string} vlc_path
 */



const PORT = process.env.PORT || 3000;



var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const RemoteClient = require("./lib/net/RemoteClient");
const forwardEvents = require("./lib/events/forwardEvents");

const SETTINGS = require("./lib/config/configLoader")();

const SmartTV = require("./lib/tv/SmartTV");
const VLCMediaPlayer = require("./lib/video/players/vlc/VLCMediaPlayer");
const BrowserPlayer = require("./lib/video/players/browser/BrowserPlayer");
const LibLocalFilesystem = require("./lib/video/libraries/LibLocalFilesystem");
const LibRemovableDrives = require("./lib/video/libraries/LibRemovableDrives");
const MouseControl = require("./lib/control/MouseControl");

var app = express();
var createServer = require('http').createServer;

const server = createServer(function (req, res) {
    return app(req, res);
});
// view engine setup


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'web')));

//app.use('/', routes);

// catch 404 and forward to error handler
//app.use(function (req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});

// error handlers

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
//    app.use(function (err, req, res, next) {
//        res.status(err.status || 500);
//        res.render('error', {
//            message: err.message,
//            error: err
//        });
//    });
//}

// production error handler
// no stacktraces leaked to user
//app.use(function (err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: {}
//    });
//});
const FIREFOX_PATH = "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe";
// smart TV init
const TV = new SmartTV();

// add media library
const libraryLocFs = new LibLocalFilesystem(["D:\\odpad\\video"]);
libraryLocFs.label = "Local files";
const libraryUSB = new LibRemovableDrives();
libraryUSB.label = "Removable media";
TV.libraries.push(libraryLocFs);
TV.libraries.push(libraryUSB);
// add a player
TV.addPlayer(new VLCMediaPlayer("C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe"));
TV.addPlayer(new BrowserPlayer(FIREFOX_PATH, 6462));

TV.on("player.playing", (state) => {
    toAllClients("player.playing", state);
});
TV.on("player.timeupdate", (state) => {
    toAllClients("player.timeupdate", state);
});
TV.startLoadingMedia();

const mouseControl = new MouseControl();

var io = require('socket.io')(server);

// session and socket.io session:
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const sessionStore = new MemoryStore({
    checkPeriod: 5 * 60 * 60 * 1000
});
const SESSION_SECRET = "napalm";
const sessionMiddleware = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { secure: false, httpOnly: false },
    name: "delet dis"
});
app.use(sessionMiddleware);

io.use(require("express-socket.io-session")(sessionMiddleware, {
    autoSave: true
}));
/** @type {RemoteClient[]} **/
const CLIENTS = [];

function toAllClients(eventName, ...args) {
    args.unshift(eventName);
    for (const client of CLIENTS) {
        client.io.emit.apply(client.io, args);
    }
}

io.on('connection', function (socket) {
    console.log('a user connected', socket.handshake.session.logins);
    const client = new RemoteClient(socket, TV);
    socket.on("mouse.move.delta", (vector) => {
        mouseControl.moveDelta(vector);
    });
    socket.on("mouse.button", (event) => {
        mouseControl.buttonAction(event);
    });
    client.all = CLIENTS;




    CLIENTS.push(client);
    io.emit("clients.online", CLIENTS.length);
    client.on("destroyMe", function () {
        const index = CLIENTS.indexOf(client);
        if (index >= 0) {
            CLIENTS.splice(index, 1);
            console.log("Client removed, remaining clients: ", CLIENTS.length);
        }
        io.emit("clients.online", CLIENTS.length);
    });

    //client.serverConfig = SETTINGS;
    if (socket.handshake.session.logins) {
        socket.handshake.session.logins++;
    }
    else
        socket.handshake.session.logins = 1;
    socket.handshake.session.save();
});



app.set('port', PORT);

//var server = app.listen(app.get('port'), function () {
//    debug('Express server listening on port ' + server.address().port);
//});

server.listen(PORT, function () {
    console.log('listening on http://localhost:' + PORT);
});

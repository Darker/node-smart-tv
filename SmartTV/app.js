'use strict';
const PORT = process.env.PORT || 3000;

var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const RemoteClient = require("./lib/net/RemoteClient");

const SETTINGS = require("./lib/config/configLoader")();

const SmartTV = require("./lib/tv/SmartTV");
const VLCMediaPlayer = require("./lib/video/players/vlc/VLCMediaPlayer");
const LibLocalFilesystem = require("./lib/video/libraries/LibLocalFilesystem");
const LibRemovableDrives = require("./lib/video/libraries/LibRemovableDrives");

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

// smart TV init
const TV = new SmartTV();
// add media library
TV.libraries.push(new LibLocalFilesystem(["D:\\odpad\\video"]));
TV.libraries.push(new LibRemovableDrives());
// add a player
TV.players.push(new VLCMediaPlayer("C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe"));

TV.startLoadingMedia();

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

const CLIENTS = [];

io.on('connection', function (socket) {
    console.log('a user connected', socket.handshake.session.logins);
    const client = new RemoteClient(socket,TV);
    client.all = CLIENTS;

    
    client.libraryAdd([...TV.allVideoStructs()]);

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
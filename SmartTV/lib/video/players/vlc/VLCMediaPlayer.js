const Player = require("../../Player");
const child_process = require("child_process");

const Telnet = require("./Telnet");

const FSVideo = require("../../videotypes/FSVideo");


/**
 * @typedef {import("child_process").ChildProcess} ChildProcess
 * */
/**
 * @typedef {import("./Telnet")} Telnet
 * */



class VLCMediaPlayer extends Player {
    constructor(executablePath="vlc", port = 4212) {
        super();
        this.execPath = executablePath;
        this.port = port;

        /** @type {ChildProcess} **/
        this.vlc = null;

        this.password = "test";

        this.telnetConfig = {
            host: "127.0.0.1",
            port: this.port,
            loginPrompt: /Password:/i,
            failedLoginMatch: /Wrong\spassword/i,
            username: "",
            password: "test",
            debug: true,
            negotiationMandatory: false
        };
        /** @type {Telnet} **/
        this.telnet = new Telnet();

        this.playing = false;
    }
    canPlay(video) {
        return video instanceof FSVideo;
    }

    /**
     * 
     * @param {FSVideo} video
     */
    async openMedia(video) {
        await this.preparePlayer();
        await this.cmd("stop");
        await this.cmd("clear");
        await this.cmd("add " + video.fspath);
        if (!this.autoplay) {
            await this.cmd("pause");
        }
        // vlc starts playing automatically
        this.playing = true;
    }

    async preparePlayer() {
        if (this.vlc == null) {
            this.vlc = child_process.spawn(this.execPath, ["-I", "telnet", "--telnet-password", this.password, "-f"], {});
            await this.telnet.connect(this.telnetConfig);
            await this.telnet.exec(null, /Password:/i);
            console.log("Login result: ", await this.telnet.exec(this.password + "\r\n", /Welcome,\sMaster/i));
        }
        return this.vlc;
    }

    /**
     * Starts playing current media. Shold never throw.
     * Return false on failure.
     * */
    async play() {
        if (this.telnet.ready && !this.playing) {
            await this.cmd("play");
            this.playing = true;
            return true;
        }
        return false;
    }
    async pause() {
        if (this.telnet.ready && this.playing) {
            await this.cmd("pause");
            this.playing = false;
            return true;
        }
        return false;
    }
    async togglePlay() {
        if (this.telnet.ready) {
            await this.cmd("pause");
            this.playing = !this.playing;
            return true;
        }
        return false;
    }

    async stop() {
        if (this.telnet.ready && this.playing) {
            try {
                await this.cmd("stop");
            }
            catch (e) {
                console.error(e.stack);
            }
        }
        this.playing = false;
    }

    async isPlaying() {
        return this.playing;
    }
    /**
     * Sets volume of the player.
     * @param {any} number value between 0 and 1, percentage of volume
     * @returns {number} final volume value, also between 0 and 1
     */
    async setVolume(number) {
        if (this.telnet.ready) {
            await this.cmd("volume "+(number*400));
        }
        return NaN;
    }

    /**
     * Returns current audio time in seconds.
     * */
    async getCurrentTime() {
        if (this.telnet.ready) {
            const time = await this.cmd("get_time", /[0-9]+/);
            const timeMatch = time.match(/[0-9]+/);
            if(timeMatch)
                return parseFloat(timeMatch[0]);
        }
        return NaN;
    }
    /**
     * Seek at a time in seconds. Fraction of seconds may be supported
     * but is not required.
     * @param {any} seconds
     */
    async seek(seconds) { return false; }

    async cmd(cmd, regex) {
        return await this.telnet.exec(cmd+"\r\n", regex);
    }
}
module.exports = VLCMediaPlayer;

//Welcome, Master
//> +----[ VLM commands ]
//|help
//|    Commands Syntax:
//|        new (name) vod|broadcast|schedule [properties]
//|        setup (name) (properties)
//|        show [(name)|media|schedule]
//|        del (name)|all|media|schedule
//|        control (name) [instance_name] (command)
//|        save (config_file)
//|        export
//|        load (config_file)
//|    Media Proprieties Syntax:
//|        input (input_name)
//|        inputdel (input_name)|all
//|        inputdeln input_number
//|        output (output_name)
//|        option (option_name)[=value]
//|        enabled|disabled
//|        loop|unloop (broadcast only)
//|        mux (mux_name)
//|    Schedule Proprieties Syntax:
//|        enabled|disabled
//|        append (command_until_rest_of_the_line)
//|        date (year)/(month)/(day)-(hour):(minutes):(seconds)|now
//|        period (years_aka_12_months)/(months_aka_30_days)/(days)-(hours):(mi
//es):(seconds)
//|        repeat (number_of_repetitions)
//|    Control Commands Syntax:
//|        play [input_number]
//|        pause
//|        stop
//|        seek [+-](percentage) | [+-](seconds)s | [+-](milliseconds)ms
//+----[ CLI commands ]
//| add XYZ  . . . . . . . . . . . . . . . . . . . . add XYZ to playlist
//| enqueue XYZ  . . . . . . . . . . . . . . . . . queue XYZ to playlist
//| playlist . . . . . . . . . . . . . .show items currently in playlist
//| search [string]  . .  search for items in playlist (or reset search)
//| delete [X] . . . . . . . . . . . . . . . . delete item X in playlist
//| move [X][Y]  . . . . . . . . . . . . move item X in playlist after Y
//| sort key . . . . . . . . . . . . . . . . . . . . . sort the playlist
//| sd [sd]  . . . . . . . . . . . . . show services discovery or toggle
//| play . . . . . . . . . . . . . . . . . . . . . . . . . . play stream
//| stop . . . . . . . . . . . . . . . . . . . . . . . . . . stop stream
//| next . . . . . . . . . . . . . . . . . . . . . .  next playlist item
//| prev . . . . . . . . . . . . . . . . . . . .  previous playlist item
//| goto, gotoitem . . . . . . . . . . . . . . . . . .goto item at index
//| repeat [on|off]  . . . . . . . . . . . . . .  toggle playlist repeat
//| loop [on|off]  . . . . . . . . . . . . . . . .  toggle playlist loop
//| random [on|off]  . . . . . . . . . . . . . .  toggle playlist random
//| clear  . . . . . . . . . . . . . . . . . . . . . .clear the playlist
//| status . . . . . . . . . . . . . . . . . . . current playlist status
//| title [X]  . . . . . . . . . . . . . . set/get title in current item
//| title_n  . . . . . . . . . . . . . . . .  next title in current item
//| title_p  . . . . . . . . . . . . . .  previous title in current item
//| chapter [X]  . . . . . . . . . . . . set/get chapter in current item
//| chapter_n  . . . . . . . . . . . . . .  next chapter in current item
//| chapter_p  . . . . . . . . . . . .  previous chapter in current item
//|
//| seek X . . . . . . . . . . . seek in seconds, for instance `seek 12'
//| pause  . . . . . . . . . . . . . . . . . . . . . . . .  toggle pause
//| fastforward  . . . . . . . . . . . . . . . . . . set to maximum rate
//| rewind . . . . . . . . . . . . . . . . . . . . . set to minimum rate
//| faster . . . . . . . . . . . . . . . . . .  faster playing of stream
//| slower . . . . . . . . . . . . . . . . . .  slower playing of stream
//| normal . . . . . . . . . . . . . . . . . .  normal playing of stream
//| rate [playback rate] . . . . . . . . . .  set playback rate to value
//| frame  . . . . . . . . . . . . . . . . . . . . . play frame by frame
//| fullscreen, f, F [on|off]  . . . . . . . . . . . . toggle fullscreen
//| info . . . . . . . . . . . . . .information about the current stream

//    > +----[ Stream 0 ]
//    |
//    | Display resolution: 1920x1080
//    | Type: Video
//    | Frame rate: 25
//    | Decoded format: Planar 4:2:0 YUV
//    | Codec: H264 - MPEG-4 AVC (part 10) (avc1)
//    | Resolution: 1920x1090
//    |
//    +----[ Stream 1 ]
//    |
//    | Type: Audio
//    | Channels: 3F2R/LFE
//    | Sample rate: 48000 Hz
//    | Language: English
//    | Codec: MPEG AAC Audio (mp4a)
//    |
//    +----[ end of stream info ]

//| stats  . . . . . . . . . . . . . . . .  show statistical information
//| get_time . . . . . . . . . .seconds elapsed since stream's beginning
//   > 64


//| is_playing . . . . . . . . . . . .  1 if a stream plays, 0 otherwise
//| get_title  . . . . . . . . . . . . . the title of the current stream
//| get_length . . . . . . . . . . . .  the length of the current stream
//|
//| volume [X] . . . . . . . . . . . . . . . . . .  set/get audio volume
//| volup [X]  . . . . . . . . . . . . . . . .raise audio volume X steps
//| voldown [X]  . . . . . . . . . . . . . .  lower audio volume X steps
//| achan [X]  . . . . . . . . . . . .  set/get stereo audio output mode
//| atrack [X] . . . . . . . . . . . . . . . . . . . set/get audio track
//| vtrack [X] . . . . . . . . . . . . . . . . . . . set/get video track
//| vratio [X] . . . . . . . . . . . . . . . .set/get video aspect ratio
//| vcrop, crop [X]  . . . . . . . . . . . . . . . .  set/get video crop
//| vzoom, zoom [X]  . . . . . . . . . . . . . . . .  set/get video zoom
//| vdeinterlace [X] . . . . . . . . . . . . . set/get video deinterlace
//| vdeinterlace_mode [X]  . . . . . . . .set/get video deinterlace mode
//| snapshot . . . . . . . . . . . . . . . . . . . . take video snapshot
//| strack [X] . . . . . . . . . . . . . . . . . .set/get subtitle track
//|
//| vlm  . . . . . . . . . . . . . . . . . . . . . . . . . .load the VLM
//| description  . . . . . . . . . . . . . . . . . .describe this module
//| help, ? [pattern]  . . . . . . . . . . . . . . . . . .a help message
//| longhelp [pattern] . . . . . . . . . . . . . . a longer help message
//| lock . . . . . . . . . . . . . . . . . . . .  lock the telnet prompt
//| logout . . . . . . . . . . . . . .  exit (if in a socket connection)
//| quit . . . . . . . .  quit VLC (or logout if in a socket connection)
//| shutdown . . . . . . . . . . . . . . . . . . . . . . . .shutdown VLC
//+----[ end of help ]
//>



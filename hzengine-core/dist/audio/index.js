"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audio = void 0;
class Audio {
    constructor(_core) {
        this._core = _core;
        this._channels = {};
        this._channels["default"] = new Audio.Channel();
    }
    get channels() {
        return this._channels;
    }
    createChannel(name) {
        if (this._channels[name])
            throw "Channel Already Exist";
        return this._channels[name] = new Audio.Channel();
    }
}
exports.Audio = Audio;
(function (Audio) {
    class Channel {
        constructor() {
            this.mode = Channel.Mode.PlayInOrder;
            this.status = Channel.Status.Stopped;
            this.playbackList = [];
        }
        push(item) { }
        play() { }
        pause() { }
        /**
         * 停止并清空队列
         */
        stop() { }
    }
    Audio.Channel = Channel;
    (function (Channel) {
        let Mode;
        (function (Mode) {
            Mode[Mode["PlayInOrder"] = 0] = "PlayInOrder";
            Mode[Mode["PlayInOrderRepeat"] = 1] = "PlayInOrderRepeat";
            Mode[Mode["Random"] = 2] = "Random";
            Mode[Mode["RandomRepeat"] = 3] = "RandomRepeat";
        })(Mode = Channel.Mode || (Channel.Mode = {}));
        let Status;
        (function (Status) {
            Status[Status["Pending"] = 0] = "Pending";
            Status[Status["Stopped"] = 1] = "Stopped";
            Status[Status["Playing"] = 2] = "Playing";
            Status[Status["Error"] = 3] = "Error";
        })(Status = Channel.Status || (Channel.Status = {}));
    })(Channel = Audio.Channel || (Audio.Channel = {}));
})(Audio || (exports.Audio = Audio = {}));

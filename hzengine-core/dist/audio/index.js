"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Audio__channels_accessor_storage;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audio = void 0;
class Audio {
    constructor(_core) {
        this._core = _core;
        _Audio__channels_accessor_storage.set(this, {});
        this._channels["default"] = new Audio.Channel();
    }
    // @ArchiveStateAccessor("audio.channels")
    get _channels() { return __classPrivateFieldGet(this, _Audio__channels_accessor_storage, "f"); }
    set _channels(value) { __classPrivateFieldSet(this, _Audio__channels_accessor_storage, value, "f"); }
    get channels() {
        return this._channels;
    }
    createChannel(name) {
        if (this._channels[name])
            throw "Channel Already Exist";
        return (this._channels[name] = new Audio.Channel());
    }
}
exports.Audio = Audio;
_Audio__channels_accessor_storage = new WeakMap();
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

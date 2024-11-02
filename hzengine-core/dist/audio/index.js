"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audio = void 0;
/// <reference path="./zos_media.d.ts" />
const decorator_1 = require("../storage/decorator");
const media_1 = require("@zos/media");
let Audio = (() => {
    var _a, _Audio__channels_accessor_storage;
    let __channels_decorators;
    let __channels_initializers = [];
    let __channels_extraInitializers = [];
    return _a = class Audio {
            constructor(_core) {
                this._core = _core;
                _Audio__channels_accessor_storage.set(this, __runInitializers(this, __channels_initializers, {}));
                __runInitializers(this, __channels_extraInitializers);
                this._core = _core;
                this._channels["audio"] = new _a.Channel(this);
            }
            get _channels() { return __classPrivateFieldGet(this, _Audio__channels_accessor_storage, "f"); }
            set _channels(value) { __classPrivateFieldSet(this, _Audio__channels_accessor_storage, value, "f"); }
            get channels() {
                return this._channels;
            }
            createChannel(name) {
                // TODO support more audio channels
                if (Object.getOwnPropertyNames(this._channels).length > 0)
                    throw "Can't create more than one audio channel on ZeppOS";
                if (this._channels[name])
                    throw "Channel Already Exist";
                return (this._channels[name] = new _a.Channel(this));
            }
        },
        _Audio__channels_accessor_storage = new WeakMap(),
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __channels_decorators = [(0, decorator_1.CustomSave)("audio.channels", function (channels) {
                    let res = {};
                    for (let key in channels) {
                        res[key] = channels[key].serialize();
                    }
                    return res;
                }, function (serialized) {
                    // clear exist channels
                    for (let key in this._channels) {
                        this._channels[key].stop();
                    }
                    let res = {};
                    for (let key in serialized) {
                        res[key] = Audio.Channel.deserialize(this, serialized[key]);
                    }
                    return res;
                })];
            __esDecorate(_a, null, __channels_decorators, { kind: "accessor", name: "_channels", static: false, private: false, access: { has: obj => "_channels" in obj, get: obj => obj._channels, set: (obj, value) => { obj._channels = value; } }, metadata: _metadata }, __channels_initializers, __channels_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a._hmPlayer = (0, media_1.create)(media_1.id.PLAYER),
        _a;
})();
exports.Audio = Audio;
(function (Audio) {
    class Channel {
        // platform specific
        // universal
        constructor(_audio) {
            this._audio = _audio;
            this.mode = Channel.Mode.PlayInOrder;
            this.status = Channel.Status.Stopped;
            this._playbackList = [];
            this._nowIndex = null;
            this.currentInfo = null;
            Audio._hmPlayer.addEventListener(Audio._hmPlayer.event.PREPARE, (res) => this._onPrepared(res));
            Audio._hmPlayer.addEventListener(Audio._hmPlayer.event.COMPLETE, () => {
                this._onCompleted();
            });
        }
        push(item) {
            this._playbackList.push(item);
        }
        play() {
            if (this.status !== Channel.Status.Stopped)
                return;
            this._playNext();
        }
        pause() {
            if (this.status !== Channel.Status.Playing)
                return;
            Audio._hmPlayer.stop();
            this.status = Channel.Status.Stopped;
        }
        /**
         * 停止并清空队列
         */
        stop() {
            if (this.status !== Channel.Status.Playing)
                return;
            this._audio._core.debug.log("audio channel stop");
            Audio._hmPlayer.stop();
            this._playbackList = [];
            this.currentInfo = null;
            this._nowIndex = null;
            this.status = Channel.Status.Stopped;
        }
        serialize() {
            return {
                mode: this.mode,
                status: this.status,
                playbackList: this._playbackList,
                nowIndex: this._nowIndex,
            };
        }
        static deserialize(audio, data) {
            let channel = new Channel(audio);
            channel.mode = data.mode;
            channel.status = data.status;
            channel._playbackList = data.playbackList;
            channel._nowIndex = data.nowIndex;
            if (channel.status === Channel.Status.Playing)
                channel._playNext();
            return channel;
        }
        _onPrepared(result) {
            var _a, _b;
            if (result) {
                let mediaInfo = Audio._hmPlayer.getMediaInfo();
                this.currentInfo = {
                    // placeholder
                    artist: (_a = mediaInfo.artist) !== null && _a !== void 0 ? _a : "未知",
                    title: (_b = mediaInfo.title) !== null && _b !== void 0 ? _b : "未知",
                    duration: mediaInfo.duration,
                };
                console.log("=== prepare succeed ===");
                Audio._hmPlayer.start();
            }
            else {
                console.log("=== prepare fail ===");
                this.status = Channel.Status.Error;
                Audio._hmPlayer.release();
            }
        }
        _onCompleted() {
            // update playback list
            if (this.mode === Channel.Mode.PlayInOrder) {
                this._playbackList.shift();
                if (this._playbackList.length > 0)
                    this._nowIndex = 0;
                else
                    this._nowIndex = null;
            }
            else if (this.mode === Channel.Mode.PlayInOrderRepeat) {
                if (this._playbackList.length > 0) {
                    if (this._nowIndex === null)
                        this._nowIndex = 0;
                    this._nowIndex = (this._nowIndex + 1) % this._playbackList.length;
                }
                else
                    this._nowIndex = null;
            }
            this._playNext();
        }
        /**
         * Play the next item in the playback list. If there are no items in the
         * playback list, set the channel status to Stopped and return.
         * @private
         */
        _playNext() {
            if (this._playbackList.length === 0) {
                this._nowIndex = null;
                this.status = Channel.Status.Stopped;
                return;
            }
            if (this.mode === Channel.Mode.PlayInOrder) {
                if (this._nowIndex === null)
                    this._nowIndex = 0;
                // otherwise onCompleted will set _nowIndex to next index
            }
            else if (this.mode === Channel.Mode.PlayInOrderRepeat) {
                if (this._nowIndex === null)
                    this._nowIndex = 0;
                // otherwise onCompleted will set _nowIndex to next index
            }
            Audio._hmPlayer.setSource(Audio._hmPlayer.source.FILE, {
                file: this._playbackList[this._nowIndex].path,
            });
            Audio._hmPlayer.prepare();
            this.status = Channel.Status.Playing;
        }
    }
    Audio.Channel = Channel;
    (function (Channel) {
        let Mode;
        (function (Mode) {
            Mode[Mode["PlayInOrder"] = 0] = "PlayInOrder";
            Mode[Mode["PlayInOrderRepeat"] = 1] = "PlayInOrderRepeat";
        })(Mode = Channel.Mode || (Channel.Mode = {}));
        let Status;
        (function (Status) {
            Status[Status["Stopped"] = 0] = "Stopped";
            Status[Status["Playing"] = 1] = "Playing";
            Status[Status["Error"] = 2] = "Error";
        })(Status = Channel.Status || (Channel.Status = {}));
    })(Channel = Audio.Channel || (Audio.Channel = {}));
})(Audio || (exports.Audio = Audio = {}));

import * as hmUI from '@zos/ui';
import hmUI__default from '@zos/ui';
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from '@zos/device';
import { Time } from '@zos/sensor';
import { create, id } from '@zos/media';
import * as hmFS from '@zos/fs';
import { getText } from '@zos/i18n';
import { log, px as px$2 } from '@zos/utils';

/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function Save(store_key) {
    return function (target, context) {
        context.addInitializer(function () {
            Async.nextTick(() => {
                const core = this._core;
                core.on("initArchiveData", () => {
                    core.storage.setSaveableData(core.storage.archiveData, true, target.get.call(this), ...store_key.split("."));
                });
                core.on("beforeSaveArchive", () => {
                    core.storage.setSaveableData(core.storage.archiveData, false, target.get.call(this), ...store_key.split("."));
                });
                core.on("afterLoadArchive", () => {
                    let dataInArchive = core.storage.getSaveableData(core.storage.archiveData, false, ...store_key.split("."));
                    this._core.debug.log(`Load Data from Archive, store_key: ${store_key}, dataInArchive: ${JSON.stringify(dataInArchive)}`);
                    target.set.call(this, dataInArchive);
                });
            });
        });
        if (context.kind !== "accessor") {
            throw new Error("ArchiveStateAccessor只能用于accessor属性");
        }
        return {
            get() {
                target = target;
                return archiveStateGetter(this, store_key, target.get);
            },
            set(value) {
                target = target;
                archiveStateSetter(this, store_key, target.set, value);
            },
        };
    };
}
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function CustomSave(store_key, serializer, deserializer) {
    return (target, context) => {
        if (context.kind !== "accessor") {
            throw new Error("ArchiveStateAccessor只能用于accessor属性");
        }
        context.addInitializer(function () {
            Async.nextTick(() => {
                const core = this._core;
                core.on("initArchiveData", () => {
                    core.storage.setSaveableData(core.storage.archiveData, true, serializer.call(this, target.get.call(this)), ...store_key.split("."));
                });
                core.on("beforeSaveArchive", () => {
                    core.storage.setSaveableData(core.storage.archiveData, false, serializer.call(this, target.get.call(this)), ...store_key.split("."));
                });
                core.on("afterLoadArchive", () => {
                    let dataInArchive = core.storage.getSaveableData(core.storage.archiveData, false, ...store_key.split("."));
                    this._core.debug.log(`Load Data from Archive, store_key: ${store_key}, dataInArchive: ${JSON.stringify(dataInArchive)}`);
                    target.set.call(this, deserializer.call(this, dataInArchive));
                });
            });
        });
        return {
            get() {
                target = target;
                return archiveStateGetterWithSerializer(this, store_key, target.get);
            },
            set(value) {
                target = target;
                archiveStateSetterWithDeserializer(this, store_key, target.set, value);
            },
        };
    };
}
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function archiveStateGetter(_this, store_key, old_getter) {
    _this._core;
    // if (!core.storage._archiveStateGetterRegisteredList.has(store_key)) {
    //   core.storage._archiveStateGetterRegisteredList.add(store_key);
    //   core.on("initArchiveData", () => {
    //     core.storage.setSaveableData(
    //       core.storage.archiveData,
    //       true,
    //       old_getter.call(_this),
    //       ...store_key.split(".")
    //     );
    //   });
    //   core.on("beforeSaveArchive", () => {
    //     core.storage.setSaveableData(
    //       core.storage.archiveData,
    //       false,
    //       old_getter.call(_this),
    //       ...store_key.split(".")
    //     );
    //   });
    // }
    let val = old_getter.call(_this);
    // console.log(`getval: ${val}`);
    return val;
}
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function archiveStateGetterWithSerializer(_this, store_key, old_getter, serializer) {
    _this._core;
    // if (!core.storage._archiveStateGetterRegisteredList.has(store_key)) {
    //   core.storage._archiveStateGetterRegisteredList.add(store_key);
    //   core.on("initArchiveData", () => {
    //     core.storage.setSaveableData(
    //       core.storage.archiveData,
    //       true,
    //       serializer.call(_this, old_getter.call(_this)),
    //       ...store_key.split(".")
    //     );
    //   });
    //   core.on("beforeSaveArchive", () => {
    //     core.storage.setSaveableData(
    //       core.storage.archiveData,
    //       false,
    //       serializer.call(_this, old_getter.call(_this)),
    //       ...store_key.split(".")
    //     );
    //   });
    // }
    let val = old_getter.call(_this);
    // console.log(`getval: ${val}`);
    return val;
}
function archiveStateSetter(_this, store_key, old_setter, val) {
    // const core = _this._core;
    // if (!core.storage._archiveStateSetterRegisteredList.has(store_key)) {
    //   core.storage._archiveStateSetterRegisteredList.add(store_key);
    //   core.on("afterLoadArchive", () => {
    //     let dataInArchive = core.storage.getSaveableData(
    //       core.storage.archiveData,
    //       false,
    //       ...store_key.split(".")
    //     ) as Value;
    //     console.log(`Load Data from Archive, store_key: ${store_key}`);
    //     old_setter.call(_this, dataInArchive);
    //   });
    // }
    old_setter.call(_this, val);
    // console.log(`setval: ${val}`);
}
function archiveStateSetterWithDeserializer(_this, store_key, old_setter, val, deserializer) {
    // const core = _this._core;
    // if (!core.storage._archiveStateSetterRegisteredList.has(store_key)) {
    //   core.storage._archiveStateSetterRegisteredList.add(store_key);
    //   core.on("afterLoadArchive", () => {
    //     let dataInArchive = core.storage.getSaveableData(
    //       core.storage.archiveData,
    //       false,
    //       ...store_key.split(".")
    //     ) as SerializedValue;
    //     console.log(`Load Data from Archive, store_key: ${store_key}`);
    //     old_setter.call(_this, deserializer.call(_this, dataInArchive));
    //   });
    // }
    old_setter.call(_this, val);
    // console.log(`setval: ${val}`);
}

var __esDecorate$5 = (undefined && undefined.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __runInitializers$5 = (undefined && undefined.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
let Async = (() => {
    let __nextTimerId_decorators;
    let __nextTimerId_initializers = [];
    let __nextTimerId_extraInitializers = [];
    let __delayTasks_decorators;
    let __delayTasks_initializers = [];
    let __delayTasks_extraInitializers = [];
    return class Async {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __nextTimerId_decorators = [Save("async.nextTimerId")];
            __delayTasks_decorators = [Save("async.delayTasks")];
            __esDecorate$5(this, null, __nextTimerId_decorators, { kind: "accessor", name: "_nextTimerId", static: false, private: false, access: { has: obj => "_nextTimerId" in obj, get: obj => obj._nextTimerId, set: (obj, value) => { obj._nextTimerId = value; } }, metadata: _metadata }, __nextTimerId_initializers, __nextTimerId_extraInitializers);
            __esDecorate$5(this, null, __delayTasks_decorators, { kind: "accessor", name: "_delayTasks", static: false, private: false, access: { has: obj => "_delayTasks" in obj, get: obj => obj._delayTasks, set: (obj, value) => { obj._delayTasks = value; } }, metadata: _metadata }, __delayTasks_initializers, __delayTasks_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _core;
        static _nextTickCallbacks = [];
        static _nextTickTimerId = null;
        static nextTick(callback) {
            this._nextTickCallbacks.push(callback);
            if (this._nextTickTimerId == null) {
                this._nextTickTimerId = setTimeout(() => {
                    this._nextTickTimerCallback();
                }, 30);
            }
        }
        static _nextTickTimerCallback() {
            this._nextTickTimerId = null;
            const callbacks = this._nextTickCallbacks;
            this._nextTickCallbacks = [];
            callbacks.forEach((cb) => {
                cb();
            });
        }
        _fps = 45;
        _hmTime = new Time();
        _lastTime = this._hmTime.getTime();
        constructor(_core) {
            __runInitializers$5(this, __delayTasks_extraInitializers);
            this._core = _core;
            // console.log("async init");
            // let timer = new ZeppTimer(() => {
            // //   console.log(`async timer cb`);
            //   this._scheduleTask();
            // }, ~~(1000 / this._fps));
            // timer.start();
            setInterval(() => {
                this._scheduleTask();
            }, ~~(1000 / this._fps));
        }
        _scheduleTask() {
            // TODO 沒有充分考慮存檔時產生的問題（this._delayTasks引用變化），及其它問題
            let now = this._hmTime.getTime();
            let deltaTime = now - this._lastTime;
            this._lastTime = now;
            // console.log(`async timer cb d=${deltaTime}`);
            for (let id in this._delayTasks) {
                let task = this._delayTasks[id];
                task.next -= deltaTime;
                if (task.next <= 0) {
                    this._core.emit(task.event, ...task.args);
                    if (task.repeat >= 0) {
                        // interval
                        task.next += task.repeat;
                    }
                    else {
                        delete this._delayTasks[id];
                    }
                }
            }
        }
        #_nextTimerId_accessor_storage = __runInitializers$5(this, __nextTimerId_initializers, 50);
        get _nextTimerId() { return this.#_nextTimerId_accessor_storage; }
        set _nextTimerId(value) { this.#_nextTimerId_accessor_storage = value; }
        #_delayTasks_accessor_storage = (__runInitializers$5(this, __nextTimerId_extraInitializers), __runInitializers$5(this, __delayTasks_initializers, {}));
        // tasks
        get _delayTasks() { return this.#_delayTasks_accessor_storage; }
        set _delayTasks(value) { this.#_delayTasks_accessor_storage = value; }
        // 注意在task執行中立即創建一個新的task，會在同一個js task中執行
        // 注意周期實際為1個frame的時間的整數倍
        addDelayTask(event, args, delayMs) {
            let task = {
                event,
                args,
                next: delayMs,
                repeat: -1,
            };
            let id = this._nextTimerId++;
            this._delayTasks[id] = task;
            return id;
        }
        addRepeatTask(event, args, intervalMs, delayMs) {
            intervalMs = intervalMs >= 0 ? intervalMs : 0;
            let task = {
                event,
                args,
                next: delayMs ?? intervalMs,
                repeat: intervalMs,
            };
            let id = this._nextTimerId++;
            this._delayTasks[id] = task;
            return id;
        }
        removeTask(id) {
            delete this._delayTasks[id];
        }
    };
})();

var __esDecorate$4 = (undefined && undefined.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __runInitializers$4 = (undefined && undefined.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
let Audio = (() => {
    let __channels_decorators;
    let __channels_initializers = [];
    let __channels_extraInitializers = [];
    return class Audio {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __channels_decorators = [CustomSave("audio.channels", function (channels) {
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
            __esDecorate$4(this, null, __channels_decorators, { kind: "accessor", name: "_channels", static: false, private: false, access: { has: obj => "_channels" in obj, get: obj => obj._channels, set: (obj, value) => { obj._channels = value; } }, metadata: _metadata }, __channels_initializers, __channels_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _core;
        static _hmPlayer = create(id.PLAYER);
        constructor(_core) {
            __runInitializers$4(this, __channels_extraInitializers);
            this._core = _core;
            this._channels["audio"] = new Audio.Channel(this);
        }
        #_channels_accessor_storage = __runInitializers$4(this, __channels_initializers, {});
        get _channels() { return this.#_channels_accessor_storage; }
        set _channels(value) { this.#_channels_accessor_storage = value; }
        get channels() {
            return this._channels;
        }
        createChannel(name) {
            // TODO support more audio channels
            if (Object.getOwnPropertyNames(this._channels).length > 0)
                throw "Can't create more than one audio channel on ZeppOS";
            if (this._channels[name])
                throw "Channel Already Exist";
            return (this._channels[name] = new Audio.Channel(this));
        }
    };
})();
(function (Audio) {
    class Channel {
        _audio;
        // platform specific
        // universal
        constructor(_audio) {
            this._audio = _audio;
            Audio._hmPlayer.addEventListener(Audio._hmPlayer.event.PREPARE, (res) => this._onPrepared(res));
            Audio._hmPlayer.addEventListener(Audio._hmPlayer.event.COMPLETE, () => {
                this._onCompleted();
            });
        }
        mode = Channel.Mode.PlayInOrder;
        status = Channel.Status.Stopped;
        _playbackList = [];
        _nowIndex = null;
        currentInfo = null;
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
            if (result) {
                let mediaInfo = Audio._hmPlayer.getMediaInfo();
                this.currentInfo = {
                    // placeholder
                    artist: mediaInfo.artist ?? "未知",
                    title: mediaInfo.title ?? "未知",
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
        (function (Mode) {
            Mode[Mode["PlayInOrder"] = 0] = "PlayInOrder";
            Mode[Mode["PlayInOrderRepeat"] = 1] = "PlayInOrderRepeat";
        })(Channel.Mode || (Channel.Mode = {}));
        (function (Status) {
            Status[Status["Stopped"] = 0] = "Stopped";
            Status[Status["Playing"] = 1] = "Playing";
            Status[Status["Error"] = 2] = "Error";
        })(Channel.Status || (Channel.Status = {}));
    })(Channel = Audio.Channel || (Audio.Channel = {}));
})(Audio || (Audio = {}));

/**
 * 将一行字符串切割为(str,quoted)[]的形式
 * @param str
 * @returns
 */
function splitStr2Objs(str) {
    // console.log(`splitStr2Objs: ${str}`);
    let res = [];
    let len = str.length;
    let p = 0;
    while (p < len) {
        while (p < len && str[p] === " ")
            ++p; // find first not space
        if (p === len)
            return res;
        if (str[p] === '"') {
            // find next `"`
            let q = p + 1;
            while (q < len && str[q] !== '"') {
                if (str[q] === "\\")
                    q += 2;
                else
                    ++q;
            }
            if (q >= len)
                throw "Quote not completed";
            let resstr = str.slice(p + 1, q);
            //   console.log(`Transformed[${res.length}]:\n${transformStr(resstr)}`);
            let transformedStr = "error";
            try {
                transformedStr = transformStr(resstr);
            }
            catch (e) {
                throw "该字符串中的转义字符有错误：" + resstr;
            }
            res.push({ str: transformedStr, isQuoted: true });
            p = q + 1;
        }
        else if (str[p] === "[") {
            // find next `]`
            let q = p + 1;
            while (q < len && str[q] !== "]") {
                // if (str[q] === "\\") q += 2;
                // else ++q;
                ++q;
            }
            if (q >= len)
                throw "square brackets not completed";
            let resstr = str.slice(p + 1, q);
            res.push({ str: resstr, isSquared: true });
            p = q + 1;
        }
        else if (str[p] === "(") {
            // find next `)`
            let q = p + 1;
            while (q < len && str[q] !== ")") {
                // if (str[q] === "\\") q += 2;
                // else ++q;
                ++q;
            }
            if (q >= len)
                throw "round brackets not completed";
            let resstr = str.slice(p + 1, q);
            res.push({ str: resstr, isRounded: true });
            p = q + 1;
        }
        else {
            let q = p + 1;
            while (q < len && str[q] !== " " && str[q] !== '"' && str[q] !== "(" && str[q] !== "[")
                ++q; // find first space/quote after this
            let resstr = str.slice(p, q);
            //   console.log(transformStr(resstr));
            res.push({ str: resstr, isQuoted: false });
            p = q;
        }
    }
    return res;
}
function mergeObjs2Str(objs) {
    return objs
        .map((obj) => obj.isQuoted ? `"${obj.str}"` : obj.isSquared ? `[${obj.str}]` : obj.isRounded ? `(${obj.str})` : obj.str)
        .join(" ");
}
/**
 * 转义一遍字符串，使其中\n等变成对应字符（可能报错）
 * @param str
 * @returns
 */
function transformStr(str) {
    return JSON.parse(`"${str}"`);
}
// 翻译hzengine script插值字符串
// 语法："...[expression]..."
// 如果希望在字符串中显示`[`，请使用两个`[`，如`"[[正常显示而不被当作表达式的文字]]"`
function parseInterpolatedStr(str) {
    let len = str.length;
    let p = 0;
    let expr_record = [];
    while (p < len) {
        // 寻找第一个`[`
        while (p < len && str[p] !== "[")
            ++p;
        if (p >= len)
            break;
        // 判断是否是两个`[`
        if (str[p] === "[" && str[p + 1] === "[") {
            p += 2;
            continue;
        }
        // 寻找第一个`]`
        let q = p + 1;
        while (q < len && str[q] !== "]") {
            ++q;
            // 判断是否是两个`]`
            while (q < len && str[q] === "]" && str[q + 1] === "]") {
                q += 2;
            }
        }
        if (q >= len) {
            // 没有找到`]`，报错
            throw `Interpolated string lose closing bracket: ${str}`;
        }
        expr_record.push([p, q]);
        p = q + 1;
    }
    let left = 0, right = len;
    let res = [];
    for (let i = 0; i < expr_record.length; ++i) {
        let [l, r] = expr_record[i];
        if (l > left)
            res.push({ str: str.slice(left, l), isExpression: false });
        res.push({ str: str.slice(l + 1, r), isExpression: true });
        left = r + 1;
    }
    if (left < right)
        res.push({ str: str.slice(left, right), isExpression: false });
    return res;
}
function removeComment(str) {
    let quoteNotClosed = false;
    let len = str.length;
    for (let i = 0; i < len; ++i) {
        if (quoteNotClosed && str[i] === `\\`) {
            ++i;
        }
        else if (str[i] === `"`) {
            quoteNotClosed = !quoteNotClosed;
        }
        else if (str[i] === "#" && !quoteNotClosed) {
            return str.slice(0, i);
        }
    }
    return str;
}

var __esDecorate$3 = (undefined && undefined.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __runInitializers$3 = (undefined && undefined.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
let System = (() => {
    let _condition_decorators;
    let _condition_initializers = [];
    let _condition_extraInitializers = [];
    return class System {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _condition_decorators = [Save("system.condition")];
            __esDecorate$3(this, null, _condition_decorators, { kind: "accessor", name: "condition", static: false, private: false, access: { has: obj => "condition" in obj, get: obj => obj.condition, set: (obj, value) => { obj.condition = value; } }, metadata: _metadata }, _condition_initializers, _condition_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _core;
        constructor(_core) {
            this._core = _core;
            _core.on("system.continue", () => {
                this._pauseTimer = null;
                this.continue();
            });
        }
        #condition_accessor_storage = __runInitializers$3(this, _condition_initializers, System.Condition.Free);
        get condition() { return this.#condition_accessor_storage; }
        set condition(value) { this.#condition_accessor_storage = value; }
        _pauseTimer = (__runInitializers$3(this, _condition_extraInitializers), null);
        /**
         * 暂停(可指定一段时间)
         * 后调用的会覆盖之前pause的设定时间
         * @param delayMs
         */
        pause(delayMs) {
            this._core.debug.log(`Pause`);
            if (this.condition === System.Condition.Gaming) {
                this.condition = System.Condition.Pause;
            }
            else
                throw `pause but condition error (todo)`; // TODO
            if (this._pauseTimer) {
                this._core.async.removeTask(this._pauseTimer);
                this._pauseTimer = null;
            }
            if (delayMs !== undefined) {
                this._pauseTimer = this._core.async.addDelayTask("system.continue", [], delayMs);
            }
        }
        /**
         * 继续由于pause中断的游戏
         */
        continue() {
            if (this.condition !== System.Condition.Pause)
                return;
            this.condition = System.Condition.Gaming;
            this.run();
        }
        /**
         * 阻塞
         */
        block() {
            if (this.condition !== System.Condition.Gaming)
                throw `block but condition error (todo)`;
            this.condition = System.Condition.Blocked;
        }
        /**
         * 取消阻塞
         */
        unBlock() {
            if (this.condition !== System.Condition.Blocked)
                return;
            this.condition = System.Condition.Gaming;
            this.run();
        }
        run() {
            this.condition = System.Condition.Gaming;
            while (this.condition === System.Condition.Gaming) {
                // console.log("Run Single Line");
                this._core.script.runSingleLine();
            }
        }
        start(initLabel = "start") {
            // 初始化存档
            this._core.storage.archiveData;
            this._core.debug.log("Game Start");
            this._core.script.clear();
            this._core.script.jumpLabel(initLabel);
            this.run();
        }
    };
})();
(function (System) {
    (function (Condition) {
        Condition[Condition["Free"] = 0] = "Free";
        Condition[Condition["Pause"] = 1] = "Pause";
        Condition[Condition["Blocked"] = 2] = "Blocked";
        Condition[Condition["Gaming"] = 3] = "Gaming";
    })(System.Condition || (System.Condition = {}));
})(System || (System = {}));

/**
 * animation.js
 * @description A library for providing multi-track animations for HZEngine. 一个用于在HZEngine中提供简单动画的库
 * @date 2024/10/2
 * @author CuberQAQ
 */
class Animation {
    normalizedProfile;
    initProps = {};
    activeRootTrack = null;
    lastTime = 0;
    onFrame = null;
    onEnd = null;
    customWrappers = {};
    constructor(profile, options) {
        this.normalizedProfile = Profile.normalize(profile);
        console.log(`Animation: ${JSON.stringify(profile)}`);
        if (options) {
            options.initProps && (this.initProps = options.initProps);
            options.wrappers && (this.customWrappers = options.wrappers);
        }
    }
    onStop = null;
    serialize() {
        return {
            normalizedProfile: this.normalizedProfile,
            initProps: this.initProps,
            activeRootTrack: this.activeRootTrack?.serialize(),
            lastTime: this.lastTime,
        };
    }
    static unserialize(serialized, wrappers) {
        let profile = serialized.normalizedProfile;
        let animation = new Animation(profile, {
            initProps: serialized.initProps,
            wrappers,
        });
        animation.lastTime = serialized.lastTime;
        serialized.activeRootTrack &&
            (animation.activeRootTrack = ActiveTrackNode.unserialize(animation, serialized.activeRootTrack));
        return animation;
    }
    timerCb() { }
    init() {
        this.activeRootTrack = new ActiveTrackNode(this, {
            accessKeys: [],
            index: 0,
            initProps: this.initProps,
        });
    }
    goto(time) {
        if (!this.activeRootTrack) {
            this.init();
        }
        if (time < 0)
            time = 0;
        if (time < this.lastTime) {
            this.init(); // reset the tracknode
            try {
                this.activeRootTrack.step(time);
            }
            catch (e) {
                console.log(e);
                this.activeRootTrack.status = ActiveTrackNode.Status.Pause;
            }
            if (this.activeRootTrack.status === ActiveTrackNode.Status.Pause) {
                if (this.onEnd)
                    this.onEnd();
            }
        }
        else {
            if (this.activeRootTrack.status !== ActiveTrackNode.Status.Pause) {
                try {
                    this.activeRootTrack.step(time - this.lastTime);
                }
                catch (e) {
                    console.log(e);
                    this.activeRootTrack.status = ActiveTrackNode.Status.Pause;
                }
            }
        }
        this.lastTime = time;
        if (this.onFrame) {
            // console.log("on frame", JSON.stringify(this.calcProps()));
            this.onFrame(this.calcProps());
        }
        if (this.activeRootTrack.status === ActiveTrackNode.Status.Pause) {
            if (this.onEnd)
                this.onEnd();
        }
    }
    step(delta_time) {
        this.goto(this.lastTime + delta_time);
    }
    calcProps() {
        return this.activeRootTrack.calcProps();
    }
    reverse() { }
    stop() { }
    _accessProfile(accessKeys) {
        let section = this.normalizedProfile;
        for (let i = 0; i < accessKeys.length; i++) {
            section = section[accessKeys[i]];
        }
        return section;
    }
    _getWrapper(wrapper) {
        if (typeof wrapper === "string") {
            return (this.customWrappers[wrapper] ??
                buildInWrappers[wrapper] ??
                buildInWrappers.none);
        }
        else if (wrapper === undefined) {
            return buildInWrappers.none;
        }
        else
            return wrapper;
    }
    _calcWrappedProps(former_props, props, wrapper, progress) {
        let _former_props = { ...former_props };
        let wrapper_func = this._getWrapper(wrapper);
        let wraped_prog = wrapper_func(progress);
        let res = { ..._former_props };
        for (let key in props) {
            if (typeof props[key] === "number") {
                if (_former_props[key] == undefined)
                    _former_props[key] = 0;
                res[key] =
                    _former_props[key] + wraped_prog * (props[key] - _former_props[key]);
            }
            else if (typeof props[key] === "boolean") {
                if (_former_props[key] == undefined)
                    _former_props[key] = false;
                res[key] = wraped_prog === 1 ? props[key] : _former_props[key];
            }
            else if (typeof props[key] === "string") {
                if (_former_props[key] == undefined)
                    _former_props[key] = "";
                res[key] = wraped_prog === 1 ? props[key] : _former_props[key];
            }
            else {
                res[key] = props[key];
            }
        }
        return res;
    }
}
var Profile;
(function (Profile) {
    function normalize(profile) {
        if (!Array.isArray(profile)) {
            // section
            return [profile];
        }
        else if (profile.length === 0) {
            // empty track/tracklist
            return [];
        }
        else if (!Array.isArray(profile[0])) {
            // track
            return profile;
        }
        else {
            // tracklist
            return [
                {
                    syncs: profile,
                },
            ];
        }
    }
    Profile.normalize = normalize;
})(Profile || (Profile = {}));
class ActiveTrackNode {
    animation;
    accessKeys;
    currentIndex;
    repeated = 0;
    status = ActiveTrackNode.Status.Playing;
    now_time = 0;
    #currentSection = null;
    #currentIndex = null;
    get currentSection() {
        if (this.#currentSection === null) {
            if (this.currentIndex === null) {
                this.#currentSection = this.animation._accessProfile(this.accessKeys);
            }
            else {
                this.#currentSection = this.currentTrack[this.currentIndex];
            }
            this.#currentIndex = this.currentIndex;
        }
        else if (this.currentIndex !== this.#currentIndex) {
            this.#currentSection = this.currentTrack[this.currentIndex];
            this.#currentIndex = this.currentIndex;
        }
        return this.#currentSection;
    }
    #currentTrack = null;
    get currentTrack() {
        if (this.#currentTrack === null && this.currentIndex !== null) {
            this.#currentTrack = this.animation._accessProfile(this.accessKeys);
        }
        return this.#currentTrack;
    }
    lastProps = {};
    nowProps = {};
    constructor(animation, { accessKeys, index, initProps, }) {
        this.animation = animation;
        this.accessKeys = accessKeys;
        this.currentIndex = index;
        this.lastProps = { ...initProps };
        this.nowProps = { ...initProps };
    }
    serialize() {
        return {
            accessKeys: this.accessKeys,
            currentIndex: this.currentIndex,
            repeated: this.repeated,
            status: this.status,
            now_time: this.now_time,
            lastProps: this.lastProps,
            nowProps: this.nowProps,
            activeSyncs: this.activeSyncs.map((sync) => sync.serialize()),
        };
    }
    static unserialize(animation, serialized) {
        let node = new ActiveTrackNode(animation, {
            accessKeys: serialized.accessKeys,
            index: serialized.currentIndex,
            initProps: serialized.lastProps,
        });
        node.lastProps = serialized.lastProps;
        node.nowProps = serialized.nowProps;
        node.status = serialized.status;
        node.repeated = serialized.repeated;
        node.now_time = serialized.now_time;
        node.activeSyncs = serialized.activeSyncs.map((sync) => ActiveTrackNode.unserialize(animation, sync));
        return node;
    }
    /**
     *
     * @param delta_time
     * @returns 剩餘的時間
     */
    step(delta_time) {
        // console.log(`node step: ${delta_time}`);
        // if (this.status === ActiveTrackNode.Status.Pause) return delta_time;
        // because we should proceed async list
        // normal
        if (!this.currentSection) {
            this.status = ActiveTrackNode.Status.Pause;
            return delta_time;
        }
        while (true) {
            // constant field: time, wrapper, frame
            // instant filed: syncs, asyncs
            if (this.status === ActiveTrackNode.Status.Playing) {
                if (this.currentSection.time === undefined ||
                    this.currentSection.time <= 0) {
                    this.nowProps = { ...this.nowProps, ...this.currentSection.frame };
                }
                else {
                    if (this.now_time + delta_time >= this.currentSection.time) {
                        // this.now_time = this.currentSection.time
                        delta_time -= this.currentSection.time - this.now_time;
                        this.nowProps = { ...this.nowProps, ...this.currentSection.frame };
                    }
                    else {
                        this.now_time += delta_time;
                        delta_time = 0;
                        // calc
                        let progress = this.now_time / this.currentSection.time;
                        // console.log(`progress: ${progress}`);
                        this.nowProps = this.animation._calcWrappedProps(this.lastProps, this.currentSection.frame ?? {}, this.currentSection.wrapper, progress);
                        break;
                    }
                }
                // sync async
                if (this.currentSection.syncs && this.currentSection.syncs.length > 0) {
                    this.initSyncs();
                    this.status = ActiveTrackNode.Status.WaitingSyncs;
                }
            }
            // step and check sync
            if (this.status === ActiveTrackNode.Status.WaitingSyncs) {
                delta_time = this.stepSyncs(delta_time); // returns lefted time
                this.nowProps = Object.assign(this.nowProps, this.getSyncsProps());
                if (this.checkSyncsFinished()) {
                    this.status = ActiveTrackNode.Status.Playing;
                    this.activeSyncs = [];
                }
                else {
                    // debug
                    if (delta_time !== 0)
                        throw "syncs not finished while lefted time != 0. may be bugs";
                    break;
                }
            }
            // check repeat , finish
            if (this.currentSection.repeat !== undefined) {
                this.repeated++;
                if (this.repeated >= this.currentSection.repeat) {
                    // finish and proceed next section
                    // TODO
                    if (this._switchNextSection())
                        continue;
                    else
                        break;
                }
                else {
                    // continue this section
                    this.now_time = 0;
                    this.nowProps = { ...this.lastProps };
                    continue;
                }
            }
            else {
                if (this._switchNextSection())
                    continue;
                else
                    break;
            }
        }
        // waiting syncs
        return delta_time;
    }
    calcProps() {
        return this.nowProps;
    }
    _switchNextSection() {
        if (this.currentIndex === null ||
            this.currentTrack.length === this.currentIndex + 1) {
            // already reach the end
            this.status = ActiveTrackNode.Status.Pause;
            return false;
        }
        else {
            this.lastProps = { ...this.nowProps };
            this.repeated = 0;
            this.now_time = 0;
            this.currentIndex++;
            return true;
        }
    }
    activeSyncs = [];
    initSyncs() {
        // console.log("init syncs");
        let activeSyncs = [];
        // if (this.currentSection.syncs == null) return;
        let subprofile = this.currentSection.syncs;
        let activeTrackNode;
        if (Array.isArray(subprofile)) {
            if (subprofile.length > 0 && Array.isArray(subprofile[0])) {
                // tracklist
                for (let j = 0; j < subprofile.length; ++j) {
                    activeTrackNode = new ActiveTrackNode(this.animation, {
                        accessKeys: [
                            ...this.accessKeys,
                            "" + this.currentIndex,
                            "syncs",
                            "" + j,
                        ],
                        index: 0,
                        initProps: this.nowProps, // TODO 因为 lastProps在切换的时候才会更新，所以用nowProps
                    });
                    activeSyncs.push(activeTrackNode);
                }
            }
            else {
                // Track
                activeTrackNode = new ActiveTrackNode(this.animation, {
                    accessKeys: [...this.accessKeys, "" + this.currentIndex, "syncs"],
                    index: 0,
                    initProps: this.nowProps, // TODO 因为 lastProps在切换的时候才会更新，所以用nowProps
                });
                activeSyncs.push(activeTrackNode);
                console
                    .log();
            }
        }
        else {
            // section
            activeTrackNode = new ActiveTrackNode(this.animation, {
                accessKeys: [...this.accessKeys, "" + this.currentIndex, "syncs"],
                index: null,
                initProps: this.nowProps, // TODO 因为 lastProps在切换的时候才会更新，所以用nowProps
            });
            activeSyncs.push(activeTrackNode);
        }
        // activeTrackNode?.step(0); // TODO
        this.activeSyncs = activeSyncs;
    }
    stepSyncs(delta_time) {
        let lefted_time = delta_time;
        for (let i = 0; i < this.activeSyncs.length; ++i) {
            lefted_time = Math.min(this.activeSyncs[i].step(delta_time), lefted_time);
        }
        return lefted_time;
    }
    checkSyncsFinished() {
        for (let i = 0; i < this.activeSyncs.length; ++i) {
            if (this.activeSyncs[i].status !== ActiveTrackNode.Status.Pause)
                return false;
        }
        return true;
    }
    getSyncsProps() {
        let res = {};
        for (let i = 0; i < this.activeSyncs.length; ++i) {
            Object.assign(res, this.activeSyncs[i].calcProps());
        }
        return res;
    }
}
(function (ActiveTrackNode) {
    (function (Status) {
        Status[Status["Playing"] = 0] = "Playing";
        Status[Status["WaitingSyncs"] = 1] = "WaitingSyncs";
        Status[Status["Pause"] = 2] = "Pause";
    })(ActiveTrackNode.Status || (ActiveTrackNode.Status = {}));
})(ActiveTrackNode || (ActiveTrackNode = {}));
const buildInWrappers = {
    none: (x) => (x < 1 ? 0 : 1),
    linear: (x) => x,
    easeout: (x) => Math.pow(x, 3),
    easein: (x) => 1 - Math.pow(1 - x, 3),
    easeinout: (x) => x < 0.5 ? 0.5 * Math.pow(x, 3) : 1 - 0.5 * Math.pow(1 - x, 3),
};

var __esDecorate$2 = (undefined && undefined.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __runInitializers$2 = (undefined && undefined.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
(() => {
    let __nextAnimationId_decorators;
    let __nextAnimationId_initializers = [];
    let __nextAnimationId_extraInitializers = [];
    let __animationMap_decorators;
    let __animationMap_initializers = [];
    let __animationMap_extraInitializers = [];
    return class AnimationPlugin {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __nextAnimationId_decorators = [Save("anime.nid")];
            __animationMap_decorators = [CustomSave("anime.map", function (obj) {
                    let res = {};
                    for (let id in obj) {
                        if (!obj[id].isSave)
                            continue;
                        res[id] = {
                            destroyOnEnd: obj[id].destroyOnEnd,
                            isSave: obj[id].isSave,
                            targetViewId: obj[id].targetViewId,
                            serializedInstance: obj[id].instance.serialize(),
                        };
                    }
                    return res;
                }, function (obj) {
                    let res = {};
                    for (let id in obj) {
                        if (!obj[id].isSave)
                            continue;
                        let animation = Animation.unserialize(obj[id].serializedInstance);
                        this._linkAnimationCb(animation, Number(id));
                        res[id] = {
                            destroyOnEnd: obj[id].destroyOnEnd,
                            isSave: obj[id].isSave,
                            targetViewId: obj[id].targetViewId,
                            instance: animation,
                        };
                    }
                    return res;
                })];
            __esDecorate$2(this, null, __nextAnimationId_decorators, { kind: "accessor", name: "_nextAnimationId", static: false, private: false, access: { has: obj => "_nextAnimationId" in obj, get: obj => obj._nextAnimationId, set: (obj, value) => { obj._nextAnimationId = value; } }, metadata: _metadata }, __nextAnimationId_initializers, __nextAnimationId_extraInitializers);
            __esDecorate$2(this, null, __animationMap_decorators, { kind: "accessor", name: "_animationMap", static: false, private: false, access: { has: obj => "_animationMap" in obj, get: obj => obj._animationMap, set: (obj, value) => { obj._animationMap = value; } }, metadata: _metadata }, __animationMap_initializers, __animationMap_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _core;
        constructor(_core) {
            this._core = _core;
            _core.loadPlugin("animation", () => this);
            _core.on("anime.cb", this._timerCb.bind(this));
            _core.async.addRepeatTask("anime.cb", [], 0); // 此處周期應考慮加個sync update
        }
        #_nextAnimationId_accessor_storage = __runInitializers$2(this, __nextAnimationId_initializers, 1);
        get _nextAnimationId() { return this.#_nextAnimationId_accessor_storage; } // self-increment
        set _nextAnimationId(value) { this.#_nextAnimationId_accessor_storage = value; }
        #_animationMap_accessor_storage = (__runInitializers$2(this, __nextAnimationId_extraInitializers), __runInitializers$2(this, __animationMap_initializers, {}));
        get _animationMap() { return this.#_animationMap_accessor_storage; }
        set _animationMap(value) { this.#_animationMap_accessor_storage = value; }
        _timeSensor = (__runInitializers$2(this, __animationMap_extraInitializers), new Time());
        _lastCbUtc = this._timeSensor.getTime();
        applyAnimation({ profile, targetView, options, }) {
            const id = this._nextAnimationId++;
            let animation = new Animation(profile, {
                initProps: targetView.prop ?? {},
                wrappers: options?.customWrappers,
            });
            if (!targetView.id)
                throw "targetView.id must be not null";
            this._animationMap[id] = {
                destroyOnEnd: options?.destroyOnEnd ?? false,
                isSave: options?.isSave ?? true,
                instance: animation,
                targetViewId: targetView.id,
            };
            this._linkAnimationCb(animation, id);
            animation.goto(0);
            this._core.on("afterLoadArchive", () => {
                this._lastCbUtc = this._timeSensor.getTime();
            });
            return id;
        }
        stopAnimation(id) {
            if (this._animationMap[id] !== undefined) {
                this._animationMap[id].instance.stop();
                delete this._animationMap[id];
            }
        }
        _nextTempAnimationId = -1; // self-decrement
        _tempAnimationMap = {};
        createTempAnimation({ profile, onFrame, onEnd, initProps, wrappers, }) {
            let id = this._nextTempAnimationId--;
            let animation = new Animation(profile, {
                initProps,
                wrappers,
            });
            animation.onFrame = onFrame ?? null;
            animation.onEnd = () => {
                if (onEnd)
                    onEnd();
                delete this._tempAnimationMap[id];
            };
            this._tempAnimationMap[id] = animation;
            return id;
        }
        clearTempAnimation(id) {
            if (this._tempAnimationMap[id] !== undefined) {
                this._tempAnimationMap[id].stop();
                delete this._tempAnimationMap[id];
            }
        }
        _timerCb() {
            let utc = this._timeSensor.getTime();
            let delta_time = (utc - this._lastCbUtc) / 1000;
            this._lastCbUtc = utc;
            // this._core.debug.log(`delta time: ${delta_time}`);
            for (let id in this._animationMap) {
                this._animationMap[id].instance.step(delta_time);
            }
            for (let id in this._tempAnimationMap) {
                this._tempAnimationMap[id].step(delta_time);
            }
        }
        _frameCb(props, id) {
            if (this._animationMap[id] !== undefined) {
                let view = this._core.ui.getView(this._animationMap[id].targetViewId);
                if (!view) {
                    this._core.debug.log(`view ${id} not found, stop animation`);
                    this.stopAnimation(id); // TODO
                    return;
                }
                view.commit(props);
                // this._core.debug.log(`update view ${view.name} with ${JSON.stringify(props)}`);
            }
        }
        _linkAnimationCb(animation, id) {
            animation.onFrame = (props) => {
                // console.log("onFrame cb");
                this._frameCb(props, id);
            };
            animation.onEnd = () => this._endCb(id);
        }
        _endCb(id) {
            if (this._animationMap[id] !== undefined) {
                if (this._animationMap[id].destroyOnEnd) {
                    let view = this._core.ui.getView(id);
                    if (!view)
                        return;
                    this._core.ui.destroyView(view);
                }
                delete this._animationMap[id];
            }
        }
    };
})();

let cache = new Map();
function readline(path, line_index) {
    if (cache.has(path)) {
        return cache.get(path)[line_index];
    }
    // Get Command
    let hzsContent = hmFS.readFileSync({
        path,
        options: { encoding: "utf8" },
    });
    let file = hzsContent.split(/\r?\n|(?<!\n)\r/);
    cache.set(path, file);
    return file[line_index];
}

var __esDecorate$1 = (undefined && undefined.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __runInitializers$1 = (undefined && undefined.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
let Script = (() => {
    let __callStack_decorators;
    let __callStack_initializers = [];
    let __callStack_extraInitializers = [];
    let __statementStack_decorators;
    let __statementStack_initializers = [];
    let __statementStack_extraInitializers = [];
    let __nextRunPosition_decorators;
    let __nextRunPosition_initializers = [];
    let __nextRunPosition_extraInitializers = [];
    return class Script {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __callStack_decorators = [Save("script.callStack")];
            __statementStack_decorators = [Save("script.statementStack")];
            __nextRunPosition_decorators = [Save("script.nextRunPosition")];
            __esDecorate$1(this, null, __callStack_decorators, { kind: "accessor", name: "_callStack", static: false, private: false, access: { has: obj => "_callStack" in obj, get: obj => obj._callStack, set: (obj, value) => { obj._callStack = value; } }, metadata: _metadata }, __callStack_initializers, __callStack_extraInitializers);
            __esDecorate$1(this, null, __statementStack_decorators, { kind: "accessor", name: "_statementStack", static: false, private: false, access: { has: obj => "_statementStack" in obj, get: obj => obj._statementStack, set: (obj, value) => { obj._statementStack = value; } }, metadata: _metadata }, __statementStack_initializers, __statementStack_extraInitializers);
            __esDecorate$1(this, null, __nextRunPosition_decorators, { kind: "accessor", name: "_nextRunPosition", static: false, private: false, access: { has: obj => "_nextRunPosition" in obj, get: obj => obj._nextRunPosition, set: (obj, value) => { obj._nextRunPosition = value; } }, metadata: _metadata }, __nextRunPosition_initializers, __nextRunPosition_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _core;
        constructor(_core) {
            this._core = _core;
        }
        #_callStack_accessor_storage = __runInitializers$1(this, __callStack_initializers, []);
        /**
         * 调用栈
         * 在call时保存当前执行位置和语句栈，在return时恢复执行位置和语句栈
         */
        get _callStack() { return this.#_callStack_accessor_storage; }
        set _callStack(value) { this.#_callStack_accessor_storage = value; }
        #_statementStack_accessor_storage = (__runInitializers$1(this, __callStack_extraInitializers), __runInitializers$1(this, __statementStack_initializers, []));
        /**
         * 语句栈
         * 比如while, if，会在语句开始时入栈，语句结束时出栈
         */
        get _statementStack() { return this.#_statementStack_accessor_storage; }
        set _statementStack(value) { this.#_statementStack_accessor_storage = value; }
        #_nextRunPosition_accessor_storage = (__runInitializers$1(this, __statementStack_extraInitializers), __runInitializers$1(this, __nextRunPosition_initializers, null));
        /**
         * 下一次执行的脚本位置
         * 注意：存储该值的时候应总是拷贝赋值而非直接引用赋值
         */
        get _nextRunPosition() { return this.#_nextRunPosition_accessor_storage; }
        set _nextRunPosition(value) { this.#_nextRunPosition_accessor_storage = value; }
        // Script Run
        /**
         * 执行_nextRunPosition，并返回下一行_nextRunPosition是否不为null
         */
        runSingleLine() {
            if (!this._nextRunPosition) {
                // 文件尾隐式执行 return
                this.return();
                return false;
            }
            let nowRunPosition = [
                ...this._nextRunPosition,
            ];
            this.incrementNextPosition();
            let rawCommand = readline(nowRunPosition[0], nowRunPosition[1]);
            // remove comment
            rawCommand = removeComment(rawCommand);
            if (rawCommand.trim().length && !rawCommand.trim().startsWith("#")) {
                if (rawCommand.trim().startsWith("*")) {
                    if (this._statementStack.length) {
                        throw `label between statement is not allowed, at file [${nowRunPosition[0]}] line [${nowRunPosition[1]}]`;
                    }
                }
                else {
                    this._core.debug.log("Run cmd: " + rawCommand);
                    // Process Command
                    this._processCmd(rawCommand, [...nowRunPosition]);
                }
            }
            return !!this._nextRunPosition;
        }
        // Label Point Control
        /**
         * 跳转到目标标签
         * @param targetLabel
         */
        jumpLabel(targetLabel) {
            let labelPosition = this._locateLabel(targetLabel);
            this._nextRunPosition = labelPosition;
            this._statementStack = [];
        }
        jump(path, index, clearStatementStack = false) {
            this._nextRunPosition = [path, index];
            if (clearStatementStack) {
                this._statementStack = [];
            }
        }
        /**
         * 调用目标标签
         * 保存当前执行位置至调用栈，跳转到目标位置，直到return返回
         * @param targetLabel
         */
        callLabel(targetLabel) {
            // console.log(
            //   `pending to call label ${targetLabel}, stack=${JSON.stringify(
            //     this._routeStack
            //   )}`
            // );
            let labelPosition = this._locateLabel(targetLabel);
            this._callStack.push({
                position: this._nextRunPosition ? [...this._nextRunPosition] : null,
                statementStack: this._statementStack,
            });
            this._nextRunPosition = labelPosition;
            this._statementStack = [];
            // console.log(
            //   `finished call label ${targetLabel}, stack=${JSON.stringify(
            //     this._routeStack
            //   )}`
            // );
        }
        return() {
            // console.log(`pending to return, stack=${JSON.stringify(this._routeStack)}`);
            let stackItem = this._callStack.pop();
            if (stackItem) {
                this._statementStack = stackItem.statementStack;
                this._nextRunPosition = stackItem.position;
            }
            else {
                this._nextRunPosition = null;
                this._statementStack = [];
                // Game End
                this._core.end();
            }
            // console.log(`finished return, stack=${JSON.stringify(this._routeStack)}`);
        }
        clear() {
            this._nextRunPosition = null;
            this._callStack = [];
        }
        _locateLabel(labelName) {
            if (this._core.storage.preloadedData == null)
                throw "Preloaded Data is Null";
            if (!this._core.storage.preloadedData.script.labelMap[labelName])
                throw `Error: Label [${labelName}] not found`;
            let labelData = [
                ...this._core.storage.preloadedData.script.labelMap[labelName],
            ];
            return labelData;
        }
        incrementNextPosition() {
            if (this._core.storage.preloadedData == null)
                throw "Preloaded Data is Null";
            if (!this._nextRunPosition)
                throw "_nextRunPosition is null";
            // console.log(`hzsInfoMap=${JSON.stringify(this._core.storage.preloadedData.script.hzsInfoMap)}`);
            let hzsInfo = this._core.storage.preloadedData.script.hzsInfoMap[this._nextRunPosition[0]];
            if (!hzsInfo)
                throw `Preloaded hzsInfo of path(${this._nextRunPosition[0]}) not found`;
            this._nextRunPosition[1]++;
            if (this._nextRunPosition[1] >= hzsInfo.totalLines)
                this._nextRunPosition = null;
        }
        // Middleware
        _middlewares = (__runInitializers$1(this, __nextRunPosition_extraInitializers), []);
        use(middleware, add_front = false) {
            if (add_front) {
                this._middlewares.unshift(middleware);
            }
            else {
                this._middlewares.push(middleware);
            }
        }
        _processCmd(cmd, nowRunPosition) {
            let ctx = this._buildContext(cmd, nowRunPosition);
            if (this._middlewares.length === 0) {
                this._processUnsolvedCmd(cmd);
                return;
            }
            let i = 0, len = this._middlewares.length;
            let nextFunc = () => {
                i++;
                if (i >= len) {
                    this._processUnsolvedCmd(cmd);
                    return;
                }
                this._middlewares[i](ctx, nextFunc);
            };
            this._middlewares[0](ctx, nextFunc);
        }
        _processUnsolvedCmd(cmd) {
            if (cmd.trim().length === 0)
                return; // Empty Line
            else if (cmd.trim().startsWith("*"))
                return; // Label Command
            else {
                throw `Can not parse command: ${cmd}`;
            }
        }
        _buildContext(cmd, nowRunPosition) {
            return new Script.Context(this._core, cmd, nowRunPosition[0], nowRunPosition[1], this._statementStack);
        }
        // Statement Analyse
        _statementAnalyseStack = [];
        _analyseStatementMiddlewares = [];
        _buildAnalyseStatementContext(cmd, nowRunPosition) {
            return new Script.ContextForAnalyseStatement(this._core, cmd, nowRunPosition[0], nowRunPosition[1], this._statementAnalyseStack);
        }
        useAnalyseStatement(middleware, add_front) {
            if (add_front) {
                this._analyseStatementMiddlewares.unshift(middleware);
            }
            else {
                this._analyseStatementMiddlewares.push(middleware);
            }
        }
        /**
         * 分析statement
         *
         * Analyze the statement syntax and record the script point location and related information in advance.
         * When the script executes a statement, the regular middleware corresponding to that statement will load
         * the information saved by analyseStatement before the statement, and if there is no analysis, it will call
         * analyseStatement to analyze, and the corresponding analysis middleware will process and save the information.
         * After analysis is complete, reset _nextRunPosition to the location before the call, switch back to the normal mode,
         * and continue executing.
         */
        analyseStatement(ctx) {
            // this._core.debug.log("[HZEngine] Start statement analyse mode");
            // Backup _nextRunPosition
            let _nextRunPositionBackup = this
                ._nextRunPosition
                ? [...this._nextRunPosition]
                : null;
            // Set _nextRunPosition to the current position of the statement
            this._nextRunPosition = [ctx.currentPath, ctx.currentLineIndex];
            while (this._nextRunPosition) {
                let rawCommand = readline(this._nextRunPosition[0], this._nextRunPosition[1]);
                if (rawCommand == null)
                    throw `Readline Error(got ${rawCommand}), at file [${this._nextRunPosition[0]}] line [${this._nextRunPosition[1] + 1}]`;
                // If the command is not empty and not a comment
                if (rawCommand.trim().length && !rawCommand.trim().startsWith("#")) {
                    // If it is a label command, check if the statement stack is empty
                    if (rawCommand.trim().startsWith("*")) {
                        if (this._statementStack.length) {
                            throw `label between statement is not allowed, at file [${this._nextRunPosition[0]}] line [${this._nextRunPosition[1] + 1}]`;
                        }
                    }
                    else {
                        // Build context for analyzing statement
                        let sub_ctx = this._buildAnalyseStatementContext(rawCommand, [
                            ...this._nextRunPosition,
                        ]);
                        // console.log(`[HZEngine] analyse statement command [${rawCommand}]`);
                        // Process command
                        if (this._analyseStatementMiddlewares.length === 0) ;
                        else {
                            let i = 0, len = this._analyseStatementMiddlewares.length;
                            let nextFunc = () => {
                                i++;
                                if (i >= len) ;
                                else {
                                    this._analyseStatementMiddlewares[i](sub_ctx, nextFunc);
                                }
                            };
                            this._analyseStatementMiddlewares[0](sub_ctx, nextFunc);
                        }
                    }
                }
                // Move to the next line
                this.incrementNextPosition();
            }
            this._nextRunPosition = _nextRunPositionBackup;
            // Check if the statement stack is empty
            if (this._statementAnalyseStack.length > 0) {
                throw `statement not closed, at file [${this._statementAnalyseStack[this._statementAnalyseStack.length - 1][1][0]}] line [${this._statementAnalyseStack[this._statementAnalyseStack.length - 1][1][1] + 1}]`;
            }
            // Reset _nextRunPosition to the backup value, and switch back to normal mode, and continue executing
            // this._core.debug.logconsole.log("[HZEngine] Finished analyse statement mode ");
        }
        // eval
        evalScope(code) {
            try {
                return new Function("sd", "gd", "hz", `${code}`)(this._core.storage.sd, this._core.storage.gd, this._core);
            }
            catch (e) {
                this._core.debug.log(`Error in evalScope: ${e}`);
            }
        }
        evalExpression(code) {
            this._core.debug.log(`evalExpression: ${code}`);
            try {
                return new Function("sd", "gd", "hz", `return (${code})`)(this._core.storage.sd, this._core.storage.gd, this._core);
            }
            catch (e) {
                this._core.debug.log(`Error in evalExpression: ${e}`);
            }
        }
        // parse string
        parseString(str) {
            let parsedInterpolated = parseInterpolatedStr(str);
            let res = "";
            for (let item of parsedInterpolated) {
                if (item.isExpression) {
                    res += this.evalExpression(item.str);
                }
                else {
                    res += item.str;
                }
            }
            return res;
        }
    };
})();
(function (Script) {
    class Context {
        _core;
        _rawtext;
        currentPath;
        currentLineIndex;
        _statementStack;
        constructor(_core, _rawtext, currentPath, currentLineIndex, _statementStack) {
            this._core = _core;
            this._rawtext = _rawtext;
            this.currentPath = currentPath;
            this.currentLineIndex = currentLineIndex;
            this._statementStack = _statementStack;
        }
        get rawtext() {
            return this._rawtext;
        }
        set rawtext(rawtext) {
            this._rawtext = rawtext;
            this._rawtextChanged = true;
        }
        _rawtextChanged = false;
        _slicedArgs = null;
        get slicedArgs() {
            if (!this._slicedArgs || this._rawtextChanged)
                this._slicedArgs = splitStr2Objs(this.rawtext);
            this._rawtextChanged = false;
            return this._slicedArgs;
        }
        // 注意只有在修改在触发slicedArgs的时候才会更新rawtext
        set slicedArgs(slicedArgs) {
            this._slicedArgs = JSON.parse(JSON.stringify(slicedArgs)); // TODO 深拷贝 性能
            this._rawtext = mergeObjs2Str(slicedArgs);
            // TODO this._rawtextChanged = true ???
        }
        /**
         * 開始一個新的Statement，返回該Statement的數據
         * Start a new statement and return the data of the new statement
         * @param identifier the identifier of the statement
         * @returns the data of the new statement
         */
        startStatement(identifier, data) {
            let statement_data = data ?? this.getStatementData();
            let statementStackItem = [
                identifier,
                [this.currentPath, this.currentLineIndex],
                statement_data,
            ];
            this._statementStack.push(statementStackItem);
            return statement_data;
        }
        endStatement(identifier) {
            if (this._statementStack.length === 0)
                throw `statement not open, at file [${this.currentPath}] line [${this.currentLineIndex + 1}]`;
            if (this._statementStack[this._statementStack.length - 1][0] !== identifier)
                throw `the last statement in the stack is not ${identifier}, at file [${this.currentPath}] line [${this.currentLineIndex + 1}]`;
            return this._statementStack.pop()[2];
        }
        get statementStack() {
            return this._statementStack;
        }
        // statement data will stored in core.storage.globalData.script.statement_data
        // the key of the statement data is the line index of the start statement,
        // for example: the key of the statement data of "menu ... end menu"
        // is stored in the key of the line index of the "menu" statement
        getStatementData() {
            let statement_data_in_file = this._core.storage.getSaveableData(this._core.storage.globalData, true, "script", "statement_data", this.currentPath);
            if (!statement_data_in_file["" + this.currentLineIndex]) {
                this._core.script.analyseStatement(this);
                statement_data_in_file = this._core.storage.getSaveableData(this._core.storage.globalData, true, "script", "statement_data", this.currentPath);
                if (!statement_data_in_file[this.currentLineIndex])
                    throw `analyse statement failed as statement data not found, at file [${this.currentPath}] line [${this.currentLineIndex + 1}]`;
            }
            return statement_data_in_file[this.currentLineIndex];
        }
        setStatementData(statement_data, start_position) {
            let statement_data_in_file = this._core.storage.getSaveableData(this._core.storage.globalData, true, "script", "statement_data", start_position[0]);
            statement_data_in_file["" + start_position[1]] = statement_data;
            this._core.storage.saveGlobalData();
        }
    }
    Script.Context = Context;
    (function (Utils) {
        Utils.joinSlicedArgs = mergeObjs2Str;
        Utils.splitRawtext = splitStr2Objs;
        function splitCommas(rawtext) {
            let slicedArgs = splitStr2Objs(rawtext);
            // console.log(`splitCommas rawtext: ${rawtext}, slicedArgs: ${JSON.stringify(slicedArgs)}`);
            let res = [];
            for (let i = 0; i < slicedArgs.length; i++) {
                if (slicedArgs[i].isQuoted)
                    res.push(`"${slicedArgs[i].str}"`);
                else if (slicedArgs[i].isSquared)
                    res.push(`[${slicedArgs[i].str}]`);
                else if (slicedArgs[i].isRounded)
                    res.push(`(${slicedArgs[i].str})`);
                else {
                    slicedArgs[i].str.split(",").forEach((str) => {
                        str = str.trim();
                        if (str)
                            res.push(str);
                    });
                }
            }
            // console.log(`splitCommas res: ${JSON.stringify(res)}`);
            return res;
        }
        Utils.splitCommas = splitCommas;
        function parseTuple(rawtext) {
            if (rawtext.length < 2 ||
                rawtext[0] !== "(" ||
                rawtext[rawtext.length - 1] !== ")") {
                throw `invalid tuple: ${rawtext}`;
            }
            rawtext = rawtext.slice(1, rawtext.length - 1);
            // console.log(`parseTuple rawtext: ${rawtext}`);
            return parseHzsArgs(rawtext);
        }
        Utils.parseTuple = parseTuple;
        function parseArray(rawtext) {
            if (rawtext.length < 2 ||
                rawtext[0] !== "[" ||
                rawtext[rawtext.length - 1] !== "]") {
                throw `invalid array: ${rawtext}`;
            }
            rawtext = rawtext.slice(1, rawtext.length - 1);
            return parseHzsArgs(rawtext);
        }
        Utils.parseArray = parseArray;
        function parseHzsArgs(rawtext) {
            rawtext = rawtext.trim();
            let arr = splitCommas(rawtext);
            let res = arr.map((str) => {
                if (str.startsWith("("))
                    return parseTuple(str);
                else if (str.startsWith("["))
                    return parseArray(str);
                else
                    return str;
            });
            // console.log(`parseHzsArgs from: "${rawtext}" ; res: ${JSON.stringify(res)}`);
            return res;
        }
        Utils.parseHzsArgs = parseHzsArgs;
    })(Script.Utils || (Script.Utils = {}));
    class ContextForAnalyseStatement extends Context {
        startStatement(identifier, data = {}) {
            return super.startStatement(identifier, data ?? {});
        }
        endStatement(identifier) {
            let statement_data = super.endStatement(identifier);
            // save analysed statement data
            let statement_data_in_file = this._core.storage.getSaveableData(this._core.storage.globalData, true, "script", "statement_data", this.currentPath);
            statement_data_in_file["" + this.currentLineIndex] = statement_data;
            this._core.storage.saveGlobalData();
            return statement_data;
        }
    }
    Script.ContextForAnalyseStatement = ContextForAnalyseStatement;
})(Script || (Script = {}));

var __esDecorate = (undefined && undefined.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __runInitializers = (undefined && undefined.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
const { width: width$4, height: height$4, screenShape: screenShape$4 } = getDeviceInfo();
let UI = (() => {
    let __layerList_decorators;
    let __layerList_initializers = [];
    let __layerList_extraInitializers = [];
    let __nextViewId_decorators;
    let __nextViewId_initializers = [];
    let __nextViewId_extraInitializers = [];
    let __viewMap_decorators;
    let __viewMap_initializers = [];
    let __viewMap_extraInitializers = [];
    let __routerMap_decorators;
    let __routerMap_initializers = [];
    let __routerMap_extraInitializers = [];
    return class UI {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __layerList_decorators = [CustomSave("ui.layerList", function serializer(layerList) {
                    let obj = {};
                    for (let [key, value] of this.layerList) {
                        obj[key] = [value.name, value.z_index];
                    }
                    return obj;
                }, function deserializer(obj) {
                    // destroy old layer
                    for (let [key, value] of this.layerList) {
                        value.destroy();
                    }
                    this.layerList.clear();
                    let newLayerList = new Map();
                    // create new layer
                    for (let key in obj) {
                        let newLayer = new UI.Layer(obj[key][0], obj[key][1]);
                        newLayerList.set(key, newLayer);
                        this._core.emit("afterAddLayer", newLayer);
                    }
                    return newLayerList;
                })];
            __nextViewId_decorators = [Save("ui.nextViewId")];
            __viewMap_decorators = [CustomSave("ui.viewMap", function serializer(viewMap) {
                    let obj = {};
                    for (let [id, view] of viewMap) {
                        // 注意viewMap中的id是number，而obj中的id會自動轉成string
                        if (view.isSave)
                            obj[id] = view.serialize();
                    }
                    return obj;
                }, function deserializer(obj) {
                    let newViewMap = new Map();
                    for (let key in obj) {
                        let item = obj[key];
                        let view = this._produceViewWithId(item.name, item.layer, item.prop, Number(key));
                        view.isSave = true;
                        newViewMap.set(Number(key), view);
                    }
                    return newViewMap;
                })];
            __routerMap_decorators = [CustomSave("ui.routerMap", function serializer(routerMap) {
                    let obj = {};
                    for (let [key, value] of routerMap) {
                        if (!value.isSave)
                            continue;
                        obj[key] = value.serialize();
                    }
                    return obj;
                }, function deserializer(obj) {
                    let newRouterMap = new Map();
                    // reshow not save router
                    for (let [name, router] of this._routerMap) {
                        if (!router.isSave) {
                            if (router.length > 0) {
                                // TODO 因爲讀檔的時候會重置整個ui系統，所以要重新創建activeViewInstance  這裏感覺有點問題
                                router.activeViewInstance = this._core.ui.createView(router.viewStack[0][0], router.layer, router.viewStack[0][1], router.isSave);
                            }
                            newRouterMap.set(name, router);
                        }
                    }
                    // reshow save router
                    for (let key in obj) {
                        newRouterMap.set(key, UI.Router.deserialize(this, obj[key]));
                    }
                    return newRouterMap;
                })];
            __esDecorate(this, null, __layerList_decorators, { kind: "accessor", name: "_layerList", static: false, private: false, access: { has: obj => "_layerList" in obj, get: obj => obj._layerList, set: (obj, value) => { obj._layerList = value; } }, metadata: _metadata }, __layerList_initializers, __layerList_extraInitializers);
            __esDecorate(this, null, __nextViewId_decorators, { kind: "accessor", name: "_nextViewId", static: false, private: false, access: { has: obj => "_nextViewId" in obj, get: obj => obj._nextViewId, set: (obj, value) => { obj._nextViewId = value; } }, metadata: _metadata }, __nextViewId_initializers, __nextViewId_extraInitializers);
            __esDecorate(this, null, __viewMap_decorators, { kind: "accessor", name: "_viewMap", static: false, private: false, access: { has: obj => "_viewMap" in obj, get: obj => obj._viewMap, set: (obj, value) => { obj._viewMap = value; } }, metadata: _metadata }, __viewMap_initializers, __viewMap_extraInitializers);
            __esDecorate(this, null, __routerMap_decorators, { kind: "accessor", name: "_routerMap", static: false, private: false, access: { has: obj => "_routerMap" in obj, get: obj => obj._routerMap, set: (obj, value) => { obj._routerMap = value; } }, metadata: _metadata }, __routerMap_initializers, __routerMap_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _core;
        constructor(_core) {
            __runInitializers(this, __routerMap_extraInitializers);
            this._core = _core;
            this._initUI();
        }
        _initUI() {
            this.addLayer("bg", 1);
            this.addLayer("fg", 2);
            this.addLayer("ct", 3);
            this.addLayer("overlay", 4);
            this.addRouter("page", "overlay", false);
        }
        _cleanUI() {
            for (let [key, value] of this.layerList) {
                value.destroy();
            }
            this.layerList.clear();
            this._routerMap.clear();
        }
        resetUI() {
            this._cleanUI();
            this._initUI();
        }
        #_layerList_accessor_storage = __runInitializers(this, __layerList_initializers, new Map());
        // Layer
        get _layerList() { return this.#_layerList_accessor_storage; }
        set _layerList(value) { this.#_layerList_accessor_storage = value; }
        get layerList() {
            return this._layerList;
        }
        addLayer(name, z_index) {
            this._core.emit("beforeAddLayer", name, z_index);
            if (this._layerList.has(name))
                throw `Layer ${name} already exist`;
            let newLayer = new UI.Layer(name, z_index);
            this._layerList.set(name, newLayer);
            this._core.emit("afterAddLayer", newLayer);
        }
        getLayer(name) {
            return this.layerList.get(name);
        }
        // View Class
        _viewClassMap = (__runInitializers(this, __layerList_extraInitializers), new Map());
        // _activeViewList: [name: string, layer: string, instance: UI.View<unknown>][] =
        //   [];
        registerView(name, cls) {
            this._viewClassMap.set(name, cls);
        }
        #_nextViewId_accessor_storage = __runInitializers(this, __nextViewId_initializers, 50);
        // View
        get _nextViewId() { return this.#_nextViewId_accessor_storage; }
        set _nextViewId(value) { this.#_nextViewId_accessor_storage = value; }
        #_viewMap_accessor_storage = (__runInitializers(this, __nextViewId_extraInitializers), __runInitializers(this, __viewMap_initializers, new Map()));
        get _viewMap() { return this.#_viewMap_accessor_storage; }
        set _viewMap(value) { this.#_viewMap_accessor_storage = value; }
        getView(id) {
            return this._viewMap.get(id) ?? null;
        }
        createView(name, layer, prop, isSave) {
            let id = this._nextViewId++;
            let viewInstance = this._produceViewWithId(name, layer, prop, id);
            this._core.debug.log(`creating view ${viewInstance.name}`);
            viewInstance.isSave = isSave;
            this._viewMap.set(id, viewInstance);
            return viewInstance;
        }
        updateView(viewInstance, new_prop) {
            viewInstance.commit(new_prop);
        }
        destroyView(viewInstance) {
            if (viewInstance.id != null)
                this._viewMap.delete(viewInstance.id);
            viewInstance.destroy();
        }
        /**由調用者提供id，創建一個View，不會處理isSave，也不會更新viewMap */
        _produceViewWithId(name, layer, prop, id) {
            if (!this._viewClassMap.get(name)) {
                throw "要创建的View不存在";
            }
            let _ViewFactory = this._viewClassMap.get(name);
            let viewInstance = new _ViewFactory(layer, this._core);
            viewInstance.id = id;
            viewInstance.name = name;
            viewInstance.create(prop);
            this._core.debug.log(`producing view ${viewInstance.name}`);
            return viewInstance;
        }
        #_routerMap_accessor_storage = (__runInitializers(this, __viewMap_extraInitializers), __runInitializers(this, __routerMap_initializers, new Map()));
        get _routerMap() { return this.#_routerMap_accessor_storage; }
        set _routerMap(value) { this.#_routerMap_accessor_storage = value; }
        getRouter(tag) {
            return this._routerMap.get(tag);
        }
        addRouter(tag, layer, isSave = true) {
            if (this._routerMap.has(tag))
                throw `Route with tag [${tag}] already exist!`;
            let router = new UI.Router(this, tag, layer, isSave);
            this._routerMap.set(tag, router);
            return router;
        }
    };
})();
(function (UI) {
    class View {
        layer;
        core;
        id = null;
        name = null;
        isSave = true;
        _prop = null;
        get prop() {
            return this._prop;
        }
        set prop(prop) {
            this._prop = prop;
        }
        constructor(layer, core) {
            this.layer = layer;
            this.core = core;
        }
        create(prop) {
            this.prop = prop;
            this.onCreate(prop);
        }
        commit(prop) {
            this.prop = prop;
            this.onCommit(prop);
        }
        destroy() {
            this.onDestroy();
            this.prop = null;
            this.id = null;
        }
        serialize() {
            if (this.name == null)
                throw new Error("View name is null when serialize");
            return {
                name: this.name,
                layer: this.layer,
                prop: this.prop,
            };
        }
    }
    UI.View = View;
    function getScreenSize() {
        return {
            width: width$4,
            height: height$4,
        };
    }
    UI.getScreenSize = getScreenSize;
    /**
     * 根据 BasicUniversalProp 计算屏幕上的位置
     * @param prop 包含 BasicUniversalProp 的 prop
     * @param size (可选)图像的尺寸，若不指定，返回的anchor坐标和origin坐标一样
     * @returns
     */
    function calcPosition(prop, size) {
        // 1. 确定 anchor
        // 2. 通过 align 确定初始位置
        // 3. offset
        // 返回左上角的位置
        let anchor_coord = {
            x: (width$4 * ((prop.xalign ?? 0) + 1)) / 2 + // 根据 align 求出 anchor 位置
                (prop.xoffset ?? 0), // offset
            y: (height$4 * ((prop.yalign ?? 0) + 1)) / 2 + // 根据 align 求出 anchor 位置
                (prop.yoffset ?? 0), // offset
        };
        let origin_coord = {
            x: anchor_coord.x - (((prop.xanchor ?? 0) + 1) / 2) * (size?.width ?? 0),
            y: anchor_coord.y - (((prop.yanchor ?? 0) + 1) / 2) * (size?.height ?? 0),
        };
        return {
            anchor: anchor_coord,
            origin: origin_coord,
        };
    }
    UI.calcPosition = calcPosition;
    class MessageView extends View {
    }
    UI.MessageView = MessageView;
    class MenuView extends View {
    }
    UI.MenuView = MenuView;
    class FgImgView extends View {
    }
    UI.FgImgView = FgImgView;
    class BgImgView extends View {
    }
    UI.BgImgView = BgImgView;
    class Layer {
        name;
        z_index;
        widgetFactory;
        constructor(name, z_index) {
            this.name = name;
            this.z_index = z_index;
            this.widgetFactory = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
                scroll_enable: 0,
                z_index,
            });
        }
        destroy() {
            hmUI.deleteWidget(this.widgetFactory);
        }
    }
    UI.Layer = Layer;
    class Router {
        _ui;
        tag;
        layer;
        isSave;
        constructor(_ui, tag, layer, isSave = true) {
            this._ui = _ui;
            this.tag = tag;
            this.layer = layer;
            this.isSave = isSave;
        }
        serialize() {
            return {
                tag: this.tag,
                layer: this.layer,
                isSave: this.isSave,
                viewStack: this.viewStack,
                activeViewId: this.activeViewInstance?.id ?? null,
            };
        }
        defaultRouteStrategy = {
            destroy: (viewInstance, ui) => {
                this._ui._core.debug.log(`destroy view ${viewInstance.name}`);
                ui.destroyView(viewInstance);
            },
            create: (viewName, layer, prop, ui, isSave) => {
                this._ui._core.debug.log(`create view ${viewName}`);
                return ui.createView(viewName, layer, prop, isSave);
            },
            update: (viewInstance, prop, ui) => {
                this._ui._core.debug.log(`update view ${viewInstance.name}`);
                ui.updateView(viewInstance, prop);
            },
        };
        static deserialize(ui, data) {
            let router = new Router(ui, data.tag, data.layer, data.isSave);
            router.viewStack = data.viewStack;
            if (data.activeViewId != null) {
                let viewInstance = ui.getView(data.activeViewId);
                if (!viewInstance)
                    throw `View [${data.activeViewId}] not found when deserialize`;
                router.activeViewInstance = viewInstance;
            }
            return router;
        }
        viewStack = [];
        get length() {
            return this.viewStack.length;
        }
        activeViewInstance = null;
        push(view_name, prop, strategy) {
            if (this.activeViewInstance) {
                // this._ui.destroyView(this.activeViewInstance);
                // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
                //   this.activeViewInstance,
                //   this._ui
                // );
                if (strategy?.destroy) {
                    strategy.destroy(this.activeViewInstance, this._ui);
                }
                else {
                    this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
                }
                this.activeViewInstance = null;
            }
            let layerInstance = this._ui.getLayer(this.layer);
            if (!layerInstance)
                throw `Layer [${this.layer}] not found`;
            // this.activeViewInstance = (
            //   strategy?.create ?? this.defaultRouteStrategy.create!
            // )(view_name, this.layer, prop, this._ui, this.isSave);
            if (strategy?.create) {
                this.activeViewInstance = strategy.create(view_name, this.layer, prop, this._ui, this.isSave);
            }
            else {
                this.activeViewInstance = this.defaultRouteStrategy.create(view_name, this.layer, prop, this._ui, this.isSave);
            }
            this.viewStack.push([view_name, prop]);
        }
        pop(back_prop, strategy) {
            if (this.activeViewInstance) {
                // this._ui.destroyView(this.activeViewInstance);
                // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
                //   this.activeViewInstance,
                //   this._ui
                // );
                if (strategy?.destroy) {
                    strategy.destroy(this.activeViewInstance, this._ui);
                }
                else {
                    this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
                }
                this.activeViewInstance = null;
            }
            this.viewStack.pop();
            if (this.viewStack.length) {
                let backViewInfo = this.viewStack[this.viewStack.length - 1];
                let layerInstance = this._ui.getLayer(this.layer);
                if (!layerInstance)
                    throw `Layer [${this.layer}] not found`;
                // this.activeViewInstance = (
                //   strategy?.create ?? this.defaultRouteStrategy.create!
                // )(
                //   backViewInfo[0],
                //   this.layer,
                //   back_prop ?? backViewInfo[1],
                //   this._ui,
                //   this.isSave
                // );
                if (strategy?.create) {
                    this.activeViewInstance = strategy.create(backViewInfo[0], this.layer, back_prop ?? backViewInfo[1], this._ui, this.isSave);
                }
                else {
                    this.activeViewInstance = this.defaultRouteStrategy.create(backViewInfo[0], this.layer, back_prop ?? backViewInfo[1], this._ui, this.isSave);
                }
            }
        }
        replace(view_name, prop, strategy) {
            if (this.activeViewInstance) {
                // this._ui.destroyView(this.activeViewInstance);
                // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
                //   this.activeViewInstance,
                //   this._ui
                // );
                if (strategy?.destroy) {
                    strategy.destroy(this.activeViewInstance, this._ui);
                }
                else {
                    this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
                }
                this.activeViewInstance = null;
            }
            this.viewStack.pop();
            let layerInstance = this._ui.getLayer(this.layer);
            if (!layerInstance)
                throw `Layer [${this.layer}] not found`;
            // this.activeViewInstance = (
            //   strategy?.create ?? this.defaultRouteStrategy.create!
            // )(view_name, this.layer, prop, this._ui, this.isSave);
            if (strategy?.create) {
                this.activeViewInstance = strategy.create(view_name, this.layer, prop, this._ui, this.isSave);
            }
            else {
                this.activeViewInstance = this.defaultRouteStrategy.create(view_name, this.layer, prop, this._ui, this.isSave);
            }
            this.viewStack.push([view_name, prop]);
        }
        update(prop, strategy) {
            if (!this.activeViewInstance)
                throw `Update View but activeViewInstance is null`;
            this.viewStack[this.viewStack.length - 1][1] = prop;
            // (strategy?.update ?? this.defaultRouteStrategy.update!)(
            //   this.activeViewInstance,
            //   prop,
            //   this._ui
            // );
            if (strategy?.update) {
                strategy.update(this.activeViewInstance, prop, this._ui);
            }
            else {
                this.defaultRouteStrategy.update(this.activeViewInstance, prop, this._ui);
            }
        }
        clear(strategy) {
            if (this.activeViewInstance) {
                // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
                //   this.activeViewInstance,
                //   this._ui
                // );
                if (strategy?.destroy) {
                    strategy.destroy(this.activeViewInstance, this._ui);
                }
                else {
                    this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
                }
                this.activeViewInstance = null;
            }
            this.viewStack = [];
        }
    }
    UI.Router = Router;
})(UI || (UI = {}));

const {
  width: width$3,
  height: height$3,
  screenShape: screenShape$3
} = getDeviceInfo();
var designWidth = 480;
function px$1(raw) {
  return Math.ceil(raw / designWidth * width$3);
}

var util = {
  isString: x => typeof x === "string",
  // 检查是否为字符串
  isObject: x => typeof x === "object"
  // 检查是否为对象
};
function isProtocolPath(path) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(path);
}
function extractProtocol(path) {
  const match = path.match(/^([a-zA-Z][a-zA-Z\d+\-.]*):\/\/(.*)$/);
  if (match) {
    return {
      protocol: match[1],
      // 获取协议
      filepath: match[2]
      // 获取文件路径
    };
  }
  return {
    protocol: null,
    filepath: path
  };
}
function normalizeArray(parts, allowAboveRoot) {
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (!p || p === ".") continue;
    if (p === "..") {
      if (res.length && res[res.length - 1] !== "..") {
        res.pop();
      } else if (allowAboveRoot) {
        res.push("..");
      }
    } else {
      res.push(p);
    }
  }
  return res;
}
function trimArray(arr) {
  var lastIndex = arr.length - 1;
  var start = 0;
  for (; start <= lastIndex; start++) {
    if (arr[start]) break;
  }
  var end = lastIndex;
  for (; end >= 0; end--) {
    if (arr[end]) break;
  }
  if (start === 0 && end === lastIndex) return arr;
  if (start > end) return [];
  return arr.slice(start, end + 1);
}
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var posix = {};
function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}
posix.resolve = function () {
  var resolvedPath = "",
    resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : process.cwd();
    if (!util.isString(path)) {
      throw new TypeError("Arguments to path.resolve must be strings");
    } else if (!path) {
      continue;
    }
    if (isProtocolPath(path)) {
      const {
        protocol,
        filepath
      } = extractProtocol(path);
      resolvedPath = filepath + "/" + resolvedPath;
      resolvedAbsolute = true;
    } else {
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path[0] === "/";
    }
  }
  resolvedPath = normalizeArray(resolvedPath.split("/"), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
};
posix.normalize = function (path) {
  if (isProtocolPath(path)) {
    const {
      protocol,
      filepath
    } = extractProtocol(path);
    return protocol + "://" + normalizeArray(filepath.split("/")).join("/");
  }
  var isAbsolute = posix.isAbsolute(path),
    trailingSlash = path && path[path.length - 1] === "/";
  path = normalizeArray(path.split("/"), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
    path = ".";
  }
  if (path && trailingSlash) {
    path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
};
posix.isAbsolute = function (path) {
  return path.charAt(0) === "/";
};
posix.join = function () {
  var path = "";
  for (var i = 0; i < arguments.length; i++) {
    var segment = arguments[i];
    if (!util.isString(segment)) {
      throw new TypeError("Arguments to path.join must be strings");
    }
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += "/" + segment;
      }
    }
  }
  return posix.normalize(path);
};
posix.relative = function (from, to) {
  from = posix.resolve(from).substr(1);
  to = posix.resolve(to).substr(1);
  var fromParts = trimArray(from.split("/"));
  var toParts = trimArray(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
};
posix.dirname = function (path) {
  var result = posixSplitPath(path),
    root = result[0],
    dir = result[1];
  if (!root && !dir) {
    return ".";
  }
  if (dir) {
    dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
};
posix.basename = function (path, ext) {
  var f = posixSplitPath(path)[2];
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};
posix.extname = function (path) {
  return posixSplitPath(path)[3];
};
posix.format = function (pathObject) {
  if (!util.isObject(pathObject)) {
    throw new TypeError("Parameter 'pathObject' must be an object, not " + typeof pathObject);
  }
  var root = pathObject.root || "";
  if (!util.isString(root)) {
    throw new TypeError("'pathObject.root' must be a string or undefined, not " + typeof pathObject.root);
  }
  var dir = pathObject.dir ? pathObject.dir + posix.sep : "";
  var base = pathObject.base || "";
  return dir + base;
};
posix.parse = function (pathString) {
  if (!util.isString(pathString)) {
    throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
  }
  var allParts = posixSplitPath(pathString);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError("Invalid path '" + pathString + "'");
  }
  allParts[1] = allParts[1] || "";
  allParts[2] = allParts[2] || "";
  allParts[3] = allParts[3] || "";
  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  };
};
posix.sep = "/";
posix.delimiter = ":";

var __defProp$5 = Object.defineProperty;
var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField$5 = (obj, key, value) => __defNormalProp$5(obj, typeof key !== "symbol" ? key + "" : key, value);
const {
  width: width$2,
  height: height$2,
  screenShape: screenShape$2
} = getDeviceInfo();
class CustomSayView extends UI.MessageView {
  constructor() {
    super(...arguments);
    // _fx: Fx | null = null;
    __publicField$5(this, "_widgets", null);
    __publicField$5(this, "enableAnim", true);
    __publicField$5(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
    __publicField$5(this, "_what", null);
    __publicField$5(this, "_animationPlugin", this.core.plugins.get("animation") ?? null);
    __publicField$5(this, "_animationId", null);
  }
  onCreate(prop) {
    let w = screenShape$2 === SCREEN_SHAPE_SQUARE ? width$2 : width$2;
    let h = screenShape$2 === SCREEN_SHAPE_SQUARE ? height$2 / 2 : height$2 / 2;
    this._what = prop.what;
    this._widgets = {
      bg: this._widgetFactory.createWidget(hmUI.widget.IMG, {
        x: (width$2 - w) / 2,
        y: height$2 / 2,
        w,
        h,
        src: posix.join(this.core.storage.projectRoot, "gui", "say_bg.png"),
        auto_scale: true
        // alpha: 128, // only 3.0 support
      }),
      who_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width$2 - w) / 2 + px$1(10),
        y: height$2 / 2,
        w: w - Number(px$1(20)),
        h: px$1(50),
        text_size: px$1(40),
        color: 16777215,
        text: prop.who
      }),
      what_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width$2 - w) / 2 + px$1(10),
        y: height$2 / 2 + Number(px$1(50)),
        w: w - Number(px$1(20)),
        h: height$2 - Number(px$1(50)),
        text_size: px$1(36),
        color: 15921906,
        align_v: hmUI.align.TOP,
        align_h: hmUI.align.CENTER_H,
        text: this.enableAnim ? "" : prop.what,
        text_style: hmUI.text_style.WRAP
      })
    };
    this._widgets.bg.setEnable(false);
    this._widgets.who_text.setEnable(false);
    this._widgets.what_text.setEnable(false);
    this.enableAnim && this._buildAnim();
  }
  onCommit(prop) {
    this._clearAnim();
    this._widgets.who_text.setProperty(hmUI.prop.TEXT, prop.who);
    this._widgets.what_text.setProperty(hmUI.prop.TEXT, this.enableAnim ? "" : prop.what);
    this._what = prop.what;
    this.enableAnim && this._buildAnim();
  }
  onDestroy() {
    this._clearAnim();
    hmUI.deleteWidget(this._widgets.bg);
    hmUI.deleteWidget(this._widgets.who_text);
    hmUI.deleteWidget(this._widgets.what_text);
  }
  _buildAnim() {
    this._clearAnim();
    if (!this._animationPlugin) {
      this.core.debug.log("[SayView]", "Animation Plugin not found");
    }
    Async.nextTick(() => {
      this._animationId = this._animationPlugin?.createTempAnimation({
        profile: [{
          frame: {
            len: 0
          }
        }, {
          time: this._what.length * 0.06,
          wrapper: "linear",
          frame: {
            len: this._what.length
          }
        }],
        onFrame: props => {
          this._widgets?.what_text.setProperty(hmUI.prop.TEXT, this._what?.slice(0, ~~props.len));
        },
        onEnd: () => {
          this.core.debug.log("[SayView]", "\u6253\u5B57\u673A\u7ED3\u675F");
        }
      }) ?? null;
    });
  }
  _clearAnim() {
    if (this._animationId) {
      this._animationPlugin?.clearTempAnimation(this._animationId);
      this._animationId = null;
    }
  }
}
class FgImgView extends UI.FgImgView {
  constructor() {
    super(...arguments);
    __publicField$5(this, "_widget", null);
    __publicField$5(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
    __publicField$5(this, "defaultProp", {
      yanchor: -1,
      yalign: -1
    });
  }
  onCreate(prop) {
    let position = UI.calcPosition({
      ...this.defaultProp,
      ...prop
    }, prop.size).origin;
    this._widget = this._widgetFactory.createWidget(hmUI.widget.IMG, {
      // x: (width - prop.size.width) / 2 + prop.offset.x,
      // y: prop.offset.y,
      ...position,
      src: prop.imgPath,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255)
      }
    });
  }
  onCommit(prop) {
    let position = UI.calcPosition({
      ...this.defaultProp,
      ...prop
    }, prop.size).origin;
    this._widget.setProperty(hmUI.prop.MORE, {
      // x: (width - prop.size.width) / 2 + prop.offset.x,
      // y: prop.offset.y,
      ...position,
      src: prop.imgPath,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255)
      }
    });
  }
  onDestroy() {
    hmUI.deleteWidget(this._widget);
    this._widget = null;
  }
}
class BgImgView extends UI.BgImgView {
  constructor() {
    super(...arguments);
    __publicField$5(this, "_widget", null);
    __publicField$5(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
  }
  _calSize(size) {
    if (size.height >= size.width) {
      let rate = size.height / size.width;
      return {
        width: Number(px$1(480)),
        height: Number(px$1(480)) * rate
      };
    } else {
      let rate = size.width / size.height;
      return {
        width: Number(px$1(480)) * rate,
        height: Number(px$1(480))
      };
    }
  }
  onCreate(prop) {
    let size = this._calSize(prop.size);
    let position = UI.calcPosition(prop, size).origin;
    this._widget = this._widgetFactory.createWidget(hmUI.widget.IMG, {
      // x: (width - size.width) / 2 + prop.offset.x,
      // y: (height - size.height) / 2 + prop.offset.y,
      ...position,
      w: size.width,
      h: size.height,
      src: prop.imgPath,
      auto_scale: true,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255)
      }
    });
  }
  onCommit(prop) {
    let size = this._calSize(prop.size);
    let position = UI.calcPosition(prop, size).origin;
    this._widget.setProperty(hmUI.prop.MORE, {
      // x: (width - size.width) / 2 + prop.offset.x,
      // y: (height - size.height) / 2 + prop.offset.y,
      ...position,
      w: size.width,
      h: size.height,
      src: prop.imgPath,
      auto_scale: true,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255)
      }
    });
  }
  onDestroy() {
    hmUI.deleteWidget(this._widget);
    this._widget = null;
  }
}
class MenuView extends UI.MenuView {
  constructor() {
    super(...arguments);
    __publicField$5(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
    __publicField$5(this, "_buttonWidgetList", null);
  }
  _hideButtons() {
    if (this._buttonWidgetList) {
      for (let i = 0; i < this._buttonWidgetList.length; i++) {
        hmUI.deleteWidget(this._buttonWidgetList[i]);
      }
      this._buttonWidgetList = null;
    }
  }
  _createButtons(prop) {
    this._buttonWidgetList = [];
    let y = Number(px$1(30));
    const h = Number(px$1(60));
    const w = Number(px$1(300));
    const v_space = Number(px$1(20));
    for (let i = 0; i < prop.itemList.length; i++) {
      let itemProp = prop.itemList[i];
      let display = true;
      if (itemProp.enable_js_expression) {
        let res = this.core.script.evalExpression(itemProp.enable_js_expression);
        if (typeof res !== "boolean") {
          throw `Menu View: enable_js_expression return value must be boolean, but got ${typeof res}`;
        }
        display = res;
      }
      let getClickFunc = (index, jump_position) => {
        return () => {
          this.core.script.jump(jump_position[0], jump_position[1] + 1);
          let router = this.core.ui.getRouter("menu");
          if (!router) {
            throw "menu router not found";
          }
          router.pop();
          this.core.system.unBlock();
        };
      };
      if (display) {
        let button = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
          x: (width$2 - w) / 2,
          y,
          w,
          h,
          text: itemProp.text,
          text_size: px$1(36),
          normal_color: 4473924,
          press_color: 6710886,
          click_func: getClickFunc(i, [...itemProp.position])
        });
        button.setAlpha(200);
        this._buttonWidgetList.push(button);
        y += h + v_space;
      }
    }
  }
  onCreate(prop) {
    if (this._buttonWidgetList) {
      this._hideButtons();
    }
    this._createButtons(prop);
  }
  onCommit(prop) {
    if (this._buttonWidgetList) {
      this._hideButtons();
    }
    this._createButtons(prop);
  }
  onDestroy() {
    if (this._buttonWidgetList) {
      this._hideButtons();
    }
  }
}

var __defProp$4 = Object.defineProperty;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
const {
  width: width$1,
  height: height$1,
  screenShape: screenShape$1
} = getDeviceInfo();
class TitleView extends UI.View {
  constructor() {
    super(...arguments);
    __publicField$4(this, "_widgets", null);
    __publicField$4(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
    __publicField$4(this, "_animationPlugin", this.core.plugins.get("animation") ?? null);
    __publicField$4(this, "_animation", null);
    __publicField$4(this, "enable_anim", true);
    __publicField$4(this, "enable_opening_anim", true);
    __publicField$4(this, "opening_view_id", null);
  }
  onCreate(prop) {
    {
      let w = width$1;
      let h = Number(px$1(60));
      let props = {
        x: (width$1 - w) / 2,
        y: Number(px$1(40)),
        w,
        h,
        text_size: px$1(40),
        color: 16777215,
        text: prop.title,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V
      };
      this._widgets = {
        title_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, props)
      };
    }
    {
      let w = Number(px$1(320));
      let h = Number(px$1(60));
      let x = (width$1 - w) / 2;
      let y = Number(px$1(130));
      this._widgets.button_start = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        radius: px$1(15),
        text: getText("start_game"),
        text_size: px$1(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          let black_trans_plugin = this.core.plugins.get("black_trans");
          let start = cb => {
            this.core.ui.getRouter("page").clear();
            this.core.system.start();
            cb && Async.nextTick(cb);
          };
          if (!black_trans_plugin) {
            this.core.debug.log("[TitleView]", "black_trans plugin not found");
            start();
          } else {
            black_trans_plugin.show({
              cb: () => start(() => {
                black_trans_plugin.hide({});
              })
            });
          }
        }
      });
    }
    {
      let w = Number(px$1(320));
      let h = Number(px$1(60));
      let x = (width$1 - w) / 2;
      let y = Number(px$1(210));
      this._widgets.button_load = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        radius: px$1(15),
        text: getText("continue_game"),
        text_size: px$1(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          try {
            this.core.storage.loadArchiveData("archive000.json");
          } catch (e) {
            this.core.debug.log("[TitleView]", "\u8ACB\u5148\u958B\u59CB\u904A\u6232");
            throw e;
          }
          this.core.ui.getRouter("page").pop();
        }
      });
    }
    {
      let w = Number(px$1(320));
      let h = Number(px$1(60));
      let x = (width$1 - w) / 2;
      let y = Number(px$1(290));
      this._widgets.button_gallery = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        radius: px$1(15),
        text: getText("gallery"),
        text_size: px$1(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          hmUI.showToast({
            text: "\u65BD\u5DE5\u4E2D..."
          });
          this.core.ui.getRouter("page").push("gallery", {});
        }
      });
    }
    {
      let w = Number(px$1(320));
      let h = Number(px$1(60));
      let x = (width$1 - w) / 2;
      let y = Number(px$1(370));
      this._widgets.button_settings = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        radius: px$1(15),
        text: getText("settings"),
        text_size: px$1(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          hmUI.showToast({
            text: "\u65BD\u5DE5\u4E2D..."
          });
          this.core.ui.getRouter("page").push("settings", {});
        }
      });
    }
    if (this._animationPlugin) {
      if (this.enable_opening_anim) {
        this.opening_view_id = this.core.ui.createView("info_opening", this.layer, {
          bg_alpha: 1,
          logo_alpha: 0
        }, this.isSave).id;
        let animation = this._animationPlugin.createTempAnimation({
          profile: [{
            frame: {
              bg_alpha: 1,
              logo_alpha: 0
            }
          }, {
            time: 0.5
          }, {
            time: 0.45,
            wrapper: "easein",
            frame: {
              logo_alpha: 1
            }
          }, {
            time: 0.3
          }, {
            time: 1,
            wrapper: "easeout",
            frame: {
              bg_alpha: 0,
              logo_alpha: 0
            }
          }],
          onFrame: prop2 => {
            let view = this.core.ui.getView(this.opening_view_id);
            if (!view) this._animationPlugin?.clearTempAnimation(animation);else view.commit(prop2);
          },
          onEnd: () => {
            let view = this.core.ui.getView(this.opening_view_id);
            if (!view) return;
            this.core.ui.destroyView(view);
          }
        });
      }
    }
    if (this.enable_anim) this._buildAnim();
  }
  onCommit(prop) {
    this._widgets.title_text.setProperty(hmUI.prop.TEXT, prop.title);
  }
  onDestroy() {
    hmUI.deleteWidget(this._widgets.title_text);
    hmUI.deleteWidget(this._widgets.button_start);
    hmUI.deleteWidget(this._widgets.button_load);
    hmUI.deleteWidget(this._widgets.button_gallery);
    hmUI.deleteWidget(this._widgets.button_settings);
    this._widgets = null;
    let view = this.core.ui.getView(this.opening_view_id);
    if (!view) return;
    this.core.ui.destroyView(view);
  }
  _buildAnim() {
    if (!this._animationPlugin) {
      this.core.debug.log("[Title View]", "Animation Plugin not found");
      return;
    }
    if (this._animation != null) return;
    let getFadeinTrack = (delay, key, duration = 0.55) => {
      return [{
        frame: {
          [`${key}_alpha`]: 0,
          [`${key}_xoffset`]: 200
        }
      }, {
        time: delay
      }, {
        time: duration,
        wrapper: "easein",
        frame: {
          [`${key}_alpha`]: 1,
          [`${key}_xoffset`]: 0
        }
      }];
    };
    let delayList = Array(5).fill(0).map((_, i) => i * 0.16 + 1.5);
    this._animation = this._animationPlugin.createTempAnimation({
      profile: [getFadeinTrack(delayList[0], "text"), getFadeinTrack(delayList[1], "button_start"), getFadeinTrack(delayList[2], "button_load"), getFadeinTrack(delayList[3], "button_gallery"), getFadeinTrack(delayList[4], "button_settings")],
      onFrame: props => {
        let w = Number(px$1(320));
        let x = (width$1 - w) / 2;
        if (!this._widgets) this._clearAnim();
        this._widgets.title_text.setAlpha(~~((props.text_alpha ?? 1) * 255));
        this._widgets.title_text.setProperty(hmUI.prop.X, ~~(props.text_xoffset ?? 0));
        this._widgets.button_start.setAlpha(~~((props.button_start_alpha ?? 1) * 255));
        this._widgets.button_start.setProperty(hmUI.prop.X, ~~(x + (props.button_start_xoffset ?? 0)));
        this._widgets.button_load.setAlpha(~~((props.button_load_alpha ?? 1) * 255));
        this._widgets.button_load.setProperty(hmUI.prop.X, ~~(x + (props.button_load_xoffset ?? 0)));
        this._widgets.button_gallery.setAlpha(~~((props.button_gallery_alpha ?? 1) * 255));
        this._widgets.button_gallery.setProperty(hmUI.prop.X, ~~(x + (props.button_gallery_xoffset ?? 0)));
        this._widgets.button_settings.setAlpha(~~((props.button_settings_alpha ?? 1) * 255));
        this._widgets.button_settings.setProperty(hmUI.prop.X, ~~(x + (props.button_settings_xoffset ?? 0)));
      }
    });
  }
  _clearAnim() {
    if (this._animation != null) {
      this._animationPlugin.clearTempAnimation(this._animation);
      this._animation = null;
    }
  }
}
class InfoOpening extends UI.View {
  constructor() {
    super(...arguments);
    __publicField$4(this, "_widgets", {});
    __publicField$4(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
  }
  onCreate(prop) {
    this._widgets.bg = this._widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width$1,
      h: height$1,
      color: 0
    });
    this._widgets.logo = this._widgetFactory.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 0,
      w: width$1,
      h: height$1,
      text_size: px$1(42),
      text: "HZ-Engine Demo",
      color: 15658734,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });
    this._widgets.bg.setAlpha(~~((prop?.bg_alpha ?? 1) * 255));
    this._widgets.logo.setAlpha(~~((prop?.logo_alpha ?? 1) * 255));
  }
  onCommit(prop) {
    this._widgets.bg.setAlpha(~~((prop?.bg_alpha ?? 1) * 255));
    this._widgets.logo.setAlpha(~~((prop?.logo_alpha ?? 1) * 255));
  }
  onDestroy() {
    hmUI.deleteWidget(this._widgets.bg);
    hmUI.deleteWidget(this._widgets.logo);
  }
}

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
const {
  width,
  height,
  screenShape
} = getDeviceInfo();
class QuickMenu extends UI.View {
  constructor() {
    super(...arguments);
    __publicField$3(this, "_widgets", null);
    __publicField$3(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
  }
  onCreate(prop) {
    this._widgets = {};
    {
      this._widgets.mask = this._widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: width,
        h: height,
        color: 0,
        alpha: 192
      });
    }
    {
      let w = width;
      let h = Number(px$1(60));
      this._widgets.title_text = this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width - w) / 2,
        y: Number(px$1(40)),
        w,
        h,
        text_size: px$1(40),
        color: 16777215,
        text: getText("quick_menu"),
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V
      });
    }
    {
      let w = Number(px$1(320));
      let h = Number(px$1(60));
      let x = (width - w) / 2;
      let y = Number(px$1(130));
      this._widgets.button_start = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        text: getText("quick_save"),
        text_size: px$1(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          if (this.core.storage.projectRoot == null) {
            hmUI.showToast({
              text: "\u8BF7\u5148\u6253\u5F00\u9879\u76EE"
            });
            return;
          }
          try {
            this.core.storage.saveArchiveData("archive_quick.json");
          } catch (e) {
            hmUI.showToast({
              text: "\u5FEB\u901F\u5B58\u6863\u5931\u8D25"
            });
            this.core.debug.log("[QuickMenu]", `quick save failed, error: 
${e}`);
            throw e;
          }
          hmUI.showToast({
            text: "\u5FEB\u901F\u5B58\u6863\u6210\u529F"
          });
        }
      });
    }
    {
      let w = Number(px$1(320));
      let h = Number(px$1(60));
      let x = (width - w) / 2;
      let y = Number(px$1(210));
      this._widgets.button_load = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        text: getText("quick_load"),
        text_size: px$1(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          if (this.core.storage.projectRoot == null) {
            hmUI.showToast({
              text: "\u8BF7\u5148\u6253\u5F00\u9879\u76EE"
            });
            return;
          }
          try {
            this.core.storage.loadArchiveData("archive_quick.json");
          } catch (e) {
            hmUI.showToast({
              text: "\u5FEB\u901F\u8BFB\u6863\u5931\u8D25"
            });
            this.core.debug.log("[QuickMenu]", `quick load failed, error: 
${e}`);
            throw e;
          }
          hmUI.showToast({
            text: "\u5FEB\u901F\u8BFB\u6863\u6210\u529F"
          });
          this.core.ui.getRouter("page").pop();
        }
      });
    }
    {
      let w = Number(px$1(320));
      let h = Number(px$1(60));
      let x = (width - w) / 2;
      let y = Number(px$1(290));
      this._widgets.button_gallery = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        text: getText("archive_page"),
        text_size: px$1(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          hmUI.showToast({
            text: "\u65BD\u5DE5\u4E2D..."
          });
        }
      });
    }
    {
      let w = Number(px$1(320));
      let h = Number(px$1(60));
      let x = (width - w) / 2;
      let y = Number(px$1(370));
      this._widgets.button_settings = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        text: getText("settings"),
        text_size: px$1(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          hmUI.showToast({
            text: "\u65BD\u5DE5\u4E2D..."
          });
        }
      });
    }
  }
  onCommit(prop) {}
  onDestroy() {
    hmUI.deleteWidget(this._widgets.mask);
    hmUI.deleteWidget(this._widgets.title_text);
    hmUI.deleteWidget(this._widgets.button_start);
    hmUI.deleteWidget(this._widgets.button_load);
    hmUI.deleteWidget(this._widgets.button_gallery);
    hmUI.deleteWidget(this._widgets.button_settings);
    this._widgets = null;
  }
}

const hmLogger = log.getLogger("AsukaUI");
({
  log: hmLogger.log,
  warn: hmLogger.warn,
  error: hmLogger.error,
  info: hmLogger.info,
  debug: hmLogger.debug
});
function assert(success) {
  try {
    if (typeof success === "function")
      success = success();
    if (!success) {
      throw Error("Assert Failed");
    }
  } catch (e) {
    reportError("Assert Failed", e);
  }
}
function reportError(extra, err) {
  console.log("Reporting Error...");
  let bg = hmUI__default.createWidget(hmUI__default.widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: px(480),
    h: px(480),
    color: 13654391
  });
  hmUI__default.createWidget(hmUI__default.widget.TEXT, {
    x: px(0),
    y: px(20),
    w: px(480),
    h: px(80),
    text: "ERROR!",
    text_size: px(60),
    font: "fonts/UbuntuMono-Bold.ttf",
    color: 16579836,
    align_h: hmUI__default.align.CENTER_H,
    align_v: hmUI__default.align.CENTER_V
  });
  let y = px(100);
  y += showSubtitle(extra, y) + px(10);
  y += showSubtitle("Error Name", y) + px(5);
  y += showCode(err.name ?? "No Name Founded", y) + px(10);
  y += showSubtitle("Error Message", y) + px(5);
  y += showCode(err.message ?? "No Message Founded", y) + px(10);
  y += showSubtitle("Error Stack", y) + px(5);
  y += showCode(err.stack ?? "No Stack Founded", y) + px(10);
  bg.setProperty(hmUI__default.prop.MORE, {
    x: 0,
    y: 0,
    w: px(480),
    h: y + px(200)
  });
  throw err;
}
const px = (p) => Number(px$2(p));
const SubTitleTextSize = px(36);
const SubTitleTextWidth = px(400);
function showSubtitle(text, offsetY) {
  let { width, height } = hmUI__default.getTextLayout(text, {
    text_size: px(42),
    text_width: SubTitleTextWidth,
    // font: "fonts/UbuntuMono-Regular.ttf",
    wrapped: 1
  });
  hmUI__default.createWidget(hmUI__default.widget.TEXT, {
    x: px(40),
    y: offsetY,
    w: px(400),
    h: height,
    text,
    text_size: SubTitleTextSize,
    text_style: hmUI__default.text_style.WRAP,
    font: "fonts/UbuntuMono-Bold.ttf",
    color: 16579836,
    // align_h: hmUI.align.CENTER_H,
    align_v: hmUI__default.align.BOTTOM
  });
  return height;
}
const CodeTextSize = px(30);
const CodeTextWidth = px(370);
function showCode(text, offsetY) {
  let { width, height } = hmUI__default.getTextLayout(text, {
    text_size: px(30),
    text_width: CodeTextWidth,
    // font: "fonts/UbuntuMono-Regular.ttf",
    wrapped: 1
  });
  if (height < px(45))
    height = px(45);
  hmUI__default.createWidget(hmUI__default.widget.FILL_RECT, {
    x: px(40),
    y: offsetY,
    w: px(400),
    radius: px(8),
    h: height,
    color: 7284289
  });
  hmUI__default.createWidget(hmUI__default.widget.TEXT, {
    x: px(55),
    y: offsetY,
    w: CodeTextWidth,
    h: height,
    text,
    text_size: CodeTextSize,
    text_style: hmUI__default.text_style.WRAP,
    font: "fonts/UbuntuMono-Regular.ttf",
    color: 15658734,
    // align_h: hmUI.align.CENTER_H,
    align_v: hmUI__default.align.CENTER_V
  });
  return height;
}

function min(a, b) {
  return a <= b ? a : b;
}
function max(a, b) {
  return a >= b ? a : b;
}

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
class Constraints {
  constructor({ minHeight = 0, maxHeight = Number.POSITIVE_INFINITY, minWidth = 0, maxWidth = Number.POSITIVE_INFINITY }) {
    __publicField$2(this, "minHeight");
    __publicField$2(this, "maxHeight");
    __publicField$2(this, "minWidth");
    __publicField$2(this, "maxWidth");
    if (isNaN(minHeight ?? NaN))
      minHeight = 0;
    if (isNaN(minWidth ?? NaN))
      minWidth = 0;
    if (isNaN(maxHeight ?? NaN))
      maxHeight = 0;
    if (isNaN(maxWidth ?? NaN))
      maxWidth = 0;
    if (minHeight < 0)
      minHeight = 0;
    if (minWidth < 0)
      minWidth = 0;
    if (maxHeight < minHeight)
      maxHeight = minHeight;
    if (maxWidth < minWidth)
      maxWidth = minWidth;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
  }
  /**
   * **创建一个严格约束**
   * @description 给定一个`Size`对象，返回一个`Constraints`对象，
   * 使得满足该`Constraints`约束的`Size`仅有给定的`Size`一种
   * @param size
   * @returns
   */
  static createTight(size) {
    return new Constraints({
      minWidth: size.w,
      maxWidth: size.w,
      minHeight: size.h,
      maxHeight: size.h
    });
  }
  static isValid(constraints) {
    return constraints != null && !(isNaN(constraints.minHeight ?? NaN) || isNaN(constraints.minWidth ?? NaN) || isNaN(constraints.maxHeight ?? NaN) || isNaN(constraints.maxWidth ?? NaN)) && constraints.minHeight >= 0 && constraints.minWidth >= 0 && constraints.minHeight <= constraints.maxHeight && constraints.minWidth <= constraints.maxWidth;
  }
  static copy(constraints) {
    return new Constraints({
      minWidth: constraints.minWidth,
      maxWidth: constraints.maxWidth,
      minHeight: constraints.minHeight,
      maxHeight: constraints.maxHeight
    });
  }
  copy() {
    return new Constraints({
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight
    });
  }
  /**
   * 返回一个新的约束对象，使其在遵守原约束对象的同时尽可能向指定的长宽缩进
   * @param param0
   */
  tighten({ width, height }) {
    let constraints = this.copy();
    if (width !== void 0) {
      if (width > this.minWidth)
        constraints.minWidth = min(width, this.maxWidth);
      if (width < this.maxWidth)
        constraints.maxWidth = max(width, this.minWidth);
    }
    if (height !== void 0) {
      if (height > this.minHeight)
        constraints.minHeight = min(height, this.maxHeight);
      if (height < this.maxHeight)
        constraints.maxHeight = max(height, this.minHeight);
    }
    return constraints;
  }
  /**
   * **约束操作**
   * @description
   * 将给定的Size对象以最小改动约束至该Constraints
   *
   * **将直接修改源对象**
   * @param size 需要约束的Size对象
   */
  constrain(size) {
    if (size.w < this.minWidth)
      size.w = this.minWidth;
    else if (size.w > this.maxWidth)
      size.w = this.maxWidth;
    if (size.h < this.minHeight)
      size.h = this.minHeight;
    else if (size.h > this.maxHeight)
      size.h = this.maxHeight;
    return size;
  }
  /**
   * **适应操作**
   * @description
   * 将该Constraints通过最小改动符合给定的Constraints
   *
   * **将直接修改源对象**
   * @param size 需要约束的Size对象
   */
  adoptBy(constrain) {
    assert(Constraints.isValid(constrain));
    if (this.minWidth < constrain.minWidth)
      this.minWidth = constrain.minWidth;
    else if (this.minWidth > constrain.maxWidth)
      this.minWidth = constrain.maxWidth;
    if (this.maxWidth > constrain.maxWidth)
      this.maxWidth = constrain.maxWidth;
    else if (this.maxWidth < constrain.minWidth)
      this.maxWidth = constrain.minWidth;
    if (this.minHeight < constrain.minHeight)
      this.minHeight = constrain.minHeight;
    else if (this.minHeight > constrain.maxHeight)
      this.minHeight = constrain.maxHeight;
    if (this.maxHeight > constrain.maxHeight)
      this.maxHeight = constrain.maxHeight;
    else if (this.maxHeight < constrain.minHeight)
      this.maxHeight = constrain.minHeight;
    return this;
  }
  /**
   * **宽松化**
   * @description
   * 将`minHeight`和`minWidth`的限制去除（设为0），返回一个新Constrains对象，不会改变原Constrains对象
   * @returns 宽松化后的Constrains对象
   */
  loose() {
    return new Constraints({
      maxHeight: this.maxHeight,
      maxWidth: this.maxWidth
    });
  }
  /**
   * **返回符合该约束的最大尺寸**
   */
  get biggest() {
    return {
      w: this.maxWidth,
      h: this.maxHeight
    };
  }
  /**
   * **返回符合该约束的最小尺寸**
   */
  get smallest() {
    return {
      w: this.minWidth,
      h: this.minHeight
    };
  }
  /**
   * **是否为严格约束**
   * @description
   * 即`minHeight`与`maxHeight`是否相等，且`minWidth`与`maxWidth`是否相等
   */
  get isTight() {
    return this.minHeight === this.maxHeight && this.minWidth === this.maxWidth;
  }
  /**
   * **判断两个Constrains对象是否相等**
   * @description
   * 当两个Constrains对象的`minHeight`、`maxHeight`、`minWidth`、`maxWidth`均相等时，返回true，否则为false
   * @param other 另一个Constrains对象
   * @returns 两个Constraints是否相等（当other参数为null时始终返回false）
   */
  equals(other) {
    return other != null && other.minHeight === this.minHeight && other.maxHeight === this.maxHeight && other.minWidth === this.minWidth && other.maxWidth === this.maxWidth;
  }
  toString() {
    return JSON.stringify({
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight
    });
  }
  /**
   * **检测一个`Size`对象是否符合本约束要求**
   * @param size 要检测的`Size`对象
   */
  testSize(size) {
    return size.h >= this.minHeight && size.h <= this.maxHeight && size.w >= this.minWidth && size.w <= this.maxWidth;
  }
}
class Size {
  static equals(size1, size2) {
    if (size1 == null && size2 == null)
      return true;
    else if (size1 == null || size2 == null)
      return false;
    return size1.w === size2.w && size1.h === size2.h;
  }
  static isValid(size) {
    return size != null && size.h >= 0 && size.w >= 0 && isFinite(size.h) && isFinite(size.w);
  }
  /**
   * **判断一个`Size`对象是不是有穷的**
   * @param size 要判断的`Size`对象
   * @returns 是否有穷
   */
  static isFinite(size) {
    return Number.isFinite(size.w) && Number.isFinite(size.h);
  }
  static copy(size) {
    assert(size != null);
    return { ...size };
  }
  /**
   * **分别相加两个`Size`对象的长和宽，并返回一个新对象.**
   *
   * 注意
   * - 传递空值会报错，但没判断是否合法.
   * @param size1
   * @param size2
   * @returns 累加后的新对象
   */
  static add(size1, size2) {
    assert(size1 != null && size2 != null);
    return {
      w: size1.w + size2.w,
      h: size1.h + size2.h
    };
  }
  /**
   * **分别相减两个`Size`对象的长和宽，并返回一个新对象.**
   *
   * 注意
   * - 传递空值会报错，但没判断是否合法.
   * @param size1
   * @param size2
   * @returns 累加后的新对象
   */
  static remove(size1, size2) {
    assert(size1 != null && size2 != null);
    return {
      w: size1.w - size2.w,
      h: size1.h - size2.h
    };
  }
  static get infinite() {
    return {
      w: Number.POSITIVE_INFINITY,
      h: Number.POSITIVE_INFINITY
    };
  }
}
class Coordinate {
  static copy(coord) {
    assert(coord != null);
    return { ...coord };
  }
  static isValid(coord) {
    return coord != null && isFinite(coord.x) && isFinite(coord.y);
  }
  static origin() {
    return { x: 0, y: 0 };
  }
  static equals(coord1, coord2) {
    if (coord1 == null && coord2 == null)
      return true;
    else if (coord1 == null || coord2 == null)
      return false;
    return coord1.x === coord2.x && coord1.y === coord2.y;
  }
  /**
   * **分别相加两个`Coordinate`对象的`x`和`y`，并返回一个新对象.**
   *
   * 注意
   * - 传递空值会报错，但没判断是否合法.
   * @param coord1
   * @param coord2
   * @returns 累加后的新对象
   */
  static add(coord1, coord2) {
    assert(coord1 != null && coord2 != null);
    return {
      x: coord1.x + coord2.x,
      y: coord1.y + coord2.y
    };
  }
}
var Axis;
(function(Axis2) {
  Axis2[Axis2["horizontal"] = 0] = "horizontal";
  Axis2[Axis2["vertical"] = 1] = "vertical";
})(Axis || (Axis = {}));
var MainAxisAlignment;
(function(MainAxisAlignment2) {
  MainAxisAlignment2[MainAxisAlignment2["start"] = 0] = "start";
  MainAxisAlignment2[MainAxisAlignment2["end"] = 1] = "end";
  MainAxisAlignment2[MainAxisAlignment2["center"] = 2] = "center";
  MainAxisAlignment2[MainAxisAlignment2["spaceBetween"] = 3] = "spaceBetween";
  MainAxisAlignment2[MainAxisAlignment2["spaceAround"] = 4] = "spaceAround";
  MainAxisAlignment2[MainAxisAlignment2["spaceEvenly"] = 5] = "spaceEvenly";
})(MainAxisAlignment || (MainAxisAlignment = {}));
var CrossAxisAlignment;
(function(CrossAxisAlignment2) {
  CrossAxisAlignment2[CrossAxisAlignment2["start"] = 0] = "start";
  CrossAxisAlignment2[CrossAxisAlignment2["end"] = 1] = "end";
  CrossAxisAlignment2[CrossAxisAlignment2["center"] = 2] = "center";
  CrossAxisAlignment2[CrossAxisAlignment2["stretch"] = 3] = "stretch";
  CrossAxisAlignment2[CrossAxisAlignment2["baseline"] = 4] = "baseline";
})(CrossAxisAlignment || (CrossAxisAlignment = {}));
var MainAxisSize;
(function(MainAxisSize2) {
  MainAxisSize2[MainAxisSize2["min"] = 0] = "min";
  MainAxisSize2[MainAxisSize2["max"] = 1] = "max";
})(MainAxisSize || (MainAxisSize = {}));
var HorizontalDirection;
(function(HorizontalDirection2) {
  HorizontalDirection2[HorizontalDirection2["ltr"] = 0] = "ltr";
  HorizontalDirection2[HorizontalDirection2["rtl"] = 1] = "rtl";
})(HorizontalDirection || (HorizontalDirection = {}));
var VerticalDirection;
(function(VerticalDirection2) {
  VerticalDirection2[VerticalDirection2["up"] = 0] = "up";
  VerticalDirection2[VerticalDirection2["down"] = 1] = "down";
})(VerticalDirection || (VerticalDirection = {}));
var TextBaseline;
(function(TextBaseline2) {
  TextBaseline2[TextBaseline2["alphabetic"] = 0] = "alphabetic";
  TextBaseline2[TextBaseline2["ideographic"] = 1] = "ideographic";
})(TextBaseline || (TextBaseline = {}));
var FlexFit;
(function(FlexFit2) {
  FlexFit2[FlexFit2["tight"] = 0] = "tight";
  FlexFit2[FlexFit2["loose"] = 1] = "loose";
})(FlexFit || (FlexFit = {}));
var StackFit;
(function(StackFit2) {
  StackFit2[StackFit2["loose"] = 0] = "loose";
  StackFit2[StackFit2["expand"] = 1] = "expand";
  StackFit2[StackFit2["passthrough"] = 2] = "passthrough";
})(StackFit || (StackFit = {}));

const NodeType = {
  TEXT_NODE: 1,
  RENDER_NODE: 2,
  UNKNOWN_NODE: 4
};
function isRenderNode(node) {
  return node === null ? false : node.nodeType === NodeType.RENDER_NODE;
}

function splice(arr, ref, add, byValueOnly) {
  let i = arr ? findWhere(arr, ref, true, byValueOnly) : -1;
  if (~i)
    arr.splice(i, 1);
  return i;
}
function findWhere(arr, ref, returnIndex, byValueOnly) {
  let i = arr.length;
  while (i--)
    if (typeof ref !== "function" || byValueOnly ? arr[i] === ref : ref(arr[i]))
      break;
  return returnIndex ? i : arr[i];
}

var __defProp$1 = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _key;
class AsukaNode {
  // /** 直接前继节点 */
  // public previousSibling: AsukaNode | null = null;
  // /** 直接后继节点 */
  // public nextSibling: AsukaNode | null = null;
  constructor(nodeType, nodeName) {
    __publicField$1(this, "nodeType");
    __publicField$1(this, "nodeName");
    /** 父节点 */
    __publicField$1(this, "parentNode", null);
    /**
     * **父节点数据插槽**
     * @description
     * 用于存储父节点希望子节点存储的信息。
     *
     * 由于子模型无关、布局算法高度自定义等特点，出现父节点需要子节点存储数据的情况十分常见，故提供本插槽属性。
     * 将在`mountChild`时调用的`_setupMountingChild`中赋值为`{}`(空对象)进行初始化，并在`unmountChild`时调用的`_setupUnmounting`中赋值为`null`进行清除。
     * 其他任何时候，框架不会访问或改变它。
     *
     * 举例：多个采用双向链表存储子节点时诸如`nextSibling`，`previousSibling`等。
     */
    __publicField$1(this, "parentData");
    this.nodeType = nodeType;
    this.nodeName = nodeName;
  }
  get nextSibling() {
    if (this.parentNode === null)
      return null;
    return this.parentNode.getChildNextSibling(this);
  }
  /**------------------属性设置------------------- */
  /**
   * **设置元素属性**
   * @param key 属性键
   * @param value 属性值
   */
  setProperty(key, value) {
  }
  setProperties(props) {
    for (const key in props) {
      this.setProperty(key, props[key]);
    }
  }
}
class AsukaTextNode extends AsukaNode {
  constructor(text) {
    super(NodeType.TEXT_NODE, "#text");
    __publicField$1(this, "_text");
    this._text = text;
  }
  /**
   * 该文字节点保存的字符串
   */
  set data(text) {
    this._text = text;
  }
  get data() {
    return this._text;
  }
  get firstChild() {
    return null;
  }
  getChildNextSibling(child) {
    return null;
  }
  mountChild(child, ref) {
    return false;
  }
  unmountChild(child) {
    return false;
  }
}
class RenderNode extends AsukaNode {
  // protected _attributes: {};
  constructor(nodeTyle, nodeName) {
    super(nodeTyle || NodeType.RENDER_NODE, nodeName);
    __publicField$1(this, "_handlers", {});
    // {
    //   if (ref) splice(this.childNodes, ref, child);
    //   else this.childNodes.push(child);
    //   this._setupChild(child)
    //   return child;
    // }
    /**------------------布局相关------------------- */
    /**
     * **需要布局(布局脏标记)**
     *
     * 框架应保证执行布局操作时，所有非孤立且拥有布局脏标记的节点的`layout`都被调用，并将脏标记清除，并且应迅速(在下一个JS事件循环时)
     * 若为孤立且拥有脏标记的节点，在转为非孤立状态后应立即请求布局，并在下一个JS事件循环时调用其`layout`，并清除脏标记。
     *
     * 框架保证，拥有脏标记的节点在`layout`过程中，其`performLayout`被调用（如果`sizedByParent`为`true`，还保证其`performResize`被调用）。
     * 通常，所有可能使布局发生变化的操作，都应当做布局脏标记(调用`markNeedsLayout`)
     */
    __publicField$1(this, "_needsLayout", false);
    /**
     * **需要确认最终位置(放置脏标记)**
     *
     * 框架应保证执行确认最终位置操作(简称放置操作)时，所有非孤立且拥有放置脏标记的节点的`place`都被调用，并将脏标记清除，并且应迅速(在下一个JS事件循环时)
     * 若为孤立且拥有脏标记的节点，在转为非孤立状态后应立即请求放置，并在下一个JS事件循环时调用其`place`，并清除脏标记。
     *
     * 框架保证，拥有脏标记的节点在`place`过程中，其`position`会得到更新，并根据情况执行`performCommit`操作.
     *
     * @see markNeedsPlace 更多有关`放置脏标记`的原理，请参见该方法
     */
    __publicField$1(this, "_needsPlace", false);
    /**
     * **必须执行推送操作(强制更新标记)**
     *
     * 框架应保证所有非孤立且拥有强制更新标记的节点的`performCommit`和`onCommit`都被调用，并将该标记清除，并且应迅速(在下一个JS事件循环时，`place`过程中)
     * 若为孤立且拥有脏标记的节点，在转为非孤立状态后应立即请求放置，并在下一个JS事件循环时的`place`时执行推送操作，并清除脏标记。
     */
    __publicField$1(this, "_mustCommit", false);
    /**
     * **本节点的深度**
     *
     * 定义`AsukaUI`的深度为`0`.
     *
     * 仅当`_attached`为`true`，即不为孤立节点时有效
     *
     * 主要用于在`AsukaUI`执行`layout`和`place`操作时确定先后顺序（深度小的节点先，深度大的节点后），保证不重复计算并正确.
     *
     * 在`attach`时更新
     */
    __publicField$1(this, "_depth", 0);
    /**
     * **本节点尺寸**
     *
     * 请勿直接修改本属性，而是通过`size`(getter/setter)修改或访问
     */
    __publicField$1(this, "_size", null);
    /**
     * **本节点尺寸是否已改变**
     *
     * 用途：
     * - 在`size`setter中判断并标记为`true`.
     * - 在`place`方法中用于判断是否需要执行`performCommit`操作，并将其标记为`false`
     */
    __publicField$1(this, "_sizeChanged", false);
    /**
     * **相对父节点的坐标偏移**
     *
     * 请勿直接修改本属性，而是通过`offset`(getter/setter)修改或访问
     */
    __publicField$1(this, "_offset", null);
    /**
     * **该节点在当前坐标系的位置**
     *
     * 请勿直接修改本属性，而是通过`position`(getter/setter)修改或访问
     */
    __publicField$1(this, "_position", null);
    /**
     * **局部重布局边界**
     * @description
     * 当子树添加脏标记时，重布局边界节点不会调用`markParentNeedsLayout`将脏标记传递给父节点；
     * 而是阻止向上传递，（非孤立时）向框架中心请求布局，并将自身加入待布局列表。
     *
     * 无论是否孤立，若`_relayoutBoundary`不为`null`，就应保证该属性指向的节点与本节点连通。
     *
     * 局部重布局边界需要保证其子树的布局发生变化时(不考虑挂载等非布局操作)，不会影响其父节点的布局结果，即父节点不需要重新布局。
     *
     * 具体而言，满足以下四种条件其一的节点，可作为为局部重布局边界。
     * 1. `sizedByParent == true` 由于布局过程从子节点传递到父节点的信息仅有子节点尺寸，且该节点的尺寸仅由父节点提供的布局约束有关，
     * 因此，该节点的子树的布局发生变化时，父节点的布局结果不变，可作为为局部重布局边界。
     * 2. `parentUsesSize == false` 父节点布局过程不计算和使用子节点尺寸，也就是子节点子树发生的任何布局变化即使令该子节点的尺寸发生变化，
     * 也不影响父节点的布局结果。
     * 3. `constraints.isTight` 父节点传递的布局约束为严格约束（最大和最小宽度相等且最大和最小高度相等，符合该约束的尺寸仅有一种），
     * 4. `!isRenderNode(this.parentNode)` 父节点不是可渲染节点，故布局只能从本节点开始。
     *
     */
    __publicField$1(this, "_relayoutBoundary", null);
    /**
     * **为子节点提供新的坐标系**
     * @description
     * 若为`false`, 子节点的`position`将等于其`offset`加上本节点的`position`；
     * 若为`true`，子节点的`position`将直接等于其`offset`（相当于本节点为子节点的坐标系原点）
     *
     * 用于如`ViewContainer`这样的为子节点提供了新的坐标参考系的组件中
     *
     * **请务必在对象初始化完成前确定，后续不应再修改**，若为`true`，
     *
     * 请考虑在`performLayout`中调用子节点的`layout`时传递为子节点提供的控件工厂(可能是`hmUI.widget.GROUP`或`VIEW_CONTAINER`之类的实例).
     */
    __publicField$1(this, "isNewCoordOrigin", false);
    /**
     * **上一次`layout`时获得的控件工厂**
     * @description
     * 所谓控件工厂，是指`hmUI`、`GROUP`实例或`VIEW_CONTAINER`实例等，拥有符合接口要求的`createWidget`和`deleteWidget`的方法的对象。
     * 请注意区分`hmUI`中的其他方法，控件工厂不一定都实现了这些方法。
     *
     * 在下一次`layout`或取消挂载或转为孤立树等发生前有效。
     */
    __publicField$1(this, "_widgetFactory", null);
    /**
     * **上一次`layout()`时获得的布局约束**
     * @description 布局约束，是指该节点的尺寸的允许范围。
     * 布局约束由`minHeight`，`maxHeight`，`minWidth`和`maxWidth`四个属性构成，详见`Constraints`
     *
     * 应仅当从未布局过时为`null`，其它任何时候都不得将该变量设置为空.
     */
    __publicField$1(this, "_constraints", null);
    /**
     * **渲染就绪状态**
     *
     * 即子节点是否被挂载在可渲染的树上（即根节点是否连接了AsukaUI）
     *
     * 仅当该属性为`true`时，才注册重新布局请求(即调用 `AsukaUI#addRelayoutNode` 或 `AsukaUI#requestRelayout` 方法)
     */
    __publicField$1(this, "_attached", false);
    /**
     * **框架中心**
     * @description
     * 提供处理布局、放置请求，处理基本默认事件，管理活动视图等核心任务。
     *
     * 仅当`this._attach`为`true`时，才允许调用其`AsukaUI#addRelayoutNode` 或 `AsukaUI#requestRelayout` 等方法
     *
     * 目前由AsukaUI创建节点时设置，不应自行修改)
     *
     */
    __publicField$1(this, "_core", null);
    /**
     * **布局尺寸仅由父节点传递的约束决定**
     * @description
     * 该节点的Size是否只与父节点传递的Constrains有关，而不与其它任何因素（如子节点的布局）有关。
     *
     * 换句话说，当父节点传递的布局约束不变时，本节点的子树无论发生产生何种布局变化，本节点的布局尺寸都不变，
     * 父节点就不需要重新布局（布局尺寸是父节点在布局时会参考子节点的唯一因素）
     *
     * 设置为`true`时，该节点将被标记为重布局边界(RelayoutBoundary)，其及其子节点产生的任何布局脏标记都不会传递给父节点，从而实现优化。
     * **如果为`true`，请在`performResize`中计算本节点的布局尺寸，不要在`performLayout`里做出任何计算或改变布局尺寸的操作。**
     *
     * 该属性由子类自行按需设置。
     * 除了对象初始化完成前，**请在改变本属性后调用`markSizedByParentChanged`，**保证布局结果得到正确更新。
     */
    __publicField$1(this, "sizedByParent", false);
  }
  /**------------------事件处理------------------- */
  /**
   * **添加事件处理器**
   * @param type 事件类型，不区分大小写
   * @param handler 事件处理函数
   */
  addEventListener(type, handler) {
    type = type.toLowerCase();
    (this._handlers[type] || (this._handlers[type] = [])).push(handler);
  }
  /**
   * **删除事件处理器**
   * @param type 事件类型，不区分大小写
   * @param handler 事件处理函数
   */
  removeEventListener(type, handler) {
    type = type.toLowerCase();
    splice(this._handlers[type], handler, void 0, true);
  }
  /**
   * **触发事件**
   * @description 如果要添加默认操作，请在调用本方法后判断`event.defaultPrevented`并决定是否执行默认操作
   * @param event 事件对象
   * @returns
   */
  dispatchEvent(event) {
    let target = event.target || (event.target = this), cancelable = event.cancelable, handlers, i;
    do {
      event.currentTarget = target;
      handlers = target._handlers && target._handlers[event.type];
      if (handlers)
        for (i = handlers.length; i--; ) {
          handlers[i].call(target, event);
          if (cancelable && event._end)
            break;
        }
    } while (event.bubbles && !(cancelable && event._stop) && (target = target.parentNode));
    return handlers != null;
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    if (key.startsWith("on")) {
      this.addEventListener(key.slice(2), value);
    }
  }
  /**------------------挂载操作------------------- */
  /**
   *  **当元素被挂载到Element树上**
   * @description
   * 即当被作为`mountChild()`的参数并成为子节点时调用。调用时parentNode已为新父元素。
   */
  onMount() {
  }
  /**
   *  **当元素被从Element树上取消挂载**
   * @description
   * 即当被作为`unmountChild()`的参数时调用。调用时parentNode已为null。
   */
  onUnmount() {
  }
  /**
   *  **当元素与`AsukaUI`连接（不再孤立）**
   * @description
   * 通常被`attach`调用
   */
  onAttach() {
  }
  /**
   *  **当元素不再与`AsukaUI`连接（变为孤立）**
   * @description
   * 通常被`detach`调用
   */
  onDetach() {
  }
  /**
   * **当元素所在树由孤立变为可渲染(即渲染树不与AsukaUI连接)**
   * @description
   * 该方法会通过`visitChildren`遍历所有的子`RenderNode`，并调用它们的`attach`方法、更新节点深度.
   *
   * 本方法需要传递attach调用给子节点以保证子节点`_attached`的正确性。
   *
   * 本方法还需要检测部分边界情况，并作处理。
   * - 当`_attached`为`false`时，也就是该节点未连接到一个可以允许子节点绘制的根节点上（也就是处于“孤立状态”），
   * 在此期间，若该节点的布局因为某些原因（比如回调事件或者布局相关的属性的变化）需要更新布局，由于处于孤立状态，本节点无法进行布局，
   * 更新布局的需求产生了对`markNeedsLayout`的调用，使`_needsLayout`为`true`，若该子节点的`_relayoutBoundary`不为`null`，
   * 则会一直调用`markParentNeedsLayout`直到到达重布局节点，但由于`_attached`为`false`，该节点无法向`AsukaUI`发出重布局请求。
   * 倘若该重布局节点并不是此孤立树的根节点，重新挂载后，由于`mountChild`仅调用挂载父节点的`markNeedsLayout`，
   * 而该重布局节点上方的节点不一定有重布局的需要(可能在其`layout`过程中因为`_needsLayout`为`false`且新传递的约束与之前相同而直接剪枝优化，
   * 而不向下传递`layout`调用)，因此可能导致该节点`_needsLayout`为`true`，却无法得到重新布局。
   * 所以当这种子节点被重新`attach`时，需要使其向`AsukaUI`发送布局请求。
   * - 当`_attached`为`false`时，由于某种原因产生对`markNeedsPlace`的调用类似. 不过`markNeedsPlace`不向上传递脏标记，因此思路较为简单
   */
  attach() {
    assert(!this._attached);
    assert(this.parentNode != null && this.parentNode._depth !== void 0);
    this._attached = true;
    this._depth = this.parentNode._depth + 1;
    assert(() => {
      if (this._relayoutBoundary === null && this._needsLayout && this.parentNode !== null && isRenderNode(this.parentNode)) {
        assert(this.parentNode._needsLayout);
      }
      return true;
    });
    if (this._needsLayout && this._relayoutBoundary !== null) {
      this._needsLayout = false;
      this.markNeedsLayout();
    }
    if (this._needsPlace) {
      this._needsPlace = false;
      this.markNeedsPlace();
    }
    this.onAttach();
    this.visitChildren((child) => child.attach());
  }
  /**
   * **当元素所在树由可渲染变为孤立(即渲染树与AsukaUI连接)**
   * @description
   */
  detach() {
    assert(this._attached);
    this._attached = false;
    this.visitChildren((child) => child.detach());
    this.onDetach();
  }
  /**
   * **初始化挂载的子节点**
   * @description
   * 用于挂载节点时设置子节点的插槽属性(parentNode和parentData)等，并将本节点布局标记为脏.
   *
   * **请在使用parentData和parentNode前调用**
   *
   * 通常被`mountChild`调用.
   *
   * @param child 要设置的子节点
   */
  _setupMountingChild(child) {
    child.parentNode = this;
    child.parentData = {};
    this.markNeedsLayout();
    if (isRenderNode(child)) {
      if (this._attached)
        child.attach();
      child.onMount();
    }
  }
  /**
   * **设置取消挂载的子节点**
   * @description
   * 用于取消挂载节点时设置子节点的插槽属性(parentNode和parentData)，并清除子树上即将失效(也就是指向本节点或者本节点的祖先)的`_relayoutBoundary`。
   *
   * **请在不使用parentData和parentNode时调用**
   *
   * 通常被`unmountChild`调用.
   *
   * @param child 要设置的子节点
   */
  _setupUnmountingChild(child) {
    child.parentNode = null;
    child.parentData = null;
    if (isRenderNode(child)) {
      child.onUnmount();
      if (this._attached)
        child.detach();
      child._cleanRelayoutBoundary();
    }
    this.markNeedsLayout();
  }
  /**
   * **设置本节点尺寸**
   *
   * 会检查是否发生变化，如果变化了将自动调用`markNeedsPlace`，使位置得到更新，并自动按需调用`performCommit`.
   *
   * **请按照要求仅在`performResize`或`performLayout`中设置本属性，**其他情况，不应修改该属性，否则可能导致布局错误.
   *
   * 传递不合法的尺寸（负/无穷/NaN）或者`null`将导致错误
   *
   * 会拷贝一个新对象，不会直接使用传参的对象，调用者可以继续修改使用传递的`Size`对象
   */
  set size(size) {
    assert(() => {
      if (!Size.isValid(size)) {
        throw new Error(`Invalid size: ${JSON.stringify(size)}, at ${this.nodeName}, constraint: ${JSON.stringify(this._constraints)}`);
      }
      return true;
    });
    assert(size != null);
    if (!Size.equals(size, this._size)) {
      this.markNeedsPlace();
      this._sizeChanged = true;
      this._size = Size.copy(size);
    }
  }
  /**
   * **获取本节点的尺寸**
   *
   * 返回`Size`类型的实例，或`null`
   */
  get size() {
    return this._size;
  }
  /**
   * **设置本节点相对父坐标的偏移**
   *
   * 会检查是否发生变化，如果变化了将自动调用`markNeedsPlace`，使位置得到更新，并自动按需调用`performCommit`.
   *
   * **请按照要求仅在`performLayout`中设置本属性，**其他情况，不应修改该属性，否则可能导致布局错误.
   *
   * 传递不合法的坐标或者`null`将导致错误
   *
   * 会拷贝一个新对象，不会直接使用传参的对象，调用者可以继续修改使用传递的`Coordinate`对象
   */
  set offset(offset) {
    assert(Coordinate.isValid(offset));
    if (offset == null)
      return;
    if (!Coordinate.equals(this._offset, offset)) {
      this._offset = Coordinate.copy(offset);
      this.markNeedsPlace();
    }
  }
  /**
   * **获取本节点相对相对父坐标的偏移**
   *
   * 返回`Coordinate`类型的实例，或`null`
   */
  get offset() {
    return this._offset;
  }
  /**
   * **获取本节点在当前坐标系的位置**
   *
   * 返回`Coordinate`类型的实例，或`null`
   *
   * 所谓`当前坐标系`，是指像`hmUI`，`VIEW_CONTAINER`控件，`GROUP`控件上绘制本节点时，
   * 应当设置的坐标是相对于屏幕原点或者容器控件的位置而言的；`position`就是指正确布局时，在当前容器上绘制时应当设置的正确坐标
   *
   * 确认一个节点的位置，需要先在`layout`过程中确定其`offset`，
   * 并在`place`过程中，通过父节点的`position`(当然父节点为容器时不算这个)+该节点的`offset`，最终得出`position`
   */
  get position() {
    return this._position;
  }
  /**
   * **设置本节点相对父坐标的偏移**
   *
   * 仅应被`place`方法设置，请勿自行调用，**否则可能导致布局错误**，
   *
   * 传递不合法的坐标或者`null`将导致错误
   *
   * 会拷贝一个新对象，不会直接使用传参的对象，调用者可以继续修改使用传递的`Coordinate`对象.
   *
   * 内部不进行任何脏标记或`commit`操作，需要`place`方法实现.
   */
  set position(position) {
    assert(Coordinate.isValid(position));
    if (position == null)
      return;
    if (!Coordinate.equals(this._position, position)) {
      this._position = Coordinate.copy(position);
    }
  }
  /**
   * **有条件地更新子树重布局边界**
   * @description
   * 当节点的_relayoutBoundary不是自己，且父节点的_relayoutBoundary与自己的不相等时，更新并传递给子节点
   */
  _propagateRelayoutBoundary() {
    if (this._relayoutBoundary === this)
      return;
    const parentRelayoutBoundary = this.parentNode._relayoutBoundary;
    if (parentRelayoutBoundary !== this._relayoutBoundary) {
      this._relayoutBoundary = parentRelayoutBoundary;
      this.visitChildren((child) => {
        child._propagateRelayoutBoundary();
      });
    }
  }
  /**
   * **有条件地清空子树重布局边界**
   * @description
   * 若节点的_relayoutBoundary不是自己，则设为null，并传递给子节点
   */
  _cleanRelayoutBoundary() {
    if (this._relayoutBoundary !== this) {
      this._relayoutBoundary = null;
      this.visitChildren((child) => child._cleanRelayoutBoundary());
    }
  }
  /**
   * **布局算法**
   * @param constraints 布局约束，要求该RenderNode的尺寸应符合该约束
   * @param parentUsesSize 父节点在 layout 时会不会使用当前节点的 size 信息(也就是当前节点的排版信息对父节点有无影响)；
   */
  layout(constraints, { parentUsesSize = false, widgetFactory }) {
    assert(widgetFactory != null && typeof widgetFactory.createWidget === "function" && typeof widgetFactory.deleteWidget === "function");
    assert((() => {
      if (!Constraints.isValid(constraints)) {
        throw new Error(`Invalid constraints: ${JSON.stringify(constraints)} 
From: [${this.nodeName}]${this.toString()}`);
      }
      return true;
    })());
    this._widgetFactory = widgetFactory;
    let isRelayoutBoundary = !parentUsesSize || // 父节点不使用该节点的Size，也就是该节点的Size是固定的(到下次布局前)，所以该节点子树的布局变化不需要父节点重新布局
    this.sizedByParent || // 该节点的Size只与父节点的Size有关，也就是该节点的子树布局变化不会影响该节点的Size，故不需要父节点重新布局
    constraints.isTight || // 父节点传递了严格布局约束，也就是该节点的Size是固定的(到下次布局前)，那么该节点的子树布局变化不会使该节点的Size变化，故不需要父节点重新布局
    !isRenderNode(this.parentNode);
    let relayoutBoundary = isRelayoutBoundary ? this : this.parentNode._relayoutBoundary;
    if (!this._needsLayout && constraints.equals(this._constraints)) {
      if (relayoutBoundary !== this._relayoutBoundary) {
        this._relayoutBoundary = relayoutBoundary;
        this.visitChildren((child) => child._propagateRelayoutBoundary());
      }
      return;
    }
    this._constraints = constraints;
    if (this._relayoutBoundary !== null && relayoutBoundary !== this._relayoutBoundary) {
      this.visitChildren((child) => child._cleanRelayoutBoundary());
    }
    this._relayoutBoundary = relayoutBoundary;
    if (this.sizedByParent) {
      this.performResize();
    }
    this.performLayout();
    this._needsLayout = false;
  }
  /**
   * **在不重新确定尺寸的情况下重新布局**
   *
   * 不会检查`_needsLayout`，请调用前检查并决定是否剪枝
   */
  _layoutWithoutResize() {
    assert(this._relayoutBoundary === this);
    assert(this.size != null);
    this.performLayout();
    this._needsLayout = false;
  }
  /**
   * **计算节点位置（放置操作）**
   * @description
   * 根据本节点的`offset`和父节点传递的`parentNewPosition`，计算本节点的`position`，并在需要时调用`performCommit`
   * @param parentNewPosition 父节点的新位置(未发生改变或者父节点`isNewCoordOrigin`就无需传参)
   */
  place(parentNewPosition) {
    assert(isRenderNode(this.parentNode));
    let parentNode = this.parentNode;
    assert(this._offset != null);
    assert(parentNode._position != null);
    if (!this._needsPlace && !parentNewPosition)
      return;
    this._needsPlace = false;
    let position = parentNewPosition ? Coordinate.add(parentNewPosition, this.offset) : parentNode.isNewCoordOrigin ? Coordinate.copy(this.offset) : Coordinate.add(this.offset, parentNode._position);
    let positionChanged = !Coordinate.equals(position, this._position);
    if (positionChanged) {
      this.position = position;
    }
    if (positionChanged || this._sizeChanged || this._mustCommit) {
      this._sizeChanged = this._mustCommit = false;
      this.performCommit();
    }
    if (positionChanged && !this.isNewCoordOrigin) {
      this.visitChildren((child) => child.place(position));
    }
  }
  /**
   * **将该RenderNode标记为需要重新布局**
   */
  markNeedsLayout() {
    if (this._needsLayout)
      return;
    if (this._relayoutBoundary === null) {
      this._needsLayout = true;
      if (this.parentNode !== null)
        this.markParentNeedsLayout();
      return;
    }
    if (this._relayoutBoundary !== this) {
      this.markParentNeedsLayout();
    } else {
      this._needsLayout = true;
      if (this._attached) {
        this._core.addRelayoutNode(this);
        this._core.requestRelayout();
      }
    }
  }
  /**
   * **将父节点标记为需要重新布局**
   */
  markParentNeedsLayout() {
    assert(this.parentNode !== null);
    this._needsLayout = true;
    this.parentNode.markNeedsLayout();
  }
  /**
   * **标记`sizedByParent`的修改**
   * @description
   * 当在初始化对象以后修改`sizedByParent`时，请调用本方法以确保布局正确更新.
   *
   * 该方法将本节点和父节点标记为脏布局，确保这两个节点的布局都能得到更新.
   */
  markSizedByParentChanged() {
    this.markNeedsLayout();
    this.markParentNeedsLayout();
  }
  /**
   * **标记需要重新计算节点位置（放置脏标记）**
   *
   * 通常不需要手动调用`markNeedsPlace`，因为通常只有当`offset`或父节点的位置可能发生变化时，本节点才需要重新确定位置，而前者只能由`layout`过程中计算，
   * 并在`performLayout`中赋值新的`offset`给子节点时，由子节点的`offset`setter 自动判断是否应调用`markNeedsPlace`;后者会在父节点的`place`方法中调用
   * 子节点的`place`，并不需要用到本脏标记. 另外一个调用来源是`markMustCommit`，因为其需要保证该节点的`place`得到调用，并在其中调用`performCommit`.
   *
   * @see markMustCommit 如果你想让框架保证`performCommit`或`onCommit`得到调用，请另见`markMustCommit`
   */
  markNeedsPlace() {
    if (this._needsPlace)
      return;
    this._needsPlace = true;
    if (this._attached) {
      assert(this._core != null);
      this._core.addPlaceNode(this);
      this._core.requestPlace();
    }
  }
  markMustCommit() {
    if (this._mustCommit)
      return;
    this.markNeedsPlace();
  }
}
class RenderNodeWithSingleChild extends RenderNode {
  constructor() {
    super(...arguments);
    __publicField$1(this, "_child", null);
  }
  set child(child) {
    if (this._child) {
      this.unmountChild(this._child);
      this._child = null;
    }
    if (child != null)
      this.mountChild(child);
  }
  get child() {
    return this._child;
  }
  get firstChild() {
    return this._child;
  }
  visitChildren(handler) {
    if (isRenderNode(this._child)) {
      handler(this._child);
    }
  }
  unmountChild(child) {
    if (this._child !== null && child === this._child) {
      this._setupUnmountingChild(child);
      this._child = null;
      return true;
    }
    return false;
  }
  mountChild(child) {
    if (this._child !== null)
      return false;
    this._child = child;
    this._setupMountingChild(child);
    return true;
  }
  getChildNextSibling(child) {
    return null;
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    if (key === "child" && value instanceof AsukaNode) {
      this.child = value;
    }
  }
}
class RenderView extends RenderNodeWithSingleChild {
  constructor({ core, widgetFactory, size, key, offset = { x: 0, y: 0 } }) {
    super(NodeType.RENDER_NODE, "#frame");
    __privateAdd(this, _key);
    this._widgetFactory = widgetFactory;
    this._depth = 1;
    this._size = Size.copy(size);
    this._offset = Coordinate.copy(offset);
    this._position = Coordinate.copy(offset);
    this._core = core;
    __privateSet(this, _key, key);
    this._attached = true;
    this._relayoutBoundary = this;
  }
  get key() {
    return __privateGet(this, _key);
  }
  /**
   * @override
   */
  set size(size) {
    assert(Size.isValid(size));
    if (size == null)
      return;
    if (!Size.equals(size, this._size)) {
      this._size = Size.copy(size);
      this.markNeedsLayout();
    }
  }
  get size() {
    return this._size;
  }
  setSize(size) {
    this.size = size;
    return this;
  }
  set offset(offset) {
    assert(Coordinate.isValid(offset));
    if (offset == null)
      return;
    if (!Coordinate.equals(this._offset, offset)) {
      this._offset = Coordinate.copy(offset);
      this._position = Coordinate.copy(offset);
      this.markNeedsPlace();
    }
  }
  setOffset(offset) {
    this.offset = offset;
    return this;
  }
  set position(position) {
    assert(Coordinate.isValid(position));
    if (position == null)
      return;
    if (!Coordinate.equals(this._position, position)) {
      this._offset = Coordinate.copy(position);
      this._position = Coordinate.copy(position);
      this.markNeedsPlace();
    }
  }
  setPosition(position) {
    this.position = position;
    return this;
  }
  place() {
    assert(this._offset != null);
    assert(this._position != null);
    if (!this._needsPlace)
      return;
    this._needsPlace = false;
    if (!this.isNewCoordOrigin) {
      this.visitChildren((child) => child.place(this._position));
    }
  }
  performLayout() {
    assert(this._size != null);
    assert(this._widgetFactory != null);
    if (isRenderNode(this.child)) {
      let child = this.child;
      child.layout(Constraints.createTight(this._size), {
        parentUsesSize: false,
        widgetFactory: this._widgetFactory
      });
      child.offset = Coordinate.origin();
    }
  }
  performResize() {
  }
  performCommit() {
  }
}
_key = new WeakMap();
const _AsukaUI = class _AsukaUI {
  constructor() {
    __publicField$1(this, "viewRecord", {});
    __publicField$1(this, "_activeFrame", null);
    __publicField$1(this, "_nodeFactories", []);
    /** 需要重新布局的起始节点 */
    __publicField$1(this, "_nodesNeedsLayout", []);
    /** 需要重新放置的节点 */
    __publicField$1(this, "_nodesNeedsPlace", []);
    /** 在布局和放置任务完成后调用的任务 */
    __publicField$1(this, "_runAfterTasks", []);
    /** 异步管理器句柄(可能是setTimeout或者Promise之类的) */
    __publicField$1(this, "_asyncHandler", null);
    assert(_AsukaUI.instance === null);
    _AsukaUI.instance = this;
  }
  get activeFrame() {
    return this._activeFrame;
  }
  set activeFrame(frame) {
    this._activeFrame = frame;
  }
  mountView(mount = hmUI, options) {
    let size = options && options.size;
    let offset = options && options.offset || { x: 0, y: 0 };
    if (!size) {
      if (mount === hmUI) {
        let { width, height } = getDeviceInfo();
        size = { w: width, h: height };
      } else {
        try {
          size = {
            w: mount.getProperty(hmUI.prop.W),
            h: mount.getProperty(hmUI.prop.H)
          };
        } catch {
          reportError("createFrame", Error("Get View size failed"));
        }
      }
    }
    if (!size)
      throw Error("Get View size failed");
    let view = new RenderView({
      widgetFactory: mount,
      core: this,
      size,
      key: Symbol("Asuka View"),
      offset
    });
    this.viewRecord[view.key] = view;
    return view;
  }
  unmountView(view) {
    if (!view._attached || !this.viewRecord[view.key])
      return false;
    view.detach();
    this.viewRecord[view.key] = null;
    return true;
  }
  registerNodeFactory(nodeFactory) {
    this._nodeFactories.push(nodeFactory);
  }
  createNode(type) {
    let element = null;
    for (let nodeFactory of this._nodeFactories) {
      element = nodeFactory.createNode(type);
      if (element)
        break;
    }
    if (element !== null && isRenderNode(element)) {
      element._core = this;
    }
    return element;
  }
  createTextNode(text) {
    return new AsukaTextNode(text);
  }
  /**
   * **添加需要重新布局的节点**
   */
  addRelayoutNode(node) {
    assert(findWhere(this._nodesNeedsLayout, node, true) === -1);
    this._nodesNeedsLayout.push(node);
  }
  /**
   * **移除需要重新布局的节点**
   */
  removeRelayoutNode(node) {
    return splice(this._nodesNeedsLayout, node) !== -1;
  }
  /**
   * **请求重新布局**
   */
  requestRelayout() {
    if (this._asyncHandler === null) {
      this._asyncHandler = setTimeout(() => this._layoutAndPlace());
    }
  }
  /**
   * **添加需要重新布局的节点**
   */
  addPlaceNode(node) {
    assert(findWhere(this._nodesNeedsPlace, node, true) === -1);
    this._nodesNeedsPlace.push(node);
  }
  /**
   * **移除需要重新布局的节点**
   */
  removePlaceNode(node) {
    return splice(this._nodesNeedsPlace, node) !== -1;
  }
  /**
   * **请求重新布局**
   */
  requestPlace() {
    if (this._asyncHandler === null) {
      this._asyncHandler = setTimeout(() => this._layoutAndPlace());
    }
  }
  /**
   * **取消重新布局**
   */
  cancelRelayout() {
    if (this._asyncHandler !== null)
      clearTimeout(this._asyncHandler);
  }
  refreshSync() {
    if (this._asyncHandler !== null) {
      clearTimeout(this._asyncHandler);
      this._layoutAndPlace();
    }
  }
  /**
   * **添加布局与放置后的任务**
   *
   * 将在`layout`和`place`完成后调用，并清空任务队列
   * @param task 要执行的任务
   */
  addRunAfterAsync(task) {
    this._runAfterTasks.push(task);
  }
  /**
   * 重新布局时调用的
   */
  _layoutAndPlace() {
    this._asyncHandler = null;
    this._layout();
    this._place();
    this._runAfter();
  }
  _layout() {
    this._nodesNeedsLayout.sort((node1, node2) => node1._depth - node2._depth);
    for (let node of this._nodesNeedsLayout) {
      if (node._needsLayout && node._attached)
        node._layoutWithoutResize();
    }
    this._nodesNeedsLayout = [];
  }
  _place() {
    this._nodesNeedsPlace.sort((node1, node2) => node1._depth - node2._depth);
    for (let node of this._nodesNeedsPlace) {
      if (node._needsPlace && node._attached)
        node.place();
    }
    this._nodesNeedsPlace = [];
  }
  _runAfter() {
    for (let task of this._runAfterTasks) {
      task();
    }
    this._runAfterTasks = [];
  }
};
__publicField$1(_AsukaUI, "instance", null);
let AsukaUI = _AsukaUI;

({
  text_size: px$2(36)
});

({
  text: "text",
  color: 16777215,
  text_size: Number(px$2(36)),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V
});

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
function TestPage(core) {
  registerAsukaPage(core, "asukaTestPage");
}
var asuka = null;
function registerAsukaPage(core, name, component) {
  if (!asuka) {
    asuka = new AsukaUI();
  }
  class AsukaView extends UI.View {
    constructor() {
      super(...arguments);
      __publicField(this, "disposeFunc", null);
      __publicField(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
      __publicField(this, "rootView", null);
    }
    onCreate(prop) {
      this.rootView = asuka.mountView(this._widgetFactory);
    }
    onCommit(prop) {
      throw new Error("Method not implemented.");
    }
    onDestroy() {
      throw new Error("Method not implemented.");
    }
  }
  core.ui.registerView(name, AsukaView);
}

function ViewPlugin(core) {
  core.ui.registerView("say", CustomSayView);
  core.ui.registerView("fg_img", FgImgView);
  core.ui.registerView("bg_img", BgImgView);
  core.ui.registerView("menu", MenuView);
  core.ui.registerView("title", TitleView);
  core.ui.registerView("quick_menu", QuickMenu);
  core.ui.registerView("info_opening", InfoOpening);
  TestPage(core);
}

export { ViewPlugin as default };

import '@cuberqaq/asuka-ui/solid';
import { AsukaUI } from '@cuberqaq/asuka-ui';
import { Time } from '@zos/sensor';
import { create, id } from '@zos/media';
import * as hmUI from '@zos/ui';
import * as hmFS from '@zos/fs';
import { getDeviceInfo } from '@zos/device';

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
const { width, height, screenShape } = getDeviceInfo();
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
            width,
            height,
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
            x: (width * ((prop.xalign ?? 0) + 1)) / 2 + // 根据 align 求出 anchor 位置
                (prop.xoffset ?? 0), // offset
            y: (height * ((prop.yalign ?? 0) + 1)) / 2 + // 根据 align 求出 anchor 位置
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

export { TestPage as default, registerAsukaPage };

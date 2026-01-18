var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _currentSection, _currentIndex, _currentTrack;
import { create, id } from "@zos/media";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import * as hmUI from "@zos/ui";
import hmUI__default, { setStatusBarVisible } from "@zos/ui";
import * as hmFS from "@zos/fs";
import { Battery, Time } from "@zos/sensor";
import { getText } from "@zos/i18n";
import { P as Profiler } from "../shared/profiler.chunk.js";
import { onKey, KEY_BACK, KEY_SHORTCUT, KEY_EVENT_CLICK, KEY_SELECT, onGesture, GESTURE_LEFT } from "@zos/interaction";
import { p as px$1 } from "../shared/dynamic_px.chunk.js";
import "@zos/app";
import "@zos/settings";
function Save(store_key) {
  return function(target, context) {
    context.addInitializer(function() {
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
      }
    };
  };
}
function CustomSave(store_key, serializer, deserializer) {
  return (target, context) => {
    if (context.kind !== "accessor") {
      throw new Error("ArchiveStateAccessor只能用于accessor属性");
    }
    context.addInitializer(function() {
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
      }
    };
  };
}
function archiveStateGetter(_this, store_key, old_getter) {
  _this._core;
  let val = old_getter.call(_this);
  return val;
}
function archiveStateGetterWithSerializer(_this, store_key, old_getter, serializer) {
  _this._core;
  let val = old_getter.call(_this);
  return val;
}
function archiveStateSetter(_this, store_key, old_setter, val) {
  old_setter.call(_this, val);
}
function archiveStateSetterWithDeserializer(_this, store_key, old_setter, val, deserializer) {
  old_setter.call(_this, val);
}
var __esDecorate$5 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var __runInitializers$5 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
let Async = (() => {
  var _a, __nextTimerId_accessor_storage, __delayTasks_accessor_storage;
  let __nextTimerId_decorators;
  let __nextTimerId_initializers = [];
  let __nextTimerId_extraInitializers = [];
  let __delayTasks_decorators;
  let __delayTasks_initializers = [];
  let __delayTasks_extraInitializers = [];
  return _a = class {
    constructor(_core) {
      __publicField(this, "_core");
      // private _fps = 45;
      // private _hmTime = new Time();
      __publicField(this, "_lastTime");
      __privateAdd(this, __nextTimerId_accessor_storage, __runInitializers$5(this, __nextTimerId_initializers, 50));
      __privateAdd(this, __delayTasks_accessor_storage, (__runInitializers$5(this, __nextTimerId_extraInitializers), __runInitializers$5(this, __delayTasks_initializers, {})));
      __runInitializers$5(this, __delayTasks_extraInitializers);
      this._core = _core;
      this._lastTime = this._core.platform.getTime();
      _core.platform.setFrameInterval(() => {
        this._scheduleTask();
      });
    }
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
    _scheduleTask() {
      let now = this._core.platform.getTime();
      let deltaTime = now - this._lastTime;
      this._lastTime = now;
      for (let id2 in this._delayTasks) {
        let task = this._delayTasks[id2];
        task.next -= deltaTime;
        if (task.next <= 0) {
          this._core.emit(task.event, ...task.args);
          if (task.repeat >= 0) {
            task.next += task.repeat;
          } else {
            delete this._delayTasks[id2];
          }
        }
      }
    }
    get _nextTimerId() {
      return __privateGet(this, __nextTimerId_accessor_storage);
    }
    set _nextTimerId(value) {
      __privateSet(this, __nextTimerId_accessor_storage, value);
    }
    // tasks
    get _delayTasks() {
      return __privateGet(this, __delayTasks_accessor_storage);
    }
    set _delayTasks(value) {
      __privateSet(this, __delayTasks_accessor_storage, value);
    }
    // 注意在task執行中立即創建一個新的task，會在同一個js task中執行
    // 注意周期實際為1個frame的時間的整數倍
    addDelayTask(event, args, delayMs) {
      let task = {
        event,
        args,
        next: delayMs,
        repeat: -1
      };
      let id2 = this._nextTimerId++;
      this._delayTasks[id2] = task;
      return id2;
    }
    addRepeatTask(event, args, intervalMs, delayMs) {
      intervalMs = intervalMs >= 0 ? intervalMs : 0;
      let task = {
        event,
        args,
        next: delayMs != null ? delayMs : intervalMs,
        repeat: intervalMs
      };
      let id2 = this._nextTimerId++;
      this._delayTasks[id2] = task;
      return id2;
    }
    removeTask(id2) {
      delete this._delayTasks[id2];
    }
  }, __nextTimerId_accessor_storage = new WeakMap(), __delayTasks_accessor_storage = new WeakMap(), (() => {
    const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
    __nextTimerId_decorators = [Save("async.nextTimerId")];
    __delayTasks_decorators = [Save("async.delayTasks")];
    __esDecorate$5(_a, null, __nextTimerId_decorators, { kind: "accessor", name: "_nextTimerId", static: false, private: false, access: { has: (obj) => "_nextTimerId" in obj, get: (obj) => obj._nextTimerId, set: (obj, value) => {
      obj._nextTimerId = value;
    } }, metadata: _metadata }, __nextTimerId_initializers, __nextTimerId_extraInitializers);
    __esDecorate$5(_a, null, __delayTasks_decorators, { kind: "accessor", name: "_delayTasks", static: false, private: false, access: { has: (obj) => "_delayTasks" in obj, get: (obj) => obj._delayTasks, set: (obj, value) => {
      obj._delayTasks = value;
    } }, metadata: _metadata }, __delayTasks_initializers, __delayTasks_extraInitializers);
    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
  })(), __publicField(_a, "_nextTickCallbacks", []), __publicField(_a, "_nextTickTimerId", null), _a;
})();
var __esDecorate$4 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var __runInitializers$4 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
let Audio = (() => {
  var __channels_accessor_storage, _a;
  let __channels_decorators;
  let __channels_initializers = [];
  let __channels_extraInitializers = [];
  return _a = class {
    // static _hmPlayer = create(id.PLAYER);
    constructor(_core) {
      __publicField(this, "_core");
      __privateAdd(this, __channels_accessor_storage, __runInitializers$4(this, __channels_initializers, {}));
      __runInitializers$4(this, __channels_extraInitializers);
      this._core = _core;
      this._channels["audio"] = new _a.Channel(this);
    }
    get _channels() {
      return __privateGet(this, __channels_accessor_storage);
    }
    set _channels(value) {
      __privateSet(this, __channels_accessor_storage, value);
    }
    get channels() {
      return this._channels;
    }
    createChannel(name) {
      if (Object.getOwnPropertyNames(this._channels).length > 0)
        throw "Can't create more than one audio channel on ZeppOS";
      if (this._channels[name])
        throw "Channel Already Exist";
      return this._channels[name] = new _a.Channel(this);
    }
  }, __channels_accessor_storage = new WeakMap(), (() => {
    const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
    __channels_decorators = [CustomSave("audio.channels", function(channels) {
      let res = {};
      for (let key in channels) {
        res[key] = channels[key].serialize();
      }
      return res;
    }, function(serialized) {
      for (let key in this._channels) {
        this._channels[key].stop();
        this._channels[key].onRelease();
      }
      let res = {};
      for (let key in serialized) {
        res[key] = _a.Channel.deserialize(this, serialized[key]);
      }
      return res;
    })];
    __esDecorate$4(_a, null, __channels_decorators, { kind: "accessor", name: "_channels", static: false, private: false, access: { has: (obj) => "_channels" in obj, get: (obj) => obj._channels, set: (obj, value) => {
      obj._channels = value;
    } }, metadata: _metadata }, __channels_initializers, __channels_extraInitializers);
    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
  })(), _a;
})();
(function(Audio2) {
  class Channel {
    constructor(_audio) {
      __publicField(this, "_audio");
      // platform specific
      // universal
      __publicField(this, "_audioPlayer");
      __publicField(this, "mode", Channel.Mode.PlayInOrder);
      __publicField(this, "status", Channel.Status.Stopped);
      __publicField(this, "_playbackList", []);
      __publicField(this, "_nowIndex", null);
      __publicField(this, "currentInfo", null);
      this._audio = _audio;
      this._audioPlayer = _audio._core.platform.createAudioPlayer();
      this._audioPlayer.onPrepared = (success) => {
        this._onPrepared(success);
      };
      this._audioPlayer.onCompleted = () => {
        this._onCompleted();
      };
    }
    onRelease() {
      this._audioPlayer.release();
      this._audio._core.platform.releaseAudioPlayer(this._audioPlayer);
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
      this._audioPlayer.stop();
      this.status = Channel.Status.Stopped;
    }
    /**
     * 停止并清空队列
     */
    stop() {
      if (this.status !== Channel.Status.Playing)
        return;
      this._audio._core.debug.log("audio channel stop");
      this._audioPlayer.stop();
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
        nowIndex: this._nowIndex
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
        let mediaInfo = this._audioPlayer.getMediaInfo();
        this.currentInfo = {
          // placeholder
          artist: (_a = mediaInfo.artist) != null ? _a : "未知",
          title: (_b = mediaInfo.title) != null ? _b : "未知",
          duration: mediaInfo.duration
        };
        console.log("=== prepare succeed ===");
        this._audioPlayer.start();
      } else {
        console.log("=== prepare fail ===");
        this.status = Channel.Status.Error;
        this._audioPlayer.release();
      }
    }
    _onCompleted() {
      if (this.mode === Channel.Mode.PlayInOrder) {
        this._playbackList.shift();
        if (this._playbackList.length > 0)
          this._nowIndex = 0;
        else
          this._nowIndex = null;
      } else if (this.mode === Channel.Mode.PlayInOrderRepeat) {
        if (this._playbackList.length > 0) {
          if (this._nowIndex === null)
            this._nowIndex = 0;
          this._nowIndex = (this._nowIndex + 1) % this._playbackList.length;
        } else
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
      } else if (this.mode === Channel.Mode.PlayInOrderRepeat) {
        if (this._nowIndex === null)
          this._nowIndex = 0;
      }
      this._audioPlayer.setSource({
        path: this._playbackList[this._nowIndex].path
      });
      this._audioPlayer.prepare();
      this.status = Channel.Status.Playing;
    }
  }
  Audio2.Channel = Channel;
  (function(Channel2) {
    (function(Mode) {
      Mode[Mode["PlayInOrder"] = 0] = "PlayInOrder";
      Mode[Mode["PlayInOrderRepeat"] = 1] = "PlayInOrderRepeat";
    })(Channel2.Mode || (Channel2.Mode = {}));
    (function(Status) {
      Status[Status["Stopped"] = 0] = "Stopped";
      Status[Status["Playing"] = 1] = "Playing";
      Status[Status["Error"] = 2] = "Error";
    })(Channel2.Status || (Channel2.Status = {}));
  })(Channel = Audio2.Channel || (Audio2.Channel = {}));
})(Audio || (Audio = {}));
class Config {
  constructor(_core) {
    __publicField(this, "_core");
    this._core = _core;
    _core.on("initGlobalData", () => {
      _core.storage.setSaveableData(_core.storage.globalData, true, { ...defaultConfig }, "config");
    });
    _core.on("afterLoadGlobalData", () => {
      var _a;
      if (!((_a = _core.storage.globalData) == null ? void 0 : _a.config)) {
        _core.storage.setSaveableData(_core.storage.globalData, true, { ...defaultConfig }, "config");
      }
      _core.storage.saveGlobalData();
    });
  }
  getConfig(key) {
    let keys = this.normalizeKey(key);
    if (keys == null)
      return;
    try {
      let res = this._core.storage.getSaveableData(this._core.storage.globalData, false, "config", ...keys);
      return res;
    } catch (e) {
      return;
    }
  }
  setConfig(key, value) {
    let keys = this.normalizeKey(key);
    if (keys == null)
      return;
    this._core.storage.setSaveableData(this._core.storage.globalData, true, value, "config", ...keys);
    this._core.storage.saveGlobalData();
  }
  normalizeKey(key) {
    let keys = [];
    key.split(".").forEach((key2) => {
      if (key2.trim().length > 0)
        keys.push(key2);
      else
        return null;
    });
    return keys;
  }
  resetConfig() {
  }
}
const defaultConfig = {
  game: {
    autoplay: {
      enable: false,
      ms_per_char: 150,
      extra_delay: 1300
    }
  }
};
class Debug {
  constructor(_core) {
    __publicField(this, "_core");
    this._core = _core;
  }
  log(...args) {
    console.log("[HZEngine]", ...args);
  }
}
function $_command(core) {
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().startsWith("$")) {
      ctx.rawtext = "eval " + ctx.rawtext.trim().slice(1).trim();
    }
    return next();
  });
}
var util$1 = {
  isString: (x) => typeof x === "string",
  // 检查是否为字符串
  isObject: (x) => typeof x === "object"
  // 检查是否为对象
};
function isProtocolPath$1(path) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(path);
}
function extractProtocol$1(path) {
  const match = path.match(/^([a-zA-Z][a-zA-Z\d+\-.]*):\/\/(.*)$/);
  if (match) {
    return {
      protocol: match[1],
      // 获取协议
      filepath: match[2]
      // 获取文件路径
    };
  }
  return { protocol: null, filepath: path };
}
function normalizeArray$1(parts, allowAboveRoot) {
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (!p || p === ".")
      continue;
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
function trimArray$1(arr) {
  var lastIndex = arr.length - 1;
  var start = 0;
  for (; start <= lastIndex; start++) {
    if (arr[start])
      break;
  }
  var end = lastIndex;
  for (; end >= 0; end--) {
    if (arr[end])
      break;
  }
  if (start === 0 && end === lastIndex)
    return arr;
  if (start > end)
    return [];
  return arr.slice(start, end + 1);
}
var splitPathRe$1 = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var posix$1 = {};
function posixSplitPath$1(filename) {
  return splitPathRe$1.exec(filename).slice(1);
}
posix$1.resolve = function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : process.cwd();
    if (!util$1.isString(path)) {
      throw new TypeError("Arguments to path.resolve must be strings");
    } else if (!path) {
      continue;
    }
    if (isProtocolPath$1(path)) {
      const { protocol, filepath } = extractProtocol$1(path);
      resolvedPath = filepath + "/" + resolvedPath;
      resolvedAbsolute = true;
    } else {
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path[0] === "/";
    }
  }
  resolvedPath = normalizeArray$1(resolvedPath.split("/"), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
};
posix$1.normalize = function(path) {
  if (isProtocolPath$1(path)) {
    const { protocol, filepath } = extractProtocol$1(path);
    return protocol + "://" + normalizeArray$1(filepath.split("/")).join("/");
  }
  var isAbsolute = posix$1.isAbsolute(path), trailingSlash = path && path[path.length - 1] === "/";
  path = normalizeArray$1(path.split("/"), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
    path = ".";
  }
  if (path && trailingSlash) {
    path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
};
posix$1.isAbsolute = function(path) {
  return path.charAt(0) === "/";
};
posix$1.join = function() {
  var path = "";
  for (var i = 0; i < arguments.length; i++) {
    var segment = arguments[i];
    if (!util$1.isString(segment)) {
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
  return posix$1.normalize(path);
};
posix$1.relative = function(from, to) {
  from = posix$1.resolve(from).substr(1);
  to = posix$1.resolve(to).substr(1);
  var fromParts = trimArray$1(from.split("/"));
  var toParts = trimArray$1(to.split("/"));
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
posix$1.dirname = function(path) {
  var result = posixSplitPath$1(path), root = result[0], dir = result[1];
  if (!root && !dir) {
    return ".";
  }
  if (dir) {
    dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
};
posix$1.basename = function(path, ext) {
  var f = posixSplitPath$1(path)[2];
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};
posix$1.extname = function(path) {
  return posixSplitPath$1(path)[3];
};
posix$1.format = function(pathObject) {
  if (!util$1.isObject(pathObject)) {
    throw new TypeError("Parameter 'pathObject' must be an object, not " + typeof pathObject);
  }
  var root = pathObject.root || "";
  if (!util$1.isString(root)) {
    throw new TypeError("'pathObject.root' must be a string or undefined, not " + typeof pathObject.root);
  }
  var dir = pathObject.dir ? pathObject.dir + posix$1.sep : "";
  var base = pathObject.base || "";
  return dir + base;
};
posix$1.parse = function(pathString) {
  if (!util$1.isString(pathString)) {
    throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
  }
  var allParts = posixSplitPath$1(pathString);
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
posix$1.sep = "/";
posix$1.delimiter = ":";
function audio_command(core) {
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "play" && ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "queue")
      return next();
    if (ctx.slicedArgs.length !== 3)
      throw `${ctx.slicedArgs[0].str.toUpperCase()} Command: incorrect amount of args`;
    if (!ctx.slicedArgs[2].isQuoted)
      throw `the third arg of ${ctx.slicedArgs[0].str} command should be quoted as string path`;
    let channel_name = ctx.slicedArgs[1].str;
    let path = ctx.slicedArgs[2].str;
    core.debug.log(`Play Command: play ${channel_name} ${path}`);
    let channel = core.audio.channels[channel_name];
    if (!channel) {
      throw `audio channel ${channel_name} not found`;
    }
    if (ctx.slicedArgs[0].str !== "queue") {
      channel.stop();
    }
    channel.push({ path: posix$1.join(core.storage.projectRoot, "audio", path) });
    channel.play();
  });
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "stop") {
      return next();
    }
    if (ctx.slicedArgs.length !== 2) {
      throw `Stop Command: incorrect amount of args`;
    }
    let channel_name = ctx.slicedArgs[1].str;
    let channel = core.audio.channels[channel_name];
    if (!channel) {
      throw `audio channel ${channel_name} not found`;
    }
    channel.stop();
  });
}
function basic_commands(core) {
  core.script.use((ctx, next) => {
    let strArr = ctx.rawtext.trim().split(/ +/);
    if (strArr.length === 0 || strArr[0].toLowerCase() !== "jump")
      return next();
    if (strArr.length !== 2)
      throw "Jump Command: incorrect amount of args";
    core.debug.log(`Jump Command: jump to label [${strArr[1]}]`);
    core.script.jumpLabel(strArr[1]);
  });
  core.script.use((ctx, next) => {
    let strArr = ctx.rawtext.trim().split(/ +/);
    if (strArr.length === 0 || strArr[0].toLowerCase() !== "call")
      return next();
    if (strArr.length !== 2)
      throw "Call Command: incorrect amount of args";
    core.debug.log(`Call Command: call label [${strArr[1]}]`);
    core.script.callLabel(strArr[1]);
  });
  core.script.use((ctx, next) => {
    let strArr = ctx.rawtext.trim().split(/ +/);
    if (strArr.length === 0 || strArr[0].toLowerCase() !== "return")
      return next();
    if (strArr.length !== 1)
      throw "Return Command: this command can not have args";
    core.debug.log(`Return Command: return`);
    core.script.return();
  });
  core.script.use((ctx, next) => {
    let str = ctx.rawtext.trim();
    if (!str.startsWith("echo"))
      return next();
    core.debug.log(`[ECHO] ${core.script.parseString(str.slice(4).trim())}`);
  });
  core.script.use((ctx, next) => {
    if (!ctx.rawtext.trim().startsWith('"'))
      return next();
    function parseSayCommandArgs() {
      if (ctx.slicedArgs.length > 0 && ctx.slicedArgs[ctx.slicedArgs.length - 1].str === "nowait") {
        ctx.slicedArgs = ctx.slicedArgs.slice(0, ctx.slicedArgs.length - 1);
        return {
          wait: false
        };
      } else {
        return {
          wait: true
        };
      }
    }
    let parsed = parseSayCommandArgs();
    if (ctx.slicedArgs.length > 2 || ctx.slicedArgs.length < 1) {
      throw `Say Command: incorrect amount of args`;
    }
    if (ctx.slicedArgs.length === 1) {
      core.debug.log(`[SAY] ${ctx.slicedArgs[0].str}`);
      sayAction(core, "", ctx.slicedArgs[0].str, parsed.wait);
    } else {
      if (!ctx.slicedArgs[1].isQuoted)
        throw `Say Command: second arg should be quoted`;
      core.debug.log(`[SAY] ${ctx.slicedArgs[0].str}: ${ctx.slicedArgs[1].str}`);
      sayAction(core, ctx.slicedArgs[0].str, ctx.slicedArgs[1].str, parsed.wait);
    }
  });
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "pause")
      return next();
    if (ctx.slicedArgs.length > 2)
      throw `Pause Command: incorrect amount of args`;
    if (ctx.slicedArgs.length === 2) {
      if (ctx.slicedArgs[1].isQuoted || !isFinite(Number(ctx.slicedArgs[1].str)))
        throw `Pause Command: the second arg must be a number`;
      core.system.pause(Number(ctx.slicedArgs[1].str) * 1e3);
    } else
      core.system.pause();
  });
}
function sayAction(core, who, what, wait) {
  const say_view_tag = "hzengine.say";
  const say_view_name = "say";
  what = core.script.parseString(what);
  let message = {
    who,
    what
  };
  let router = core.ui.getRouter(say_view_tag);
  if (!router) {
    core.ui.addRouter(say_view_tag, "ct");
    router = core.ui.getRouter(say_view_tag);
  }
  if (!router.length) {
    router.push(say_view_name, message);
  } else {
    router.update(message);
  }
  if (wait) {
    if (core.config.getConfig("game.autoplay.enable")) {
      let delay = core.config.getConfig("game.autoplay.extra_delay") + core.config.getConfig("game.autoplay.ms_per_char") * what.length;
      if (isNaN(delay) || !isFinite(delay) || delay < 0) {
        throw `Say Action: AutoPlay Delay Error: ${delay} ms`;
      }
      core.system.pause(delay);
    } else {
      core.system.pause();
    }
  }
}
function character_command(core) {
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "character")
      return next();
    if (ctx.slicedArgs.length > 3)
      throw `Character Command: incorrect amount of args`;
    if (ctx.slicedArgs.length === 1)
      throw `Character Command: incorrect amount of args`;
    if (ctx.slicedArgs.length === 2)
      throw `Character Command: display name not specified`;
    if (ctx.slicedArgs[1].isQuoted)
      throw `Character Command: short name should not be quoted`;
    let short_name = ctx.slicedArgs[1].str;
    let characterMap = getCharacterMap();
    if (characterMap[short_name] != null) {
      if (characterMap[short_name].declare_info.path === ctx.currentPath && characterMap[short_name].declare_info.index === ctx.currentLineIndex) ;
      else
        throw `Character Command: short name [${short_name}] conflict, at file [${characterMap[short_name].declare_info.path}] line [${characterMap[short_name].declare_info.index + 1}] and `;
    } else {
      let display_name = ctx.slicedArgs[2].isQuoted ? core.script.parseString(ctx.slicedArgs[2].str) : ctx.slicedArgs[2].str;
      characterMap[short_name] = buildCharacterInfo(short_name, display_name);
    }
    function buildCharacterInfo(short_name2, display_name) {
      return {
        short_name: short_name2,
        display_name,
        declare_info: {
          path: ctx.currentPath,
          index: ctx.currentLineIndex
        }
      };
    }
  });
  function getCharacterMap() {
    return core.storage.getSaveableData(core.storage.archiveData, true, "script", "characterMap");
  }
  core.script.use((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted)
      return next();
    let characterMap = getCharacterMap();
    let short_name = ctx.slicedArgs[0].str;
    for (let key in characterMap) {
      let parseSayCommandArgs = function() {
        if (ctx.slicedArgs.length > 0 && ctx.slicedArgs[ctx.slicedArgs.length - 1].str === "nowait") {
          ctx.slicedArgs = ctx.slicedArgs.slice(0, ctx.slicedArgs.length - 1);
          return {
            wait: false
          };
        } else {
          return {
            wait: true
          };
        }
      };
      let parsed = parseSayCommandArgs();
      if (key === short_name) {
        if (ctx.slicedArgs.length != 2)
          throw `Character Say Command: incorrect amount of args`;
        console.log("Character Say Command:", short_name, ctx.slicedArgs[1].str);
        sayAction(core, characterMap[key].display_name, ctx.slicedArgs[1].str, parsed.wait);
        return;
      }
    }
    return next();
  });
}
function conditional(core) {
  core.script.use((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted || ctx.slicedArgs[0].str.toLowerCase() !== "if") {
      return next();
    }
    let data = ctx.startStatement("if");
    let if_expression_res = core.script.evalExpression(data.if_expression);
    if (typeof if_expression_res !== "boolean") {
      throw `If statement: if expression must return boolean, at file [${data.start_position[0]}] line [${data.start_position[1]}]`;
    }
    if (if_expression_res) {
      return;
    }
    for (let i = 0; i < data.elif_list.length; i++) {
      let item = data.elif_list[i];
      let elif_expression_res = core.script.evalExpression(item.expression);
      if (typeof elif_expression_res !== "boolean") {
        throw `If statement: elif expression must return boolean, at file [${item.position[0]}] line [${item.position[1]}]`;
      }
      if (elif_expression_res) {
        core.script.jump(item.position[0], item.position[1] + 1);
        return;
      }
    }
    if (data.else_position) {
      core.script.jump(data.else_position[0], data.else_position[1] + 1);
      return;
    }
    core.script.jump(data.end_position[0], data.end_position[1]);
  });
  core.script.use((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted || ctx.slicedArgs[0].str.toLowerCase() !== "elif") {
      return next();
    }
    if (ctx.statementStack.length === 0 || ctx.statementStack[ctx.statementStack.length - 1][0] !== "if") {
      throw `If statement: elif statement must come after if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    }
    let data = ctx.statementStack[ctx.statementStack.length - 1][2];
    for (let i = 0; i < data.elif_list.length; i++) {
      let item = data.elif_list[i];
      if (item.position[0] === ctx.currentPath && item.position[1] === ctx.currentLineIndex) {
        core.script.jump(data.end_position[0], data.end_position[1]);
        return;
      }
    }
    throw `If statement: elif statement not belong to the closest if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
  });
  core.script.use((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted || ctx.slicedArgs[0].str.toLowerCase() !== "else") {
      return next();
    }
    if (ctx.statementStack.length === 0 || ctx.statementStack[ctx.statementStack.length - 1][0] !== "if") {
      throw `If statement: else statement must come after if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    }
    let data = ctx.statementStack[ctx.statementStack.length - 1][2];
    if (data.else_position) {
      if (data.else_position[0] === ctx.currentPath && data.else_position[1] === ctx.currentLineIndex) {
        core.script.jump(data.end_position[0], data.end_position[1]);
        return;
      }
    }
    throw `If statement: else statement not belong to the closest if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
  });
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(/ +/).join(" ").toLowerCase() !== "end if") {
      return next();
    }
    if (ctx.statementStack.length === 0 || ctx.statementStack[ctx.statementStack.length - 1][0] !== "if") {
      throw `If statement: end if statement must come after if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    }
    ctx.endStatement("if");
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted || ctx.slicedArgs[0].str.toLowerCase() !== "if") {
      return next();
    }
    if (ctx.slicedArgs.length < 2) {
      throw `If statement: no expression specified, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    }
    ctx.startStatement("if", {
      start_position: [ctx.currentPath, ctx.currentLineIndex],
      if_expression: ctx.rawtext.trim().slice(2).trim(),
      elif_list: [],
      else_position: null
    });
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted || ctx.slicedArgs[0].str.toLowerCase() !== "elif") {
      return next();
    }
    if (ctx.slicedArgs.length < 2) {
      throw `If statement: no expression specified, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    }
    if (ctx.statementStack.length === 0 || ctx.statementStack[ctx.statementStack.length - 1][0] !== "if") {
      throw `If statement: elif statement must come after if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    }
    let data = ctx.statementStack[ctx.statementStack.length - 1][2];
    data.elif_list.push({
      position: [ctx.currentPath, ctx.currentLineIndex],
      expression: ctx.rawtext.trim().slice(4).trim()
    });
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted || ctx.slicedArgs[0].str.toLowerCase() !== "else") {
      return next();
    }
    if (ctx.statementStack.length === 0 || ctx.statementStack[ctx.statementStack.length - 1][0] !== "if") {
      throw `If statement: else statement must come after if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    }
    let data = ctx.statementStack[ctx.statementStack.length - 1][2];
    data.else_position = [ctx.currentPath, ctx.currentLineIndex];
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (ctx.rawtext.trim().split(/ +/).join(" ").toLowerCase() !== "end if") {
      return next();
    }
    let data = ctx.endStatement("if");
    data.end_position = [ctx.currentPath, ctx.currentLineIndex];
    ctx.setStatementData(data, [...data.start_position]);
  });
  core.script.use((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted || ctx.slicedArgs[0].str.toLowerCase() !== "while") {
      return next();
    }
    let data = ctx.startStatement("while");
    let expression = data.while_expression;
    let expression_res = core.script.evalExpression(expression);
    if (typeof expression_res !== "boolean") {
      throw `While statement: while expression must return boolean, at file [${data.start_position[0]}] line [${data.start_position[1]}]`;
    }
    if (!expression_res) {
      ctx.endStatement("while");
      core.script.jump(...data.end_position, false);
      core.script.incrementNextPosition();
    } else {
      return;
    }
  });
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(/ +/).join(" ").toLowerCase() !== "end while") {
      return next();
    }
    if (ctx.statementStack.length === 0 || ctx.statementStack[ctx.statementStack.length - 1][0] !== "while") {
      throw `While statement: end while statement must come after while statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    }
    let data = ctx.statementStack[ctx.statementStack.length - 1][2];
    ctx.endStatement("while");
    core.script.jump(...data.start_position, false);
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted || ctx.slicedArgs[0].str.toLowerCase() !== "while") {
      return next();
    }
    let while_expression = ctx.rawtext.trim().slice(5).trim();
    if (while_expression === "") {
      throw `While statement: no expression specified, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    }
    ctx.startStatement("while", {
      start_position: [ctx.currentPath, ctx.currentLineIndex],
      while_expression,
      end_position: [ctx.currentPath, ctx.currentLineIndex]
    });
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (ctx.rawtext.trim().split(/ +/).join(" ").toLowerCase() !== "end while") {
      return next();
    }
    let data = ctx.endStatement("while");
    data.end_position = [ctx.currentPath, ctx.currentLineIndex];
    ctx.setStatementData(data, [...data.start_position]);
  });
  core.script.use((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted || ctx.slicedArgs.length !== 1 || ctx.slicedArgs[0].str.toLowerCase() !== "break") {
      return next();
    }
    let resIndex = -1;
    for (let i = ctx.statementStack.length - 1; i >= 0; i--) {
      if (ctx.statementStack[i][0] === "while") {
        resIndex = i;
        break;
      }
    }
    if (resIndex === -1) {
      throw `Break command: break statement must come after while statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    }
    let data = ctx.statementStack[resIndex][2];
    core.debug.log(`Break command: break from ${ctx.statementStack[resIndex][0]} statement at file [${data.start_position[0]}] line [${data.start_position[1] + 1}]`);
    core.script.jump(...data.end_position, false);
    core.script.incrementNextPosition();
    ctx.statementStack.splice(resIndex + 1, ctx.statementStack.length - resIndex - 1);
  });
}
function config_command(core) {
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "set")
      return next();
    if (ctx.slicedArgs.length !== 3)
      throw `Set Command: incorrect amount of args`;
    let key = ctx.slicedArgs[1].str;
    let val = ctx.slicedArgs[2].str;
    if (!ctx.slicedArgs[2].isQuoted) {
      if (val === "true" || val === "false") {
        val = val === "true";
      } else if (!isNaN(val)) {
        val = Number(val);
      } else
        throw `Set Command: value type not supported`;
    }
    core.config.setConfig(key, val);
  });
}
function splitStr2Objs(str) {
  let res = [];
  let len = str.length;
  let p = 0;
  while (p < len) {
    while (p < len && str[p] === " ")
      ++p;
    if (p === len)
      return res;
    if (str[p] === '"') {
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
      let transformedStr = "error";
      try {
        transformedStr = transformStr(resstr);
      } catch (e) {
        throw "该字符串中的转义字符有错误：" + resstr;
      }
      res.push({ str: transformedStr, isQuoted: true });
      p = q + 1;
    } else if (str[p] === "[") {
      let q = p + 1;
      while (q < len && str[q] !== "]") {
        ++q;
      }
      if (q >= len)
        throw "square brackets not completed";
      let resstr = str.slice(p + 1, q);
      res.push({ str: resstr, isSquared: true });
      p = q + 1;
    } else if (str[p] === "(") {
      let q = p + 1;
      while (q < len && str[q] !== ")") {
        ++q;
      }
      if (q >= len)
        throw "round brackets not completed";
      let resstr = str.slice(p + 1, q);
      res.push({ str: resstr, isRounded: true });
      p = q + 1;
    } else {
      let q = p + 1;
      while (q < len && str[q] !== " " && str[q] !== '"' && str[q] !== "(" && str[q] !== "[")
        ++q;
      let resstr = str.slice(p, q);
      res.push({ str: resstr, isQuoted: false });
      p = q;
    }
  }
  return res;
}
function mergeObjs2Str(objs) {
  return objs.map((obj) => obj.isQuoted ? `"${obj.str}"` : obj.isSquared ? `[${obj.str}]` : obj.isRounded ? `(${obj.str})` : obj.str).join(" ");
}
function splitStr2Strs(str) {
  return splitStr2Objs(str).map((obj) => obj.isQuoted ? `"${obj.str}"` : obj.str);
}
function transformStr(str) {
  return JSON.parse(`"${str}"`);
}
function parseInterpolatedStr(str) {
  let len = str.length;
  let p = 0;
  let expr_record = [];
  while (p < len) {
    while (p < len && str[p] !== "[")
      ++p;
    if (p >= len)
      break;
    if (str[p] === "[" && str[p + 1] === "[") {
      p += 2;
      continue;
    }
    let q = p + 1;
    while (q < len && str[q] !== "]") {
      ++q;
      while (q < len && str[q] === "]" && str[q + 1] === "]") {
        q += 2;
      }
    }
    if (q >= len) {
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
    } else if (str[i] === `"`) {
      quoteNotClosed = !quoteNotClosed;
    } else if (str[i] === "#" && !quoteNotClosed) {
      return str.slice(0, i);
    }
  }
  return str;
}
function decorator_module(core) {
  core.script.use((ctx, next) => {
    if (!ctx.slicedArgs[0].isSquared)
      return next();
    let decorator = ctx.slicedArgs[0].str.toLowerCase();
    switch (splitStr2Strs(decorator).join("").toLowerCase()) {
      case "real=true":
        core.storage.globalData.realEnv = true;
        break;
      case "real":
        if (!core.storage.globalData.realEnv) {
          return;
        }
        break;
      default:
        core.debug.log(`Decorator: Unknown decorator [${decorator}]`);
    }
    ctx.rawtext = ctx.rawtext.trim().slice(ctx.slicedArgs[0].str.length + 2).trim();
    if (!ctx.rawtext.length)
      return;
    return next();
  }, true);
}
function eval_module(core) {
  core.script.use((ctx, next) => {
    if (ctx.slicedArgs[0].isQuoted || ctx.slicedArgs[0].str.toLowerCase() !== "eval") {
      return next();
    }
    if (ctx.slicedArgs.length === 1) {
      throw `Eval Command: no code specified`;
    }
    if (ctx.slicedArgs.length === 2) {
      core.script.evalScope(ctx.slicedArgs[1].str);
    } else {
      core.script.evalScope(ctx.rawtext.trim().slice(4).trim());
    }
  });
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0] !== "script") {
      return next();
    }
    let data = ctx.startStatement("script");
    core.script.evalScope(data.js_code_scope);
    core.script.jump(data.end_position[0], data.end_position[1]);
  });
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(/ +/).join(" ") !== "end script")
      return next();
    ctx.endStatement("script");
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0] !== "script") {
      return next();
    }
    let data = ctx.startStatement("script");
    data.start_position = [ctx.currentPath, ctx.currentLineIndex];
    data.js_code_scope = "";
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (ctx.statementStack.length && ctx.statementStack[ctx.statementStack.length - 1][0] === "script") {
      if (ctx.rawtext.trim().split(/ +/).join(" ") === "end script") {
        let data = ctx.endStatement("script");
        data.end_position = [ctx.currentPath, ctx.currentLineIndex];
        ctx.setStatementData(data, [...data.start_position]);
      } else {
        ctx.statementStack[ctx.statementStack.length - 1][2].js_code_scope += ctx.rawtext.trim() + "\n";
      }
    } else
      return next();
  }, true);
}
function img(core) {
  let transform_plugin = core.plugins.get("transform");
  if (!transform_plugin)
    core.debug.log("[IMG Plugin] Info: Transform plugin not set up");
  core.script.use((ctx, next) => {
    var _a;
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "show")
      return next();
    if (ctx.slicedArgs.length === 1)
      throw `Show Command: incorrect amount of args`;
    if (ctx.slicedArgs.length === 2)
      throw `Show Command: incorrect amount of args`;
    let parsedRes = parseImgCommandFields(ctx);
    ctx.slicedArgs = parsedRes.leftedArgs;
    let tag = ctx.slicedArgs[1].str;
    let name_key = "";
    for (let i = 1; i < ctx.slicedArgs.length; ++i) {
      name_key += ctx.slicedArgs[i].str + " ";
    }
    name_key = name_key.trim().toLowerCase();
    let path = (_a = core.storage.preloadedData.image.nameMap[name_key]) == null ? void 0 : _a[0];
    if (!path)
      throw `Show Command: image with name_key [${name_key}] not found `;
    let size = core.platform.getImageInfo(path);
    console.log(`IMG: path: ${path}, size: ${JSON.stringify(size)}`);
    if (!size)
      throw `Show Command: read size of [${path}] failed`;
    showAction(tag, path, size, parsedRes.strategy);
  });
  function showAction(tag, path, size, routerStrategy) {
    const show_view_tag_prefix = "hzengine.img";
    const show_view_name = "fg_img";
    let prop = {
      imgPath: path,
      offset: {
        x: 0,
        y: 0
      },
      size: {
        width: size.width,
        height: size.height
      }
    };
    let tag_prefixed = `${show_view_tag_prefix}.${tag}`;
    let router = core.ui.getRouter(tag_prefixed);
    if (!router) {
      core.ui.addRouter(tag_prefixed, "fg");
      router = core.ui.getRouter(tag_prefixed);
    }
    Async.nextTick(() => {
      router.replace(show_view_name, prop, routerStrategy != null ? routerStrategy : void 0);
    });
  }
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "hide")
      return next();
    let parsedRes = parseImgCommandFields(ctx);
    ctx.slicedArgs = parsedRes.leftedArgs;
    if (ctx.slicedArgs.length !== 2) {
      throw `Hide Command: incorrect amount of args`;
    }
    let tag = ctx.slicedArgs[1].str;
    hideAction(tag, parsedRes.strategy);
  });
  function hideAction(tag, routerStrategy) {
    const show_view_tag_prefix = "hzengine.img";
    let tag_prefixed = `${show_view_tag_prefix}.${tag}`;
    let router = core.ui.getRouter(tag_prefixed);
    if (!router) {
      throw `Hide Command: router with tag [${tag}] not found `;
    }
    Async.nextTick(() => {
      router.clear(routerStrategy != null ? routerStrategy : void 0);
    });
  }
  core.script.use((ctx, next) => {
    var _a;
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "scene")
      return next();
    if (ctx.slicedArgs.length === 1)
      throw `Scene Command: incorrect amount of args`;
    if (ctx.slicedArgs.length === 2)
      throw `Scene Command: incorrect amount of args`;
    let parsedRes = parseImgCommandFields(ctx);
    ctx.slicedArgs = parsedRes.leftedArgs;
    let tag = ctx.slicedArgs[1].str;
    let name_key = "";
    for (let i = 1; i < ctx.slicedArgs.length; ++i) {
      name_key += ctx.slicedArgs[i].str + " ";
    }
    name_key = name_key.trim().toLowerCase();
    let path = (_a = core.storage.preloadedData.image.nameMap[name_key]) == null ? void 0 : _a[0];
    if (!path)
      throw `Scene Command: image with name_key [${name_key}] not found `;
    let size = core.platform.getImageInfo(path);
    if (!size)
      throw `Scene Command: read size of [${path}] failed`;
    sceneAction(tag, path, size, parsedRes.strategy);
  });
  function sceneAction(tag, path, size, routerStrategy) {
    const scene_view_tag_prefix = "hzengine.img";
    const scene_view_name = "bg_img";
    let prop = {
      imgPath: path,
      offset: {
        x: 0,
        y: 0
      },
      size: {
        width: size.width,
        height: size.height
      }
    };
    let tag_prefixed = `${scene_view_tag_prefix}.${tag}`;
    let router = core.ui.getRouter(tag_prefixed);
    if (!router) {
      core.ui.addRouter(tag_prefixed, "bg");
      router = core.ui.getRouter(tag_prefixed);
    }
    if (!router.length) {
      Async.nextTick(() => {
        router.push(scene_view_name, prop, routerStrategy != null ? routerStrategy : void 0);
      });
    } else {
      Async.nextTick(() => {
        router.update(prop, routerStrategy != null ? routerStrategy : void 0);
      });
    }
  }
  function parseImgCommandFields(ctx) {
    let slicedArgs = JSON.parse(JSON.stringify(ctx.slicedArgs));
    let res = {
      strategy: null,
      wait: false,
      leftedArgs: slicedArgs
    };
    if (slicedArgs[slicedArgs.length - 1].str === "wait") {
      res.wait = true;
      slicedArgs.pop();
    } else if (slicedArgs[slicedArgs.length - 1].str === "nowait") {
      res.wait = false;
      slicedArgs.pop();
    }
    let keywords = ["with", "at"];
    let inTransforms = [];
    let outTransforms = [];
    while (true) {
      let keyword_index = findLastIndex(slicedArgs, (slicedArg) => !slicedArg.isQuoted && !slicedArg.isSquared && keywords.includes(slicedArg.str));
      if (keyword_index === -1)
        break;
      let keyword = slicedArgs[keyword_index].str;
      let currentFieldArgs = slicedArgs.splice(keyword_index, slicedArgs.length - keyword_index);
      currentFieldArgs.shift();
      if (keyword === "at") {
        inTransforms.push(...Script.Utils.splitCommas(Script.Utils.joinSlicedArgs(currentFieldArgs)));
      } else if (keyword === "with") {
        let args = Script.Utils.parseHzsArgs(Script.Utils.joinSlicedArgs(currentFieldArgs));
        for (let i = 0; i < args.length; i++) {
          if (Array.isArray(args[i])) {
            if (args[i].length > 2)
              throw `Invalid Annoymous Transition Tuple: ${JSON.stringify(args[i])}`;
            console.log(`Annoymous Transition Tuple: ${JSON.stringify(args[i])}`);
            if (args[i].length >= 1) {
              if (Array.isArray(args[i][0])) {
                outTransforms.push(...args[i][0]);
              } else {
                outTransforms.push(args[i][0]);
              }
            }
            if (args[i].length >= 2) {
              if (Array.isArray(args[i][1])) {
                inTransforms.push(...args[i][1]);
              } else {
                inTransforms.push(args[i][1]);
              }
            }
          } else {
            let transition = transform_plugin.getTransition(args[i]);
            if (!transition) {
              core.debug.log(`Transition ${args[i]} not found`);
              continue;
            } else {
              core.debug.log(`Transition ${args[i]} = ${JSON.stringify(transition)}`);
              inTransforms.push(...transition.inTransforms);
              outTransforms.push(...transition.outTransforms);
            }
          }
        }
      }
    }
    res.strategy = transform_plugin.createStrategy(outTransforms.length ? outTransforms : null, inTransforms.length ? inTransforms : null);
    return res;
  }
  function findLastIndex(array, predicator) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (predicator(array[i])) {
        return i;
      }
    }
    return -1;
  }
}
function menu_statement(core) {
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0] !== "menu")
      return next();
    let menu_data = ctx.startStatement("menu");
    core.system.block();
    let router = core.ui.getRouter("menu");
    if (!router) {
      core.ui.addRouter("menu", "ct");
      router = core.ui.getRouter("menu");
    }
    let menu_view_prop = buildMenuViewProp(menu_data);
    if (!router.length) {
      router.push("menu", menu_view_prop);
    } else {
      router.update(menu_view_prop);
    }
  });
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(/ +/).join(" ") !== "end menu")
      return next();
    ctx.endStatement("menu");
  });
  core.script.use((ctx, next) => {
    if (!ctx.rawtext.trim().split(" ")[0].startsWith("@"))
      return next();
    let label_name = ctx.slicedArgs[1].str;
    if (ctx.statementStack.length === 0 || ctx.statementStack[ctx.statementStack.length - 1][0] !== "menu") {
      throw `@${label_name} must in menu statement`;
    }
    let menu_item = ctx.statementStack[ctx.statementStack.length - 1];
    let menu_data = menu_item[2];
    for (let i = 0; i < menu_data.item_list.length; i++) {
      if (menu_data.item_list[i].position[0] === ctx.currentPath && menu_data.item_list[i].position[1] === ctx.currentLineIndex) {
        let end_menu_position = [
          ...menu_data.end_position
        ];
        core.script.jump(end_menu_position[0], end_menu_position[1]);
        return;
      }
    }
    throw `@${label_name} does not belong to closest menu statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex + 1}], but belong to [${menu_item[1][0]}] line [${menu_item[1][1] + 1}]`;
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0] !== "menu")
      return next();
    let data = ctx.startStatement("menu");
    data.start_position = [
      ctx.currentPath,
      ctx.currentLineIndex
    ];
    data.item_list = [];
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (!ctx.rawtext.trim().split(" ")[0].startsWith("@"))
      return next();
    if (ctx.statementStack.length === 0 || ctx.statementStack[ctx.statementStack.length - 1][0] !== "menu") {
      throw `@${ctx.slicedArgs[1]} must in menu statement`;
    }
    let menu_stack_item = ctx.statementStack[ctx.statementStack.length - 1];
    let enable_js_expression = void 0;
    if (ctx.slicedArgs.length > 2) {
      enable_js_expression = ctx.slicedArgs[2].str;
      if (!enable_js_expression.startsWith("enable=")) {
        throw `enable js expression must start with "enable="`;
      }
      enable_js_expression = enable_js_expression.slice(7);
      if (enable_js_expression.startsWith("{") && enable_js_expression.endsWith("}")) {
        enable_js_expression = enable_js_expression.slice(1, -1);
      } else {
        enable_js_expression = enable_js_expression.trim();
      }
      if (enable_js_expression.length > 0) {
        enable_js_expression = `(${enable_js_expression})`;
      } else {
        throw `enable js expression must not be empty`;
      }
    }
    menu_stack_item[2].item_list.push({
      text: ctx.slicedArgs[1].str,
      position: [ctx.currentPath, ctx.currentLineIndex],
      enable_js_expression
    });
  });
  core.script.useAnalyseStatement((ctx, next) => {
    if (ctx.rawtext.trim().split(/ +/).join(" ") !== "end menu")
      return next();
    let data = ctx.endStatement("menu");
    data.end_position = [ctx.currentPath, ctx.currentLineIndex];
    ctx.setStatementData(data, [
      data.start_position[0],
      data.start_position[1]
    ]);
  });
  function buildMenuViewProp(menu_data) {
    let parsed_item_list = [];
    for (let item of menu_data.item_list) {
      parsed_item_list.push({ ...item, text: core.script.parseString(item.text) });
    }
    return { itemList: parsed_item_list };
  }
}
function basic_command(core) {
  basic_commands(core);
  character_command(core);
  menu_statement(core);
  decorator_module(core);
  $_command(core);
  eval_module(core);
  conditional(core);
  img(core);
  audio_command(core);
  config_command(core);
}
function global_gesture(core) {
  function addTouchPad(layerInstance) {
    core.debug.log("[TouchPad] Not implemented");
  }
  addTouchPad(core.ui.getLayer("ct"));
  core.on("afterAddLayer", (layerInstance) => {
    if (layerInstance.name !== "ct")
      return;
    addTouchPad();
  });
}
class Animation {
  constructor(profile, options) {
    __publicField(this, "normalizedProfile");
    __publicField(this, "initProps", {});
    __publicField(this, "activeRootTrack", null);
    __publicField(this, "lastTime", 0);
    __publicField(this, "onFrame", null);
    __publicField(this, "onEnd", null);
    __publicField(this, "customWrappers", {});
    __publicField(this, "onStop", null);
    this.normalizedProfile = Profile.normalize(profile);
    console.log(`Animation: ${JSON.stringify(profile)}`);
    if (options) {
      options.initProps && (this.initProps = options.initProps);
      options.wrappers && (this.customWrappers = options.wrappers);
    }
  }
  serialize() {
    var _a;
    return {
      normalizedProfile: this.normalizedProfile,
      initProps: this.initProps,
      activeRootTrack: (_a = this.activeRootTrack) == null ? void 0 : _a.serialize(),
      lastTime: this.lastTime
    };
  }
  static unserialize(serialized, wrappers) {
    let profile = serialized.normalizedProfile;
    let animation = new Animation(profile, {
      initProps: serialized.initProps,
      wrappers
    });
    animation.lastTime = serialized.lastTime;
    serialized.activeRootTrack && (animation.activeRootTrack = ActiveTrackNode.unserialize(animation, serialized.activeRootTrack));
    return animation;
  }
  timerCb() {
  }
  init() {
    this.activeRootTrack = new ActiveTrackNode(this, {
      accessKeys: [],
      index: 0,
      initProps: this.initProps
    });
  }
  goto(time) {
    if (!this.activeRootTrack) {
      this.init();
    }
    if (time < 0)
      time = 0;
    if (time < this.lastTime) {
      this.init();
      try {
        this.activeRootTrack.step(time);
      } catch (e) {
        console.log(e);
        this.activeRootTrack.status = ActiveTrackNode.Status.Pause;
      }
      if (this.activeRootTrack.status === ActiveTrackNode.Status.Pause) {
        if (this.onEnd)
          this.onEnd();
      }
    } else {
      if (this.activeRootTrack.status !== ActiveTrackNode.Status.Pause) {
        try {
          this.activeRootTrack.step(time - this.lastTime);
        } catch (e) {
          console.log(e);
          this.activeRootTrack.status = ActiveTrackNode.Status.Pause;
        }
      }
    }
    this.lastTime = time;
    if (this.onFrame) {
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
  reverse() {
  }
  stop() {
  }
  _accessProfile(accessKeys) {
    let section = this.normalizedProfile;
    for (let i = 0; i < accessKeys.length; i++) {
      section = section[accessKeys[i]];
    }
    return section;
  }
  _getWrapper(wrapper) {
    var _a, _b;
    if (typeof wrapper === "string") {
      return (_b = (_a = this.customWrappers[wrapper]) != null ? _a : buildInWrappers[wrapper]) != null ? _b : buildInWrappers.none;
    } else if (wrapper === void 0) {
      return buildInWrappers.none;
    } else
      return wrapper;
  }
  _calcWrappedProps(former_props, props, wrapper, progress) {
    let _former_props = { ...former_props };
    let wrapper_func = this._getWrapper(wrapper);
    let wraped_prog = wrapper_func(progress);
    let res = { ..._former_props };
    for (let key in props) {
      if (typeof props[key] === "number") {
        if (_former_props[key] == void 0)
          _former_props[key] = 0;
        res[key] = _former_props[key] + wraped_prog * (props[key] - _former_props[key]);
      } else if (typeof props[key] === "boolean") {
        if (_former_props[key] == void 0)
          _former_props[key] = false;
        res[key] = wraped_prog === 1 ? props[key] : _former_props[key];
      } else if (typeof props[key] === "string") {
        if (_former_props[key] == void 0)
          _former_props[key] = "";
        res[key] = wraped_prog === 1 ? props[key] : _former_props[key];
      } else {
        res[key] = props[key];
      }
    }
    return res;
  }
}
var Profile;
(function(Profile2) {
  function normalize(profile) {
    if (!Array.isArray(profile)) {
      return [profile];
    } else if (profile.length === 0) {
      return [];
    } else if (!Array.isArray(profile[0])) {
      return profile;
    } else {
      return [
        {
          syncs: profile
        }
      ];
    }
  }
  Profile2.normalize = normalize;
})(Profile || (Profile = {}));
const _ActiveTrackNode = class _ActiveTrackNode {
  constructor(animation, { accessKeys, index, initProps }) {
    __publicField(this, "animation");
    __publicField(this, "accessKeys");
    __publicField(this, "currentIndex");
    __publicField(this, "repeated", 0);
    __publicField(this, "status", _ActiveTrackNode.Status.Playing);
    __publicField(this, "now_time", 0);
    __privateAdd(this, _currentSection, null);
    __privateAdd(this, _currentIndex, null);
    __privateAdd(this, _currentTrack, null);
    __publicField(this, "lastProps", {});
    __publicField(this, "nowProps", {});
    __publicField(this, "activeSyncs", []);
    this.animation = animation;
    this.accessKeys = accessKeys;
    this.currentIndex = index;
    this.lastProps = { ...initProps };
    this.nowProps = { ...initProps };
  }
  get currentSection() {
    if (__privateGet(this, _currentSection) === null) {
      if (this.currentIndex === null) {
        __privateSet(this, _currentSection, this.animation._accessProfile(this.accessKeys));
      } else {
        __privateSet(this, _currentSection, this.currentTrack[this.currentIndex]);
      }
      __privateSet(this, _currentIndex, this.currentIndex);
    } else if (this.currentIndex !== __privateGet(this, _currentIndex)) {
      __privateSet(this, _currentSection, this.currentTrack[this.currentIndex]);
      __privateSet(this, _currentIndex, this.currentIndex);
    }
    return __privateGet(this, _currentSection);
  }
  get currentTrack() {
    if (__privateGet(this, _currentTrack) === null && this.currentIndex !== null) {
      __privateSet(this, _currentTrack, this.animation._accessProfile(this.accessKeys));
    }
    return __privateGet(this, _currentTrack);
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
      activeSyncs: this.activeSyncs.map((sync) => sync.serialize())
    };
  }
  static unserialize(animation, serialized) {
    let node = new _ActiveTrackNode(animation, {
      accessKeys: serialized.accessKeys,
      index: serialized.currentIndex,
      initProps: serialized.lastProps
    });
    node.lastProps = serialized.lastProps;
    node.nowProps = serialized.nowProps;
    node.status = serialized.status;
    node.repeated = serialized.repeated;
    node.now_time = serialized.now_time;
    node.activeSyncs = serialized.activeSyncs.map((sync) => _ActiveTrackNode.unserialize(animation, sync));
    return node;
  }
  /**
   *
   * @param delta_time
   * @returns 剩餘的時間
   */
  step(delta_time) {
    var _a;
    if (!this.currentSection) {
      this.status = _ActiveTrackNode.Status.Pause;
      return delta_time;
    }
    while (true) {
      if (this.status === _ActiveTrackNode.Status.Playing) {
        if (this.currentSection.time === void 0 || this.currentSection.time <= 0) {
          this.nowProps = { ...this.nowProps, ...this.currentSection.frame };
        } else {
          if (this.now_time + delta_time >= this.currentSection.time) {
            delta_time -= this.currentSection.time - this.now_time;
            this.nowProps = { ...this.nowProps, ...this.currentSection.frame };
          } else {
            this.now_time += delta_time;
            delta_time = 0;
            let progress = this.now_time / this.currentSection.time;
            this.nowProps = this.animation._calcWrappedProps(this.lastProps, (_a = this.currentSection.frame) != null ? _a : {}, this.currentSection.wrapper, progress);
            break;
          }
        }
        if (this.currentSection.syncs && this.currentSection.syncs.length > 0) {
          this.initSyncs();
          this.status = _ActiveTrackNode.Status.WaitingSyncs;
        }
      }
      if (this.status === _ActiveTrackNode.Status.WaitingSyncs) {
        delta_time = this.stepSyncs(delta_time);
        this.nowProps = Object.assign(this.nowProps, this.getSyncsProps());
        if (this.checkSyncsFinished()) {
          this.status = _ActiveTrackNode.Status.Playing;
          this.activeSyncs = [];
        } else {
          if (delta_time !== 0)
            throw "syncs not finished while lefted time != 0. may be bugs";
          break;
        }
      }
      if (this.currentSection.repeat !== void 0) {
        this.repeated++;
        if (this.repeated >= this.currentSection.repeat) {
          if (this._switchNextSection())
            continue;
          else
            break;
        } else {
          this.now_time = 0;
          this.nowProps = { ...this.lastProps };
          continue;
        }
      } else {
        if (this._switchNextSection())
          continue;
        else
          break;
      }
    }
    return delta_time;
  }
  calcProps() {
    return this.nowProps;
  }
  _switchNextSection() {
    if (this.currentIndex === null || this.currentTrack.length === this.currentIndex + 1) {
      this.status = _ActiveTrackNode.Status.Pause;
      return false;
    } else {
      this.lastProps = { ...this.nowProps };
      this.repeated = 0;
      this.now_time = 0;
      this.currentIndex++;
      return true;
    }
  }
  initSyncs() {
    let activeSyncs = [];
    let subprofile = this.currentSection.syncs;
    let activeTrackNode;
    if (Array.isArray(subprofile)) {
      if (subprofile.length > 0 && Array.isArray(subprofile[0])) {
        for (let j = 0; j < subprofile.length; ++j) {
          activeTrackNode = new _ActiveTrackNode(this.animation, {
            accessKeys: [
              ...this.accessKeys,
              "" + this.currentIndex,
              "syncs",
              "" + j
            ],
            index: 0,
            initProps: this.nowProps
            // TODO 因为 lastProps在切换的时候才会更新，所以用nowProps
          });
          activeSyncs.push(activeTrackNode);
        }
      } else {
        activeTrackNode = new _ActiveTrackNode(this.animation, {
          accessKeys: [...this.accessKeys, "" + this.currentIndex, "syncs"],
          index: 0,
          initProps: this.nowProps
          // TODO 因为 lastProps在切换的时候才会更新，所以用nowProps
        });
        activeSyncs.push(activeTrackNode);
        console.log();
      }
    } else {
      activeTrackNode = new _ActiveTrackNode(this.animation, {
        accessKeys: [...this.accessKeys, "" + this.currentIndex, "syncs"],
        index: null,
        initProps: this.nowProps
        // TODO 因为 lastProps在切换的时候才会更新，所以用nowProps
      });
      activeSyncs.push(activeTrackNode);
    }
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
      if (this.activeSyncs[i].status !== _ActiveTrackNode.Status.Pause)
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
};
_currentSection = new WeakMap();
_currentIndex = new WeakMap();
_currentTrack = new WeakMap();
let ActiveTrackNode = _ActiveTrackNode;
(function(ActiveTrackNode2) {
  (function(Status) {
    Status[Status["Playing"] = 0] = "Playing";
    Status[Status["WaitingSyncs"] = 1] = "WaitingSyncs";
    Status[Status["Pause"] = 2] = "Pause";
  })(ActiveTrackNode2.Status || (ActiveTrackNode2.Status = {}));
})(ActiveTrackNode || (ActiveTrackNode = {}));
const buildInWrappers = {
  none: (x) => x < 1 ? 0 : 1,
  linear: (x) => x,
  easeout: (x) => Math.pow(x, 3),
  easein: (x) => 1 - Math.pow(1 - x, 3),
  easeinout: (x) => x < 0.5 ? 0.5 * Math.pow(x, 3) : 1 - 0.5 * Math.pow(1 - x, 3)
};
var __esDecorate$3 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var __runInitializers$3 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
let AnimationPlugin = (() => {
  var __nextAnimationId_accessor_storage, __animationMap_accessor_storage, _a;
  let __nextAnimationId_decorators;
  let __nextAnimationId_initializers = [];
  let __nextAnimationId_extraInitializers = [];
  let __animationMap_decorators;
  let __animationMap_initializers = [];
  let __animationMap_extraInitializers = [];
  return _a = class {
    constructor(_core) {
      __publicField(this, "_core");
      __privateAdd(this, __nextAnimationId_accessor_storage, __runInitializers$3(this, __nextAnimationId_initializers, 1));
      __privateAdd(this, __animationMap_accessor_storage, (__runInitializers$3(this, __nextAnimationId_extraInitializers), __runInitializers$3(this, __animationMap_initializers, {})));
      // private _timeSensor = new Time();
      __publicField(this, "_lastCbUtc", __runInitializers$3(this, __animationMap_extraInitializers));
      __publicField(this, "_nextTempAnimationId", -1);
      // self-decrement
      __publicField(this, "_tempAnimationMap", {});
      this._core = _core;
      console.log("[AnimationPlugin] init");
      _core.loadPlugin("animation", () => this);
      _core.on("anime.cb", this._timerCb.bind(this));
      _core.async.addRepeatTask("anime.cb", [], 0);
      this._lastCbUtc = this._core.platform.getTime();
    }
    get _nextAnimationId() {
      return __privateGet(this, __nextAnimationId_accessor_storage);
    }
    // self-increment
    set _nextAnimationId(value) {
      __privateSet(this, __nextAnimationId_accessor_storage, value);
    }
    get _animationMap() {
      return __privateGet(this, __animationMap_accessor_storage);
    }
    set _animationMap(value) {
      __privateSet(this, __animationMap_accessor_storage, value);
    }
    applyAnimation({ profile, targetView, options }) {
      var _a2, _b, _c;
      const id2 = this._nextAnimationId++;
      let animation = new Animation(profile, {
        // @ts-ignore
        initProps: (_a2 = targetView.prop) != null ? _a2 : {},
        wrappers: options == null ? void 0 : options.customWrappers
      });
      if (!targetView.id)
        throw "targetView.id must be not null";
      this._animationMap[id2] = {
        destroyOnEnd: (_b = options == null ? void 0 : options.destroyOnEnd) != null ? _b : false,
        isSave: (_c = options == null ? void 0 : options.isSave) != null ? _c : true,
        instance: animation,
        targetViewId: targetView.id
      };
      this._linkAnimationCb(animation, id2);
      animation.goto(0);
      this._core.on("afterLoadArchive", () => {
        this._lastCbUtc = this._core.platform.getTime();
      });
      return id2;
    }
    stopAnimation(id2) {
      if (this._animationMap[id2] !== void 0) {
        this._animationMap[id2].instance.stop();
        delete this._animationMap[id2];
      }
    }
    createTempAnimation({ profile, onFrame, onEnd, initProps, wrappers }) {
      let id2 = this._nextTempAnimationId--;
      let animation = new Animation(profile, {
        initProps,
        wrappers
      });
      animation.onFrame = onFrame != null ? onFrame : null;
      animation.onEnd = () => {
        if (onEnd)
          onEnd();
        delete this._tempAnimationMap[id2];
      };
      this._tempAnimationMap[id2] = animation;
      return id2;
    }
    clearTempAnimation(id2) {
      if (this._tempAnimationMap[id2] !== void 0) {
        this._tempAnimationMap[id2].stop();
        delete this._tempAnimationMap[id2];
      }
    }
    _timerCb() {
      let utc = this._core.platform.getTime();
      let delta_time = (utc - this._lastCbUtc) / 1e3;
      this._lastCbUtc = utc;
      for (let id2 in this._animationMap) {
        this._animationMap[id2].instance.step(delta_time);
      }
      for (let id2 in this._tempAnimationMap) {
        this._tempAnimationMap[id2].step(delta_time);
      }
    }
    _frameCb(props, id2) {
      if (this._animationMap[id2] !== void 0) {
        let view = this._core.ui.getView(this._animationMap[id2].targetViewId);
        if (!view) {
          this._core.debug.log(`view ${id2} not found, stop animation`);
          this.stopAnimation(id2);
          return;
        }
        view.commit(props);
      }
    }
    _linkAnimationCb(animation, id2) {
      animation.onFrame = (props) => {
        this._frameCb(props, id2);
      };
      animation.onEnd = () => this._endCb(id2);
    }
    _endCb(id2) {
      if (this._animationMap[id2] !== void 0) {
        if (this._animationMap[id2].destroyOnEnd) {
          let view = this._core.ui.getView(id2);
          if (view)
            this._core.ui.destroyView(view);
        }
        delete this._animationMap[id2];
        console.log("map item", this._animationMap[id2]);
      } else
        console.log("nf map item", this._animationMap[id2]);
    }
  }, __nextAnimationId_accessor_storage = new WeakMap(), __animationMap_accessor_storage = new WeakMap(), (() => {
    const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
    __nextAnimationId_decorators = [Save("anime.nid")];
    __animationMap_decorators = [CustomSave("anime.map", function(obj) {
      let res = {};
      for (let id2 in obj) {
        if (!obj[id2].isSave)
          continue;
        res[id2] = {
          destroyOnEnd: obj[id2].destroyOnEnd,
          isSave: obj[id2].isSave,
          targetViewId: obj[id2].targetViewId,
          serializedInstance: obj[id2].instance.serialize()
        };
      }
      return res;
    }, function(obj) {
      let res = {};
      for (let id2 in obj) {
        if (!obj[id2].isSave)
          continue;
        let animation = Animation.unserialize(obj[id2].serializedInstance);
        this._linkAnimationCb(animation, Number(id2));
        res[id2] = {
          destroyOnEnd: obj[id2].destroyOnEnd,
          isSave: obj[id2].isSave,
          targetViewId: obj[id2].targetViewId,
          instance: animation
        };
      }
      return res;
    })];
    __esDecorate$3(_a, null, __nextAnimationId_decorators, { kind: "accessor", name: "_nextAnimationId", static: false, private: false, access: { has: (obj) => "_nextAnimationId" in obj, get: (obj) => obj._nextAnimationId, set: (obj, value) => {
      obj._nextAnimationId = value;
    } }, metadata: _metadata }, __nextAnimationId_initializers, __nextAnimationId_extraInitializers);
    __esDecorate$3(_a, null, __animationMap_decorators, { kind: "accessor", name: "_animationMap", static: false, private: false, access: { has: (obj) => "_animationMap" in obj, get: (obj) => obj._animationMap, set: (obj, value) => {
      obj._animationMap = value;
    } }, metadata: _metadata }, __animationMap_initializers, __animationMap_extraInitializers);
    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
  })(), _a;
})();
function registerHzscriptCommands(core) {
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0] !== "transition")
      return next();
    if (ctx.rawtext.includes(`"`))
      throw `Transition Command: cannot have quotes in transition command`;
    if (ctx.slicedArgs.length !== 4)
      throw `Transition Command: incorrect amount of args`;
    if (ctx.slicedArgs[1].isQuoted || ctx.slicedArgs[1].isSquared)
      throw `Transition Command: invalid transition name type`;
    let transitionName = ctx.slicedArgs[1].str;
    if (ctx.slicedArgs[2].isQuoted || ctx.slicedArgs[2].isSquared || ctx.slicedArgs[2].str !== "=") {
      throw `the third arg of transition command should be "="`;
    }
    let tuple_str = Script.Utils.joinSlicedArgs(ctx.slicedArgs.slice(3));
    let tuple = Script.Utils.parseTuple(tuple_str);
    if (tuple.length !== 2) {
      throw `thransition tuple must have 2 args`;
    }
    let inTransforms = tuple[0].startsWith("[") ? Script.Utils.parseArray(tuple[0]) : [tuple[0]];
    let outTransforms = tuple[1].startsWith("[") ? Script.Utils.parseArray(tuple[1]) : [tuple[1]];
    let transitionMap = getTransitionMap(core);
    transitionMap[transitionName] = {
      inTransforms,
      outTransforms
    };
  });
}
function getTransitionMap(core) {
  return core.storage.getSaveableData(core.storage.archiveData, true, "script", "transitionMap");
}
function registerPlugin(core) {
  let animationPlugin = new AnimationPlugin(core);
  let profileMap = {};
  registerHzscriptCommands(core);
  core.on("afterLoadProject", () => {
    profileMap = core.storage.getSaveableData(core.storage.preloadedData, false, "animation", "profileMap");
  });
  function getProfile(name) {
    let profile_item = profileMap[name];
    if (!profile_item) {
      core.debug.log(`Animation profile [${name}] not found`);
      return null;
    }
    let str = core.platform.readFileSync({
      path: profile_item[0],
      options: {
        encoding: "utf8"
      }
    });
    if (typeof str !== "string") {
      core.debug.log(`Animation profile file [${name}] not found`);
      return null;
    }
    try {
      return JSON.parse(str);
    } catch (error) {
      core.debug.log(`Animation profile file [${name}] parse error:`, error);
    }
    return null;
  }
  function applyTransform(names, target, isSave = false, destroyOnEnd = false) {
    let profile = null;
    if (names.length === 1) {
      profile = getProfile(names[0]);
    } else if (names.length > 1) {
      let syncs = [];
      for (let i = 0; i < names.length; i++) {
        let profile2 = getProfile(names[i]);
        if (profile2)
          syncs.push(profile2);
      }
      profile = { syncs };
    }
    if (!profile)
      profile = [];
    animationPlugin.applyAnimation({
      profile,
      targetView: target,
      options: {
        isSave,
        destroyOnEnd
      }
    });
  }
  class TransformRouteStrategy {
    constructor(outTransforms, inTransforms) {
      __publicField(this, "outTransforms");
      __publicField(this, "inTransforms");
      this.outTransforms = outTransforms;
      this.inTransforms = inTransforms;
    }
    create(viewName, layer, prop, ui, isSave) {
      let view = ui.createView(viewName, layer, prop, isSave);
      this.inTransforms && applyTransform(this.inTransforms, view, isSave);
      return view;
    }
    destroy(viewInstance, ui) {
      if (this.outTransforms) {
        applyTransform(this.outTransforms, viewInstance, viewInstance.isSave, true);
      } else {
        ui.destroyView(viewInstance);
      }
    }
  }
  return {
    applyTransform,
    getProfile,
    createStrategy(outTransforms, inTransforms) {
      return new TransformRouteStrategy(outTransforms, inTransforms);
    },
    animationPlugin,
    getTransition(name) {
      var _a;
      return (_a = getTransitionMap(core)[name]) != null ? _a : null;
    }
  };
}
let cache = /* @__PURE__ */ new Map();
function readline(_core, path, line_index) {
  if (cache.has(path)) {
    return cache.get(path)[line_index];
  }
  let hzsContent = _core.platform.readFileSync({
    path,
    options: { encoding: "utf8" }
  });
  let file = hzsContent.split(/\r?\n|(?<!\n)\r/);
  cache.set(path, file);
  return file[line_index];
}
var __esDecorate$2 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var __runInitializers$2 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
let Script = (() => {
  var __callStack_accessor_storage, __statementStack_accessor_storage, __nextRunPosition_accessor_storage, _a;
  let __callStack_decorators;
  let __callStack_initializers = [];
  let __callStack_extraInitializers = [];
  let __statementStack_decorators;
  let __statementStack_initializers = [];
  let __statementStack_extraInitializers = [];
  let __nextRunPosition_decorators;
  let __nextRunPosition_initializers = [];
  let __nextRunPosition_extraInitializers = [];
  return _a = class {
    constructor(_core) {
      __publicField(this, "_core");
      __privateAdd(this, __callStack_accessor_storage, __runInitializers$2(this, __callStack_initializers, []));
      __privateAdd(this, __statementStack_accessor_storage, (__runInitializers$2(this, __callStack_extraInitializers), __runInitializers$2(this, __statementStack_initializers, [])));
      __privateAdd(this, __nextRunPosition_accessor_storage, (__runInitializers$2(this, __statementStack_extraInitializers), __runInitializers$2(this, __nextRunPosition_initializers, null)));
      /**
       * 当前正在执行的命令内容
       */
      __publicField(this, "_currentRawCommand", (__runInitializers$2(this, __nextRunPosition_extraInitializers), "-"));
      // Middleware
      __publicField(this, "_middlewares", []);
      // Statement Analyse
      __publicField(this, "_statementAnalyseStack", []);
      __publicField(this, "_analyseStatementMiddlewares", []);
      this._core = _core;
    }
    /**
     * 调用栈
     * 在call时保存当前执行位置和语句栈，在return时恢复执行位置和语句栈
     */
    get _callStack() {
      return __privateGet(this, __callStack_accessor_storage);
    }
    set _callStack(value) {
      __privateSet(this, __callStack_accessor_storage, value);
    }
    /**
     * 语句栈
     * 比如while, if，会在语句开始时入栈，语句结束时出栈
     */
    get _statementStack() {
      return __privateGet(this, __statementStack_accessor_storage);
    }
    set _statementStack(value) {
      __privateSet(this, __statementStack_accessor_storage, value);
    }
    /**
     * 下一次执行的脚本位置
     * 注意：存储该值的时候应总是拷贝赋值而非直接引用赋值
     */
    get _nextRunPosition() {
      return __privateGet(this, __nextRunPosition_accessor_storage);
    }
    set _nextRunPosition(value) {
      __privateSet(this, __nextRunPosition_accessor_storage, value);
    }
    get nextRunPosition() {
      return this._nextRunPosition;
    }
    get currentRawCommand() {
      return this._currentRawCommand;
    }
    // Script Run
    /**
     * 执行_nextRunPosition，并返回下一行_nextRunPosition是否不为null
     */
    runSingleLine() {
      if (!this._nextRunPosition) {
        this.return();
        return false;
      }
      let nowRunPosition = [
        ...this._nextRunPosition
      ];
      this.incrementNextPosition();
      let rawCommand = readline(this._core, nowRunPosition[0], nowRunPosition[1]);
      rawCommand = removeComment(rawCommand);
      this._currentRawCommand = rawCommand.trim();
      if (rawCommand.trim().length && !rawCommand.trim().startsWith("#")) {
        if (rawCommand.trim().startsWith("*")) {
          if (this._statementStack.length) {
            throw `label between statement is not allowed, at file [${nowRunPosition[0]}] line [${nowRunPosition[1]}]`;
          }
        } else {
          this._core.debug.log("Run cmd: " + rawCommand);
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
      let labelPosition = this._locateLabel(targetLabel);
      this._callStack.push({
        position: this._nextRunPosition ? [...this._nextRunPosition] : null,
        statementStack: this._statementStack
      });
      this._nextRunPosition = labelPosition;
      this._statementStack = [];
    }
    hasLabel(targetLabel) {
      var _a2, _b, _c;
      return ((_c = (_b = (_a2 = this._core.storage.preloadedData) == null ? void 0 : _a2.script) == null ? void 0 : _b.labelMap) == null ? void 0 : _c[targetLabel]) != null;
    }
    return() {
      let stackItem = this._callStack.pop();
      if (stackItem) {
        this._statementStack = stackItem.statementStack;
        this._nextRunPosition = stackItem.position;
      } else {
        this._nextRunPosition = null;
        this._statementStack = [];
        this._core.end();
      }
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
        ...this._core.storage.preloadedData.script.labelMap[labelName]
      ];
      return labelData;
    }
    incrementNextPosition() {
      if (this._core.storage.preloadedData == null)
        throw "Preloaded Data is Null";
      if (!this._nextRunPosition)
        throw "_nextRunPosition is null";
      let hzsInfo = this._core.storage.preloadedData.script.hzsInfoMap[this._nextRunPosition[0]];
      if (!hzsInfo)
        throw `Preloaded hzsInfo of path(${this._nextRunPosition[0]}) not found`;
      this._nextRunPosition[1]++;
      if (this._nextRunPosition[1] >= hzsInfo.totalLines)
        this._nextRunPosition = null;
    }
    use(middleware, add_front = false) {
      if (add_front) {
        this._middlewares.unshift(middleware);
      } else {
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
        return;
      else if (cmd.trim().startsWith("*"))
        return;
      else {
        throw `Can not parse command: ${cmd}`;
      }
    }
    _buildContext(cmd, nowRunPosition) {
      return new _a.Context(this._core, cmd, nowRunPosition[0], nowRunPosition[1], this._statementStack);
    }
    _buildAnalyseStatementContext(cmd, nowRunPosition) {
      return new _a.ContextForAnalyseStatement(this._core, cmd, nowRunPosition[0], nowRunPosition[1], this._statementAnalyseStack);
    }
    useAnalyseStatement(middleware, add_front) {
      if (add_front) {
        this._analyseStatementMiddlewares.unshift(middleware);
      } else {
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
      let _nextRunPositionBackup = this._nextRunPosition ? [...this._nextRunPosition] : null;
      let covered = false;
      this._nextRunPosition = [ctx.currentPath, ctx.currentLineIndex];
      while (this._nextRunPosition) {
        let rawCommand = readline(this._core, this._nextRunPosition[0], this._nextRunPosition[1]);
        if (rawCommand == null)
          throw `Readline Error(got ${rawCommand}), at file [${this._nextRunPosition[0]}] line [${this._nextRunPosition[1] + 1}]`;
        if (rawCommand.trim().length && !rawCommand.trim().startsWith("#")) {
          if (rawCommand.trim().startsWith("*")) {
            if (this._statementStack.length) {
              throw `label between statement is not allowed, at file [${this._nextRunPosition[0]}] line [${this._nextRunPosition[1] + 1}]`;
            }
          } else {
            let sub_ctx = this._buildAnalyseStatementContext(rawCommand, [
              ...this._nextRunPosition
            ]);
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
        this.incrementNextPosition();
        if (covered) {
          if (this._statementAnalyseStack.length === 0) {
            break;
          }
        } else {
          if (this._statementAnalyseStack.length > 0) {
            covered = true;
          }
        }
      }
      this._nextRunPosition = _nextRunPositionBackup;
      if (this._statementAnalyseStack.length > 0) {
        throw `statement not closed, at file [${this._statementAnalyseStack[this._statementAnalyseStack.length - 1][1][0]}] line [${this._statementAnalyseStack[this._statementAnalyseStack.length - 1][1][1] + 1}]`;
      }
    }
    // eval
    evalScope(code) {
      try {
        return new Function("sd", "gd", "hz", `${code}`)(this._core.storage.sd, this._core.storage.gd, this._core);
      } catch (e) {
        this._core.debug.log(`Error in evalScope: ${e}`);
      }
    }
    evalExpression(code) {
      this._core.debug.log(`evalExpression: ${code}`);
      try {
        return new Function("sd", "gd", "hz", `return (${code})`)(this._core.storage.sd, this._core.storage.gd, this._core);
      } catch (e) {
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
        } else {
          res += item.str;
        }
      }
      return res;
    }
  }, __callStack_accessor_storage = new WeakMap(), __statementStack_accessor_storage = new WeakMap(), __nextRunPosition_accessor_storage = new WeakMap(), (() => {
    const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
    __callStack_decorators = [Save("script.callStack")];
    __statementStack_decorators = [Save("script.statementStack")];
    __nextRunPosition_decorators = [Save("script.nextRunPosition")];
    __esDecorate$2(_a, null, __callStack_decorators, { kind: "accessor", name: "_callStack", static: false, private: false, access: { has: (obj) => "_callStack" in obj, get: (obj) => obj._callStack, set: (obj, value) => {
      obj._callStack = value;
    } }, metadata: _metadata }, __callStack_initializers, __callStack_extraInitializers);
    __esDecorate$2(_a, null, __statementStack_decorators, { kind: "accessor", name: "_statementStack", static: false, private: false, access: { has: (obj) => "_statementStack" in obj, get: (obj) => obj._statementStack, set: (obj, value) => {
      obj._statementStack = value;
    } }, metadata: _metadata }, __statementStack_initializers, __statementStack_extraInitializers);
    __esDecorate$2(_a, null, __nextRunPosition_decorators, { kind: "accessor", name: "_nextRunPosition", static: false, private: false, access: { has: (obj) => "_nextRunPosition" in obj, get: (obj) => obj._nextRunPosition, set: (obj, value) => {
      obj._nextRunPosition = value;
    } }, metadata: _metadata }, __nextRunPosition_initializers, __nextRunPosition_extraInitializers);
    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
  })(), _a;
})();
(function(Script2) {
  class Context {
    constructor(_core, _rawtext, currentPath, currentLineIndex, _statementStack) {
      __publicField(this, "_core");
      __publicField(this, "_rawtext");
      __publicField(this, "currentPath");
      __publicField(this, "currentLineIndex");
      __publicField(this, "_statementStack");
      __publicField(this, "_rawtextChanged", false);
      __publicField(this, "_slicedArgs", null);
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
    get slicedArgs() {
      if (!this._slicedArgs || this._rawtextChanged)
        this._slicedArgs = splitStr2Objs(this.rawtext);
      this._rawtextChanged = false;
      return this._slicedArgs;
    }
    // 注意只有在修改在触发slicedArgs的时候才会更新rawtext
    set slicedArgs(slicedArgs) {
      this._slicedArgs = JSON.parse(JSON.stringify(slicedArgs));
      this._rawtext = mergeObjs2Str(slicedArgs);
    }
    /**
     * 開始一個新的Statement，返回該Statement的數據
     * Start a new statement and return the data of the new statement
     * @param identifier the identifier of the statement
     * @returns the data of the new statement
     */
    startStatement(identifier, data) {
      let statement_data = data != null ? data : this.getStatementData();
      let statementStackItem = [
        identifier,
        [this.currentPath, this.currentLineIndex],
        statement_data
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
  Script2.Context = Context;
  (function(Utils) {
    Utils.joinSlicedArgs = mergeObjs2Str;
    Utils.splitRawtext = splitStr2Objs;
    function splitCommas(rawtext) {
      let slicedArgs = splitStr2Objs(rawtext);
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
      return res;
    }
    Utils.splitCommas = splitCommas;
    function parseTuple(rawtext) {
      if (rawtext.length < 2 || rawtext[0] !== "(" || rawtext[rawtext.length - 1] !== ")") {
        throw `invalid tuple: ${rawtext}`;
      }
      rawtext = rawtext.slice(1, rawtext.length - 1);
      return parseHzsArgs(rawtext);
    }
    Utils.parseTuple = parseTuple;
    function parseArray(rawtext) {
      if (rawtext.length < 2 || rawtext[0] !== "[" || rawtext[rawtext.length - 1] !== "]") {
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
      return res;
    }
    Utils.parseHzsArgs = parseHzsArgs;
  })(Script2.Utils || (Script2.Utils = {}));
  class ContextForAnalyseStatement extends Context {
    startStatement(identifier, data = {}) {
      return super.startStatement(identifier, data != null ? data : {});
    }
    endStatement(identifier) {
      let statement_data = super.endStatement(identifier);
      let statement_data_in_file = this._core.storage.getSaveableData(this._core.storage.globalData, true, "script", "statement_data", this.currentPath);
      statement_data_in_file["" + this.currentLineIndex] = statement_data;
      this._core.storage.saveGlobalData();
      return statement_data;
    }
  }
  Script2.ContextForAnalyseStatement = ContextForAnalyseStatement;
})(Script || (Script = {}));
class Storage {
  constructor(_core) {
    __publicField(this, "_core");
    __publicField(this, "projectRoot", null);
    __publicField(this, "cacheRoot", null);
    __publicField(this, "saveRoot", null);
    __publicField(this, "preloadedData", null);
    __publicField(this, "packageData", null);
    // Storage Data
    /**
     * 全局数据
     * 其中的数据不会跟随存档保存，而是直接存储在全局数据文件中
     * 如：设置、CG解锁情况等
     */
    __publicField(this, "_globalData", null);
    /**
     * 存档数据
     * 其中的数据会跟随存档保存
     * 如：脚本执行位置即调用栈，攻略度等
     */
    __publicField(this, "_archiveData", null);
    /**
     * 保存全局数据
     * 可以多次調用，實際上會異步儲存，也就是在一個宏任務中即使調用多次，也只會在宏任務結束後儲存一次
     */
    __publicField(this, "_saveGlobalDataTimerId", null);
    __publicField(this, "_saveArchiveDataTimerId", null);
    this._core = _core;
  }
  loadProject(options) {
    this._core.emit("beforeLoadProject");
    if (!this._core.platform.readdirSync({ path: options.projectPath })) {
      throw "Dir not exist";
    }
    this.projectRoot = options.projectPath;
    this.cacheRoot = options.cachePath;
    this.saveRoot = options.savePath;
    this.loadPackageData();
    this.preload();
    this._core.emit("afterLoadProject");
  }
  loadPackageData() {
    if (!this.projectRoot)
      throw "projectDir is null";
    this._core.debug.log(`loadPackageData ${this.projectRoot} ${posix$1.join(this.projectRoot, "hz_package.json")}`);
    if (!this._core.platform.statSync({
      path: posix$1.join(this.projectRoot, "hz_package.json")
    })) {
      throw "HZEngine Package File (hz_package.json) not exist";
    }
    this.packageData = JSON.parse(this._core.platform.readFileSync({
      path: posix$1.join(this.projectRoot, "hz_package.json"),
      options: { encoding: "utf8" }
    }));
  }
  get globalData() {
    if (!this._globalData) {
      this.loadGlobalData();
    }
    if (this._globalData == null)
      throw `[HZEngine] GlobalData is null`;
    return this._globalData;
  }
  /**
   * alias globalData
   */
  get gd() {
    return this.globalData;
  }
  get archiveData() {
    if (!this._archiveData) {
      this.loadArchiveData();
    }
    if (this._archiveData == null)
      throw `[HZEngine] ArchiveData is null`;
    return this._archiveData;
  }
  /**
   * alias archiveData
   */
  get sd() {
    return this.archiveData;
  }
  loadGlobalData() {
    if (!this.saveRoot) {
      throw "saveDir is null, please loadProject first";
    }
    this._core.emit("beforeLoadGlobalData");
    if (this._core.platform.statSync({
      path: posix$1.join(this.saveRoot, "globalData.json")
    })) {
      this._globalData = JSON.parse(this._core.platform.readFileSync({
        path: posix$1.join(this.saveRoot, "globalData.json"),
        options: {
          encoding: "utf8"
        }
      }));
      if (this._globalData == null) {
        this._globalData = {};
        this._core.emit("initGlobalData");
      }
    } else {
      this._core.debug.log(`globalData.json not exist, create it.`);
      this._globalData = {};
      this._core.emit("initGlobalData");
      this._core.platform.writeFileSync({
        path: posix$1.join(this.saveRoot, "globalData.json"),
        data: JSON.stringify(this._globalData)
      });
    }
    this._core.emit("afterLoadGlobalData");
  }
  saveGlobalData() {
    if (!this.projectRoot) {
      throw "projectDir is null, please loadProject first";
    }
    if (this._saveGlobalDataTimerId)
      return;
    this._saveGlobalDataTimerId = setTimeout(() => {
      this._saveGlobalDataTimerId = null;
      if (!this.projectRoot) {
        throw "projectDir is null, please loadProject first";
      }
      this._core.emit("beforeSaveGlobalData");
      let res = this._core.platform.writeFileSync({
        path: posix$1.join(this.saveRoot, "globalData.json"),
        data: JSON.stringify(this._globalData)
      });
      if (res < 0)
        throw `[HZEngine] save globalData to globalData.json failed, code = ${res}`;
      this._core.debug.log(`save globalData to globalData.json`);
      this._core.emit("afterSaveGlobalData");
    }, 0);
  }
  loadArchiveData(archiveFile) {
    this._core.emit("beforeLoadArchive");
    if (archiveFile) {
      if (!this.saveRoot)
        throw `saveRoot is null, please loadProject first`;
      if (!this._core.platform.statSync({
        path: posix$1.join(this.saveRoot, archiveFile)
      })) {
        throw `Archive [${archiveFile}] not exist`;
      }
      let archiveData = JSON.parse(this._core.platform.readFileSync({
        path: posix$1.join(this.saveRoot, archiveFile),
        options: {
          encoding: "utf8"
        }
      }));
      if (archiveData == null)
        throw `[HZEngine] ArchiveData is null`;
      this._archiveData = archiveData;
      this._core.debug.log(`load archiveData from ${archiveFile}`);
      this._core.emit("afterLoadArchive");
    } else {
      this._core.debug.log(`load archiveData from empty template`);
      this._archiveData = {};
      this._core.emit("initArchiveData");
    }
  }
  /**
   * 保存存档数据
   * 可以多次調用，實際上會異步儲存，也就是在一個宏任務中即使調用多次，也只會在宏任務結束後儲存一次
   * @param archiveFile 存档文件目錄及名字
   */
  saveArchiveData(archiveFile, immediate = false) {
    if (!this.saveRoot)
      throw `saveRoot is null, please loadProject first`;
    this._core.emit("beforeSaveArchive");
    this._core.debug.log("Will save archiveData to " + archiveFile);
    let saveFunc = () => {
      this._core.debug.log("Saving archiveData to " + archiveFile);
      if (!this.saveRoot)
        throw `projectDir is null, please loadProject first`;
      let res = this._core.platform.writeFileSync({
        path: posix$1.join(this.saveRoot, archiveFile),
        data: JSON.stringify(this._archiveData)
      });
      if (res < 0)
        throw `[HZEngine] save archiveData to ${archiveFile} failed, code = ${res}`;
      this._core.debug.log(`Save archiveData to ${archiveFile}`);
      this._core.emit("afterSaveArchive");
    };
    if (immediate) {
      saveFunc();
      if (this._saveArchiveDataTimerId) {
        clearTimeout(this._saveArchiveDataTimerId);
        this._saveArchiveDataTimerId = null;
      }
    } else
      this._saveArchiveDataTimerId = setTimeout(() => {
        this._saveArchiveDataTimerId = null;
        saveFunc();
      }, 0);
  }
  getSaveableData(data, auto_correct, ...key_chain) {
    let obj = data;
    for (let key of key_chain) {
      if (obj == null)
        throw Error(`[HZEngine] saveable data is null`);
      if (typeof obj !== "object")
        throw Error(`[HZEngine] saveable data is not object`);
      if (Array.isArray(obj))
        throw Error(`[HZEngine] saveable data is array`);
      if (!obj[key]) {
        if (auto_correct) {
          obj[key] = {};
        } else
          throw Error(`[HZEngine] saveable data key ${key} not exist`);
      }
      obj = obj[key];
    }
    if (obj == null)
      throw Error(`[HZEngine] saveable data result obj is null`);
    return obj;
  }
  setSaveableData(data, auto_correct, value, ...key_chain) {
    this._core.debug.log(`setSaveableData ${key_chain} => ${JSON.stringify(value)}`);
    if (key_chain.length == 0)
      throw `key_chain is empty`;
    let parentObj = this.getSaveableData(data, auto_correct, ...key_chain.slice(0, -1));
    if (parentObj == null)
      throw `[HZEngine] saveable data is null`;
    if (typeof parentObj !== "object")
      throw `[HZEngine] saveable data is not object`;
    if (Array.isArray(parentObj))
      throw `[HZEngine] saveable data is array`;
    parentObj[key_chain[key_chain.length - 1]] = value;
  }
  checkSaveableData(data, ...key_chain) {
    return this.getSaveableData(data, false, ...key_chain);
  }
  // Preload
  preload() {
    if (!this.cacheRoot) {
      throw "cacheRoot is null, please loadProject first";
    }
    if (this._core.platform.statSync({
      path: posix$1.join(this.cacheRoot, "preloaded.json")
    })) {
      this.preloadedData = JSON.parse(this._core.platform.readFileSync({
        path: posix$1.join(this.cacheRoot, "preloaded.json"),
        options: {
          encoding: "utf8"
        }
      }));
      return;
    }
    this.preloadedData = {
      script: {
        labelMap: {},
        hzsInfoMap: {}
      },
      image: {
        nameMap: {}
      },
      animation: {
        profileMap: {}
      }
    };
    this.preloadScript();
    this.preloadImage();
    this.preloadAnimation();
    this._core.platform.writeFileSync({
      path: posix$1.join(this.cacheRoot, "preloaded.json"),
      data: JSON.stringify(this.preloadedData)
    });
  }
  /**
   * 预加载脚本
   * 遍历出所有hzs文件和所有label，建立map
   */
  preloadScript() {
    let labelMap = this.preloadedData.script.labelMap;
    let scriptDir = posix$1.join(this.projectRoot, "script");
    let hzsInfoMap = this.preloadedData.script.hzsInfoMap;
    if (!this._core.platform.readdirSync({ path: scriptDir }))
      throw "项目文件夹中script文件夹不存在";
    const preloadHzs = (path) => {
      let contentStr = this._core.platform.readFileSync({
        path,
        options: { encoding: "utf8" }
      });
      let contentLines = contentStr.split("\n");
      let totalLines = contentLines.length;
      hzsInfoMap[path] = { totalLines };
      for (let i = 0; i < totalLines; ++i) {
        let line = contentLines[i].trim();
        if (line.startsWith("*")) {
          let len = line.length, p = 1, q;
          while (p < len && line.charAt(p) === " ")
            ++p;
          if (p === len)
            throw `Lost Label Name at file(${path}) line(${i + 1})`;
          q = p;
          while (q < len && line.charAt(q) !== " ")
            ++q;
          let label = line.slice(p, q);
          if (labelMap[label]) {
            throw `Label name "${label}" conflict :     at [${labelMap[label][0]}(line ${labelMap[label][1]})]     [${path}(line ${i + 1})]`;
          }
          labelMap[label] = [path, i];
        }
      }
    };
    const traverseScript = (path) => {
      let dirs = this._core.platform.readdirSync({ path });
      for (let dir of dirs) {
        let subpath = posix$1.join(path, dir);
        if (this._core.platform.isFileSync({ path: subpath })) {
          if (dir.endsWith(".hzs")) {
            preloadHzs(subpath);
          }
        } else {
          traverseScript(subpath);
        }
      }
    };
    traverseScript(scriptDir);
  }
  /**
   * 预加载资源
   * 遍历所有png文件，计算对应的name key，建立map
   */
  preloadImage() {
    let nameMap = this.preloadedData.image.nameMap;
    let imageDir = posix$1.join(this.projectRoot, "image");
    if (!this._core.platform.readdirSync({ path: imageDir }))
      throw "项目文件夹中image文件夹不存在";
    function preloadImage(path) {
      let raw_name = posix$1.parse(path).name;
      let name_key = raw_name.trim().replace("_", " ").replace(/ +/, " ").toLowerCase();
      if (nameMap[name_key])
        throw `Image name key conflict [${name_key}], at file [${path}] and [${nameMap[name_key]}]`;
      nameMap[name_key] = [path];
    }
    const traverseImage = (path) => {
      let dirs = this._core.platform.readdirSync({ path });
      for (let dir of dirs) {
        let subpath = posix$1.join(path, dir);
        if (this._core.platform.isFileSync({ path: subpath })) {
          if (dir.endsWith(".png")) {
            preloadImage(subpath);
          }
        } else {
          traverseImage(subpath);
        }
      }
    };
    traverseImage(imageDir);
  }
  /**
   * 預加載動畫profile
   * 遍歷animation文件夾下的所有json文件，以文件名為key，json内容為value
   */
  preloadAnimation() {
    let profileMap = this.preloadedData.animation.profileMap;
    let animationDir = posix$1.join(this.projectRoot, "animation");
    if (!this._core.platform.readdirSync({ path: animationDir })) {
      console.log("Warning: 项目文件夹中animation文件夹不存在");
      return;
    }
    function preloadAnimation(path) {
      let raw_name = posix$1.parse(path).name;
      let name_key = raw_name.trim().replace(/ +/, "_");
      if (profileMap[name_key])
        throw `Animation profile name key conflict [${name_key}], at file [${path}] and [${profileMap[name_key]}]`;
      profileMap[name_key] = [path];
    }
    const traverseAnimation = (path) => {
      let dirs = this._core.platform.readdirSync({ path });
      for (let dir of dirs) {
        let subpath = posix$1.join(path, dir);
        if (this._core.platform.isFileSync({ path: subpath })) {
          if (dir.endsWith(".json")) {
            preloadAnimation(subpath);
          }
        } else {
          traverseAnimation(subpath);
        }
      }
    };
    traverseAnimation(animationDir);
  }
}
var __esDecorate$1 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var __runInitializers$1 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
let System = (() => {
  var _condition_accessor_storage, _a;
  let _condition_decorators;
  let _condition_initializers = [];
  let _condition_extraInitializers = [];
  return _a = class {
    constructor(_core) {
      __publicField(this, "_core");
      __privateAdd(this, _condition_accessor_storage, __runInitializers$1(this, _condition_initializers, _a.Condition.Free));
      __publicField(this, "_pauseTimer", (__runInitializers$1(this, _condition_extraInitializers), null));
      this._core = _core;
      _core.on("system.continue", () => {
        this._pauseTimer = null;
        this.continue();
      });
    }
    get condition() {
      return __privateGet(this, _condition_accessor_storage);
    }
    set condition(value) {
      __privateSet(this, _condition_accessor_storage, value);
    }
    /**
     * 暂停(可指定一段时间)
     * 后调用的会覆盖之前pause的设定时间
     * @param delayMs
     */
    pause(delayMs) {
      this._core.debug.log(`Pause`);
      if (this.condition === _a.Condition.Gaming) {
        this.condition = _a.Condition.Pause;
      } else
        throw `pause but condition error (todo)`;
      if (this._pauseTimer) {
        this._core.async.removeTask(this._pauseTimer);
        this._pauseTimer = null;
      }
      if (delayMs !== void 0) {
        this._pauseTimer = this._core.async.addDelayTask("system.continue", [], delayMs);
      }
    }
    /**
     * 继续由于pause中断的游戏
     */
    continue() {
      if (this.condition !== _a.Condition.Pause)
        return;
      this.condition = _a.Condition.Gaming;
      this.run();
    }
    /**
     * 阻塞
     */
    block() {
      if (this.condition !== _a.Condition.Gaming)
        throw `block but condition error (todo)`;
      this.condition = _a.Condition.Blocked;
    }
    /**
     * 取消阻塞
     */
    unBlock() {
      if (this.condition !== _a.Condition.Blocked)
        return;
      this.condition = _a.Condition.Gaming;
      this.run();
    }
    run() {
      this.condition = _a.Condition.Gaming;
      while (this.condition === _a.Condition.Gaming) {
        this._core.script.runSingleLine();
      }
    }
    start(initLabel = "start") {
      this._core.storage.archiveData;
      this._core.debug.log("Game Start");
      this._core.script.clear();
      this._core.script.jumpLabel(initLabel);
      this.run();
    }
  }, _condition_accessor_storage = new WeakMap(), (() => {
    const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
    _condition_decorators = [Save("system.condition")];
    __esDecorate$1(_a, null, _condition_decorators, { kind: "accessor", name: "condition", static: false, private: false, access: { has: (obj) => "condition" in obj, get: (obj) => obj.condition, set: (obj, value) => {
      obj.condition = value;
    } }, metadata: _metadata }, _condition_initializers, _condition_extraInitializers);
    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
  })(), _a;
})();
(function(System2) {
  (function(Condition) {
    Condition[Condition["Free"] = 0] = "Free";
    Condition[Condition["Pause"] = 1] = "Pause";
    Condition[Condition["Blocked"] = 2] = "Blocked";
    Condition[Condition["Gaming"] = 3] = "Gaming";
  })(System2.Condition || (System2.Condition = {}));
})(System || (System = {}));
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var __runInitializers = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
let UI = (() => {
  var __layerList_accessor_storage, __nextViewId_accessor_storage, __viewMap_accessor_storage, __routerMap_accessor_storage, _a;
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
  return _a = class {
    constructor(_core) {
      __publicField(this, "_core");
      __privateAdd(this, __layerList_accessor_storage, __runInitializers(this, __layerList_initializers, /* @__PURE__ */ new Map()));
      // View Class
      __publicField(this, "_viewClassMap", (__runInitializers(this, __layerList_extraInitializers), /* @__PURE__ */ new Map()));
      __privateAdd(this, __nextViewId_accessor_storage, __runInitializers(this, __nextViewId_initializers, 50));
      __privateAdd(this, __viewMap_accessor_storage, (__runInitializers(this, __nextViewId_extraInitializers), __runInitializers(this, __viewMap_initializers, /* @__PURE__ */ new Map())));
      __privateAdd(this, __routerMap_accessor_storage, (__runInitializers(this, __viewMap_extraInitializers), __runInitializers(this, __routerMap_initializers, /* @__PURE__ */ new Map())));
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
    // Layer
    get _layerList() {
      return __privateGet(this, __layerList_accessor_storage);
    }
    set _layerList(value) {
      __privateSet(this, __layerList_accessor_storage, value);
    }
    get layerList() {
      return this._layerList;
    }
    addLayer(name, z_index) {
      this._core.emit("beforeAddLayer", name, z_index);
      if (this._layerList.has(name))
        throw `Layer ${name} already exist`;
      let newLayer = new _a.Layer(this._core, name, z_index);
      this._layerList.set(name, newLayer);
      this._core.emit("afterAddLayer", newLayer);
    }
    getLayer(name) {
      return this.layerList.get(name);
    }
    // _activeViewList: [name: string, layer: string, instance: UI.View<unknown>][] =
    //   [];
    registerView(name, cls) {
      this._viewClassMap.set(name, cls);
    }
    // View
    get _nextViewId() {
      return __privateGet(this, __nextViewId_accessor_storage);
    }
    set _nextViewId(value) {
      __privateSet(this, __nextViewId_accessor_storage, value);
    }
    get _viewMap() {
      return __privateGet(this, __viewMap_accessor_storage);
    }
    set _viewMap(value) {
      __privateSet(this, __viewMap_accessor_storage, value);
    }
    getView(id2) {
      var _a2;
      return (_a2 = this._viewMap.get(id2)) != null ? _a2 : null;
    }
    createView(name, layer, prop, isSave) {
      let id2 = this._nextViewId++;
      let viewInstance = this._produceViewWithId(name, layer, prop, id2);
      this._core.debug.log(`creating view ${viewInstance.name}`);
      viewInstance.isSave = isSave;
      this._viewMap.set(id2, viewInstance);
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
    _produceViewWithId(name, layer, prop, id2) {
      if (!this._viewClassMap.get(name)) {
        throw "要创建的View不存在";
      }
      let _ViewFactory = this._viewClassMap.get(name);
      let viewInstance = new _ViewFactory(layer, this._core);
      viewInstance.id = id2;
      viewInstance.name = name;
      viewInstance.create(prop);
      this._core.debug.log(`producing view ${viewInstance.name}`);
      return viewInstance;
    }
    get _routerMap() {
      return __privateGet(this, __routerMap_accessor_storage);
    }
    set _routerMap(value) {
      __privateSet(this, __routerMap_accessor_storage, value);
    }
    getRouter(tag) {
      return this._routerMap.get(tag);
    }
    addRouter(tag, layer, isSave = true) {
      if (this._routerMap.has(tag))
        throw `Route with tag [${tag}] already exist!`;
      let router = new _a.Router(this, tag, layer, isSave);
      this._routerMap.set(tag, router);
      return router;
    }
    getScreenSize() {
      let [width2, height2] = this._core.platform.getScreenSize();
      return { width: width2, height: height2 };
    }
    /**
     * 根据 BasicUniversalProp 计算屏幕上的位置
     * @param prop 包含 BasicUniversalProp 的 prop
     * @param size (可选)图像的尺寸，若不指定，返回的anchor坐标和origin坐标一样
     * @returns
     */
    calcPosition(prop, size) {
      var _a2, _b, _c, _d, _e, _f, _g, _h;
      let { width: width2, height: height2 } = this.getScreenSize();
      let anchor_coord = {
        x: width2 * (((_a2 = prop.xalign) != null ? _a2 : 0) + 1) / 2 + // 根据 align 求出 anchor 位置
        ((_b = prop.xoffset) != null ? _b : 0),
        // offset
        y: height2 * (((_c = prop.yalign) != null ? _c : 0) + 1) / 2 + // 根据 align 求出 anchor 位置
        ((_d = prop.yoffset) != null ? _d : 0)
        // offset
      };
      let origin_coord = {
        x: anchor_coord.x - (((_e = prop.xanchor) != null ? _e : 0) + 1) / 2 * ((_f = size == null ? void 0 : size.width) != null ? _f : 0),
        y: anchor_coord.y - (((_g = prop.yanchor) != null ? _g : 0) + 1) / 2 * ((_h = size == null ? void 0 : size.height) != null ? _h : 0)
      };
      return {
        anchor: anchor_coord,
        origin: origin_coord
      };
    }
  }, __layerList_accessor_storage = new WeakMap(), __nextViewId_accessor_storage = new WeakMap(), __viewMap_accessor_storage = new WeakMap(), __routerMap_accessor_storage = new WeakMap(), (() => {
    const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
    __layerList_decorators = [CustomSave("ui.layerList", function serializer(layerList) {
      let obj = {};
      for (let [key, value] of this.layerList) {
        obj[key] = [value.name, value.z_index];
      }
      return obj;
    }, function deserializer(obj) {
      for (let [key, value] of this.layerList) {
        value.destroy();
      }
      this.layerList.clear();
      let newLayerList = /* @__PURE__ */ new Map();
      for (let key in obj) {
        let newLayer = new _a.Layer(this._core, obj[key][0], obj[key][1]);
        newLayerList.set(key, newLayer);
        this._core.emit("afterAddLayer", newLayer);
      }
      return newLayerList;
    })];
    __nextViewId_decorators = [Save("ui.nextViewId")];
    __viewMap_decorators = [CustomSave("ui.viewMap", function serializer(viewMap) {
      let obj = {};
      for (let [id2, view] of viewMap) {
        if (view.isSave)
          obj[id2] = view.serialize();
      }
      return obj;
    }, function deserializer(obj) {
      let newViewMap = /* @__PURE__ */ new Map();
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
      let newRouterMap = /* @__PURE__ */ new Map();
      for (let [name, router] of this._routerMap) {
        if (!router.isSave) {
          if (router.length > 0) {
            router.activeViewInstance = this._core.ui.createView(router.viewStack[0][0], router.layer, router.viewStack[0][1], router.isSave);
          }
          newRouterMap.set(name, router);
        }
      }
      for (let key in obj) {
        newRouterMap.set(key, _a.Router.deserialize(this, obj[key]));
      }
      return newRouterMap;
    })];
    __esDecorate(_a, null, __layerList_decorators, { kind: "accessor", name: "_layerList", static: false, private: false, access: { has: (obj) => "_layerList" in obj, get: (obj) => obj._layerList, set: (obj, value) => {
      obj._layerList = value;
    } }, metadata: _metadata }, __layerList_initializers, __layerList_extraInitializers);
    __esDecorate(_a, null, __nextViewId_decorators, { kind: "accessor", name: "_nextViewId", static: false, private: false, access: { has: (obj) => "_nextViewId" in obj, get: (obj) => obj._nextViewId, set: (obj, value) => {
      obj._nextViewId = value;
    } }, metadata: _metadata }, __nextViewId_initializers, __nextViewId_extraInitializers);
    __esDecorate(_a, null, __viewMap_decorators, { kind: "accessor", name: "_viewMap", static: false, private: false, access: { has: (obj) => "_viewMap" in obj, get: (obj) => obj._viewMap, set: (obj, value) => {
      obj._viewMap = value;
    } }, metadata: _metadata }, __viewMap_initializers, __viewMap_extraInitializers);
    __esDecorate(_a, null, __routerMap_decorators, { kind: "accessor", name: "_routerMap", static: false, private: false, access: { has: (obj) => "_routerMap" in obj, get: (obj) => obj._routerMap, set: (obj, value) => {
      obj._routerMap = value;
    } }, metadata: _metadata }, __routerMap_initializers, __routerMap_extraInitializers);
    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
  })(), _a;
})();
(function(UI2) {
  class View {
    constructor(layer, core) {
      __publicField(this, "layer");
      __publicField(this, "core");
      __publicField(this, "id", null);
      __publicField(this, "name", null);
      __publicField(this, "isSave", true);
      __publicField(this, "_prop", null);
      this.layer = layer;
      this.core = core;
    }
    get prop() {
      return this._prop;
    }
    set prop(prop) {
      this._prop = prop;
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
        prop: this.prop
      };
    }
  }
  UI2.View = View;
  class MessageView extends View {
  }
  UI2.MessageView = MessageView;
  class MenuView2 extends View {
  }
  UI2.MenuView = MenuView2;
  class FgImgView2 extends View {
  }
  UI2.FgImgView = FgImgView2;
  class BgImgView2 extends View {
  }
  UI2.BgImgView = BgImgView2;
  class Layer {
    constructor(_core, name, z_index) {
      __publicField(this, "_core");
      __publicField(this, "name");
      __publicField(this, "z_index");
      __publicField(this, "widgetFactory");
      this._core = _core;
      this.name = name;
      this.z_index = z_index;
      this.widgetFactory = _core.platform.createUILayer({
        z_index
      });
    }
    destroy() {
      this._core.platform.deleteUILayer(this.widgetFactory);
    }
  }
  UI2.Layer = Layer;
  class Router {
    constructor(_ui, tag, layer, isSave = true) {
      __publicField(this, "_ui");
      __publicField(this, "tag");
      __publicField(this, "layer");
      __publicField(this, "isSave");
      __publicField(this, "defaultRouteStrategy", {
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
        }
      });
      __publicField(this, "viewStack", []);
      __publicField(this, "activeViewInstance", null);
      this._ui = _ui;
      this.tag = tag;
      this.layer = layer;
      this.isSave = isSave;
    }
    serialize() {
      var _a, _b;
      return {
        tag: this.tag,
        layer: this.layer,
        isSave: this.isSave,
        viewStack: this.viewStack,
        activeViewId: (_b = (_a = this.activeViewInstance) == null ? void 0 : _a.id) != null ? _b : null
      };
    }
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
    get length() {
      return this.viewStack.length;
    }
    push(view_name, prop, strategy) {
      if (this.activeViewInstance) {
        if (strategy == null ? void 0 : strategy.destroy) {
          strategy.destroy(this.activeViewInstance, this._ui);
        } else {
          this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
        }
        this.activeViewInstance = null;
      }
      let layerInstance = this._ui.getLayer(this.layer);
      if (!layerInstance)
        throw `Layer [${this.layer}] not found`;
      if (strategy == null ? void 0 : strategy.create) {
        this.activeViewInstance = strategy.create(view_name, this.layer, prop, this._ui, this.isSave);
      } else {
        this.activeViewInstance = this.defaultRouteStrategy.create(view_name, this.layer, prop, this._ui, this.isSave);
      }
      this.viewStack.push([view_name, prop]);
    }
    pop(back_prop, strategy) {
      if (this.activeViewInstance) {
        if (strategy == null ? void 0 : strategy.destroy) {
          strategy.destroy(this.activeViewInstance, this._ui);
        } else {
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
        if (strategy == null ? void 0 : strategy.create) {
          this.activeViewInstance = strategy.create(backViewInfo[0], this.layer, back_prop != null ? back_prop : backViewInfo[1], this._ui, this.isSave);
        } else {
          this.activeViewInstance = this.defaultRouteStrategy.create(backViewInfo[0], this.layer, back_prop != null ? back_prop : backViewInfo[1], this._ui, this.isSave);
        }
      }
    }
    replace(view_name, prop, strategy) {
      if (this.activeViewInstance) {
        if (strategy == null ? void 0 : strategy.destroy) {
          strategy.destroy(this.activeViewInstance, this._ui);
        } else {
          this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
        }
        this.activeViewInstance = null;
      }
      this.viewStack.pop();
      let layerInstance = this._ui.getLayer(this.layer);
      if (!layerInstance)
        throw `Layer [${this.layer}] not found`;
      if (strategy == null ? void 0 : strategy.create) {
        this.activeViewInstance = strategy.create(view_name, this.layer, prop, this._ui, this.isSave);
      } else {
        this.activeViewInstance = this.defaultRouteStrategy.create(view_name, this.layer, prop, this._ui, this.isSave);
      }
      this.viewStack.push([view_name, prop]);
    }
    update(prop, strategy) {
      if (!this.activeViewInstance)
        throw `Update View but activeViewInstance is null`;
      this.viewStack[this.viewStack.length - 1][1] = prop;
      if (strategy == null ? void 0 : strategy.update) {
        strategy.update(this.activeViewInstance, prop, this._ui);
      } else {
        this.defaultRouteStrategy.update(this.activeViewInstance, prop, this._ui);
      }
    }
    clear(strategy) {
      if (this.activeViewInstance) {
        if (strategy == null ? void 0 : strategy.destroy) {
          strategy.destroy(this.activeViewInstance, this._ui);
        } else {
          this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
        }
        this.activeViewInstance = null;
      }
      this.viewStack = [];
    }
  }
  UI2.Router = Router;
})(UI || (UI = {}));
class HZEngineCore {
  constructor(platform) {
    __publicField(this, "platform");
    __publicField(this, "_eventCallbacks", /* @__PURE__ */ new Map());
    __publicField(this, "storage");
    __publicField(this, "async");
    __publicField(this, "ui");
    __publicField(this, "script");
    __publicField(this, "system");
    __publicField(this, "config");
    __publicField(this, "audio");
    __publicField(this, "debug");
    __publicField(this, "plugins", /* @__PURE__ */ new Map());
    this.platform = platform;
    this.storage = new Storage(this);
    this.async = new Async(this);
    this.ui = new UI(this);
    this.script = new Script(this);
    this.system = new System(this);
    this.config = new Config(this);
    this.audio = new Audio(this);
    this.debug = new Debug(this);
    this.loadPlugin("global_gesture", global_gesture);
    this.loadPlugin("transform", registerPlugin);
    this.loadPlugin("basic_command", basic_command);
  }
  loadProject(options) {
    this.storage.loadProject(options);
  }
  start(callback) {
    Async.nextTick(() => {
      var _a;
      this.debug.log("[HZEngine] Game Start");
      let title = (_a = this.storage.packageData) == null ? void 0 : _a.name;
      if (title == null) {
        throw `[HZEngine] project name is null, please loadProject first or check your project.json format`;
      }
      this.ui.getRouter("page").push("title", {
        title
      });
      callback == null ? void 0 : callback();
    });
  }
  end() {
    var _a;
    this.debug.log("[HZEngine] Game End, return to title");
    let title = (_a = this.storage.packageData) == null ? void 0 : _a.name;
    if (title == null) {
      throw `[HZEngine] project name is null, please loadProject first or check your project.json format`;
    }
    this.system.condition = System.Condition.Free;
    this.ui.resetUI();
    if (this.ui.getRouter("page").length > 0)
      return;
    this.ui.getRouter("page").push("title", {
      title
    });
  }
  // Load Plugin
  loadPlugin(name, plugin) {
    this.debug.log(`[HZEngine] load plugin [${name}]`);
    let slot = plugin(this);
    if (slot != void 0)
      this.plugins.set(name, slot);
  }
  // Event Bus
  on(event, cb) {
    if (this._eventCallbacks.has(event)) {
      this._eventCallbacks.get(event).add(cb);
    } else {
      this._eventCallbacks.set(event, (/* @__PURE__ */ new Set()).add(cb));
    }
  }
  off(event, cb) {
    var _a;
    return !!((_a = this._eventCallbacks.get(event)) == null ? void 0 : _a.delete(cb));
  }
  emit(event, ...args) {
    var _a;
    (_a = this._eventCallbacks.get(event)) == null ? void 0 : _a.forEach((cb) => {
      cb(...args);
    });
  }
}
function BlackTrans(core) {
  var animationPlugin = core.plugins.get(
    "animation"
  );
  if (!animationPlugin) {
    core.debug.log("animation plugin not found");
    return null;
  }
  class BlackTransView extends UI.View {
    constructor() {
      super(...arguments);
      this._widget = null;
      this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
      this._animationId = null;
      this.enableAnim = true;
      this.onCreated = null;
      this.onDestroyed = null;
      this.__prop = null;
    }
    onCreate(prop) {
      this.__prop = { ...prop };
      let size = core.ui.getScreenSize();
      this._widget = this._widgetFactory.createWidget(hmUI__default.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: size.width,
        h: size.height,
        color: 0
      });
      this._widget.setAlpha(0);
      if (this.enableAnim) {
        this._animationId = animationPlugin.createTempAnimation({
          profile: [
            { frame: { alpha: 0 } },
            {
              time: prop.in_time,
              wrapper: prop.in_wrapper,
              frame: { alpha: 1 }
            }
          ],
          onFrame: (props) => {
            this._widget.setAlpha(~~(props.alpha * 255));
          },
          onEnd: () => {
            if (this.onCreated) {
              this.onCreated();
            }
          }
        });
      }
    }
    onCommit(prop) {
    }
    onDestroy() {
      this._stopAnim();
      if (this.enableAnim) {
        this._animationId = animationPlugin.createTempAnimation({
          profile: [
            { frame: { alpha: 1 } },
            {
              time: this.__prop.out_time,
              wrapper: this.__prop.out_wrapper,
              frame: { alpha: 0 }
            }
          ],
          onFrame: (props) => {
            this._widget.setAlpha(~~(props.alpha * 255));
          },
          onEnd: () => {
            if (this._widget) {
              hmUI__default.deleteWidget(this._widget);
              this._widget = null;
            }
            if (this.onDestroyed) {
              this.onDestroyed();
            }
          }
        });
      } else {
        if (this._widget) {
          hmUI__default.deleteWidget(this._widget);
          this._widget = null;
        }
        if (this.onDestroyed) {
          this.onDestroyed();
        }
      }
    }
    _stopAnim() {
      if (this._animationId != null) {
        animationPlugin.clearTempAnimation(this._animationId);
        this._animationId = null;
      }
    }
  }
  core.ui.registerView("black_trans", BlackTransView);
  let activeView = null;
  return {
    show({
      cb,
      layer = "overlay",
      in_time = 0.8,
      out_time = 0.8,
      in_wrapper = "easein",
      out_wrapper = "easeout"
    }) {
      if (activeView) {
        activeView._stopAnim();
        activeView.enableAnim = false;
        core.ui.destroyView(activeView);
        activeView = null;
      }
      activeView = core.ui.createView(
        "black_trans",
        layer,
        {
          alpha: 0,
          in_time,
          out_time,
          in_wrapper,
          out_wrapper
        },
        false
      );
      activeView.onCreated = cb != null ? cb : null;
    },
    hide({ cb }) {
      if (activeView) {
        activeView.onDestroyed = cb != null ? cb : null;
        core.ui.destroyView(activeView);
        activeView = null;
      }
    }
  };
}
const { width: width$4, height: height$4, screenShape: screenShape$3 } = getDeviceInfo();
var designWidth = 480;
function px(raw) {
  return Math.ceil(raw / designWidth * width$4);
}
var util = {
  isString: (x) => typeof x === "string",
  // 检查是否为字符串
  isObject: (x) => typeof x === "object"
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
  return { protocol: null, filepath: path };
}
function normalizeArray(parts, allowAboveRoot) {
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (!p || p === ".")
      continue;
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
    if (arr[start])
      break;
  }
  var end = lastIndex;
  for (; end >= 0; end--) {
    if (arr[end])
      break;
  }
  if (start === 0 && end === lastIndex)
    return arr;
  if (start > end)
    return [];
  return arr.slice(start, end + 1);
}
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var posix = {};
function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}
posix.resolve = function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : process.cwd();
    if (!util.isString(path)) {
      throw new TypeError("Arguments to path.resolve must be strings");
    } else if (!path) {
      continue;
    }
    if (isProtocolPath(path)) {
      const { protocol, filepath } = extractProtocol(path);
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
posix.normalize = function(path) {
  if (isProtocolPath(path)) {
    const { protocol, filepath } = extractProtocol(path);
    return protocol + "://" + normalizeArray(filepath.split("/")).join("/");
  }
  var isAbsolute = posix.isAbsolute(path), trailingSlash = path && path[path.length - 1] === "/";
  path = normalizeArray(path.split("/"), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
    path = ".";
  }
  if (path && trailingSlash) {
    path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
};
posix.isAbsolute = function(path) {
  return path.charAt(0) === "/";
};
posix.join = function() {
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
posix.relative = function(from, to) {
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
posix.dirname = function(path) {
  var result = posixSplitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
    return ".";
  }
  if (dir) {
    dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
};
posix.basename = function(path, ext) {
  var f = posixSplitPath(path)[2];
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};
posix.extname = function(path) {
  return posixSplitPath(path)[3];
};
posix.format = function(pathObject) {
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
posix.parse = function(pathString) {
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
const { width: width$3, height: height$3, screenShape: screenShape$2 } = getDeviceInfo();
class CustomSayView extends UI.MessageView {
  constructor() {
    var _a;
    super(...arguments);
    this._widgets = null;
    this.enableAnim = true;
    this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
    this._what = null;
    this._animationPlugin = (_a = this.core.plugins.get("animation")) != null ? _a : null;
    this._animationId = null;
  }
  onCreate(prop) {
    let w = screenShape$2 === SCREEN_SHAPE_SQUARE ? width$3 : width$3;
    let h = screenShape$2 === SCREEN_SHAPE_SQUARE ? height$3 / 2 : height$3 / 2;
    this._what = prop.what;
    this._widgets = {
      bg: this._widgetFactory.createWidget(hmUI.widget.IMG, {
        x: (width$3 - w) / 2,
        y: height$3 / 2,
        w,
        h,
        src: posix.join(this.core.storage.projectRoot, "gui", "say_bg.png"),
        auto_scale: true
        // alpha: 128, // only 3.0 support
      }),
      who_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width$3 - w) / 2 + px(10),
        y: height$3 / 2,
        w: w - Number(px(20)),
        h: px(50),
        text_size: px(40),
        color: 16777215,
        text: prop.who
      }),
      what_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width$3 - w) / 2 + px(10),
        y: height$3 / 2 + Number(px(50)),
        w: w - Number(px(20)),
        h: height$3 - Number(px(50)),
        text_size: px(36),
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
    this._widgets.what_text.setProperty(
      hmUI.prop.TEXT,
      this.enableAnim ? "" : prop.what
    );
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
      var _a, _b;
      this._animationId = (_b = (_a = this._animationPlugin) == null ? void 0 : _a.createTempAnimation({
        profile: [
          {
            frame: { len: 0 }
          },
          {
            time: this._what.length * 0.06,
            wrapper: "linear",
            frame: { len: this._what.length }
          }
        ],
        onFrame: (props) => {
          var _a2, _b2;
          (_b2 = this._widgets) == null ? void 0 : _b2.what_text.setProperty(
            hmUI.prop.TEXT,
            (_a2 = this._what) == null ? void 0 : _a2.slice(0, ~~props.len)
          );
        },
        onEnd: () => {
          this.core.debug.log("[SayView]", "打字机结束");
        }
      })) != null ? _b : null;
    });
  }
  _clearAnim() {
    var _a;
    if (this._animationId) {
      (_a = this._animationPlugin) == null ? void 0 : _a.clearTempAnimation(this._animationId);
      this._animationId = null;
    }
  }
}
class FgImgView extends UI.FgImgView {
  constructor() {
    super(...arguments);
    this._widget = null;
    this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
    this.defaultProp = {
      yanchor: -1,
      yalign: -1
    };
  }
  onCreate(prop) {
    let position = this.core.ui.calcPosition(
      { ...this.defaultProp, ...prop },
      prop.size
    ).origin;
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
    let position = this.core.ui.calcPosition(
      { ...this.defaultProp, ...prop },
      prop.size
    ).origin;
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
    this._widget = null;
    this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
  }
  _calSize(size) {
    if (size.height >= size.width) {
      let rate = size.height / size.width;
      return {
        width: Number(px(480)),
        height: Number(px(480)) * rate
      };
    } else {
      let rate = size.width / size.height;
      return {
        width: Number(px(480)) * rate,
        height: Number(px(480))
      };
    }
  }
  onCreate(prop) {
    let size = this._calSize(prop.size);
    let position = this.core.ui.calcPosition(prop, size).origin;
    let _p = {
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
    };
    console.log("FgImgView Prop = ", JSON.stringify(_p));
    this._widget = this._widgetFactory.createWidget(hmUI.widget.IMG, _p);
  }
  onCommit(prop) {
    let size = this._calSize(prop.size);
    let position = this.core.ui.calcPosition(prop, size).origin;
    let _p = {
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
    };
    console.log("FgImgView Prop = ", JSON.stringify(_p));
    this._widget.setProperty(hmUI.prop.MORE, _p);
  }
  onDestroy() {
    hmUI.deleteWidget(this._widget);
    this._widget = null;
  }
}
class MenuView extends UI.MenuView {
  constructor() {
    super(...arguments);
    this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
    this._buttonWidgetList = null;
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
    let y = Number(px(30));
    const h = Number(px(60));
    const w = Number(px(300));
    const v_space = Number(px(20));
    for (let i = 0; i < prop.itemList.length; i++) {
      let itemProp = prop.itemList[i];
      let display = true;
      if (itemProp.enable_js_expression) {
        let res = this.core.script.evalExpression(
          itemProp.enable_js_expression
        );
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
          x: (width$3 - w) / 2,
          y,
          w,
          h,
          text: itemProp.text,
          text_size: px(36),
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
const { width: width$2, height: height$2, screenShape: screenShape$1 } = getDeviceInfo();
class TitleView extends UI.View {
  constructor() {
    var _a;
    super(...arguments);
    this._widgets = null;
    this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
    this._animationPlugin = (_a = this.core.plugins.get("animation")) != null ? _a : null;
    this._animation = null;
    this.enable_anim = true;
    this.enable_opening_anim = true;
    this.opening_view_id = null;
  }
  onCreate(prop) {
    {
      let w = width$2;
      let h = Number(px(60));
      let props = {
        x: (width$2 - w) / 2,
        y: Number(px(40)),
        w,
        h,
        text_size: px(40),
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
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$2 - w) / 2;
      let y = Number(px(130));
      this._widgets.button_start = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          radius: px(15),
          text: getText("start_game"),
          text_size: px(36),
          normal_color: 3355443,
          press_color: 5592405,
          click_func: () => {
            let black_trans_plugin = this.core.plugins.get("black_trans");
            let start = (cb) => {
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
        }
      );
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$2 - w) / 2;
      let y = Number(px(210));
      this._widgets.button_load = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          radius: px(15),
          text: getText("continue_game"),
          text_size: px(36),
          normal_color: 3355443,
          press_color: 5592405,
          click_func: () => {
            try {
              this.core.storage.loadArchiveData("archive000.json");
            } catch (e) {
              this.core.debug.log("[TitleView]", "請先開始遊戲");
              throw e;
            }
            this.core.ui.getRouter("page").pop();
          }
        }
      );
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$2 - w) / 2;
      let y = Number(px(290));
      this._widgets.button_gallery = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          radius: px(15),
          text: getText("gallery"),
          text_size: px(36),
          normal_color: 3355443,
          press_color: 5592405,
          click_func: () => {
            hmUI.showToast({ text: "施工中..." });
            this.core.ui.getRouter("page").push("gallery", {});
          }
        }
      );
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$2 - w) / 2;
      let y = Number(px(370));
      this._widgets.button_settings = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          radius: px(15),
          text: getText("settings"),
          text_size: px(36),
          normal_color: 3355443,
          press_color: 5592405,
          click_func: () => {
            hmUI.showToast({ text: "施工中..." });
            this.core.ui.getRouter("page").push("settings", {});
          }
        }
      );
    }
    if (this._animationPlugin) {
      if (this.enable_opening_anim) {
        this.opening_view_id = this.core.ui.createView(
          "info_opening",
          this.layer,
          { bg_alpha: 1, logo_alpha: 0 },
          this.isSave
        ).id;
        let animation = this._animationPlugin.createTempAnimation({
          profile: [
            {
              frame: { bg_alpha: 1, logo_alpha: 0 }
            },
            {
              time: 0.5
            },
            {
              time: 0.45,
              wrapper: "easein",
              frame: { logo_alpha: 1 }
            },
            {
              time: 0.3
            },
            {
              time: 1,
              wrapper: "easeout",
              frame: { bg_alpha: 0, logo_alpha: 0 }
            }
          ],
          onFrame: (prop2) => {
            var _a;
            let view = this.core.ui.getView(this.opening_view_id);
            if (!view) (_a = this._animationPlugin) == null ? void 0 : _a.clearTempAnimation(animation);
            else view.commit(prop2);
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
      return [
        { frame: { [`${key}_alpha`]: 0, [`${key}_xoffset`]: 200 } },
        { time: delay },
        {
          time: duration,
          wrapper: "easein",
          frame: { [`${key}_alpha`]: 1, [`${key}_xoffset`]: 0 }
        }
      ];
    };
    let delayList = Array(5).fill(0).map((_, i) => i * 0.16 + 1.5);
    this._animation = this._animationPlugin.createTempAnimation({
      profile: [
        getFadeinTrack(delayList[0], "text"),
        getFadeinTrack(delayList[1], "button_start"),
        getFadeinTrack(delayList[2], "button_load"),
        getFadeinTrack(delayList[3], "button_gallery"),
        getFadeinTrack(delayList[4], "button_settings")
      ],
      onFrame: (props) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
        let w = Number(px(320));
        let x = (width$2 - w) / 2;
        if (!this._widgets) this._clearAnim();
        this._widgets.title_text.setAlpha(~~(((_a = props.text_alpha) != null ? _a : 1) * 255));
        this._widgets.title_text.setProperty(
          hmUI.prop.X,
          ~~((_b = props.text_xoffset) != null ? _b : 0)
        );
        this._widgets.button_start.setAlpha(
          ~~(((_c = props.button_start_alpha) != null ? _c : 1) * 255)
        );
        this._widgets.button_start.setProperty(
          hmUI.prop.X,
          ~~(x + ((_d = props.button_start_xoffset) != null ? _d : 0))
        );
        this._widgets.button_load.setAlpha(
          ~~(((_e = props.button_load_alpha) != null ? _e : 1) * 255)
        );
        this._widgets.button_load.setProperty(
          hmUI.prop.X,
          ~~(x + ((_f = props.button_load_xoffset) != null ? _f : 0))
        );
        this._widgets.button_gallery.setAlpha(
          ~~(((_g = props.button_gallery_alpha) != null ? _g : 1) * 255)
        );
        this._widgets.button_gallery.setProperty(
          hmUI.prop.X,
          ~~(x + ((_h = props.button_gallery_xoffset) != null ? _h : 0))
        );
        this._widgets.button_settings.setAlpha(
          ~~(((_i = props.button_settings_alpha) != null ? _i : 1) * 255)
        );
        this._widgets.button_settings.setProperty(
          hmUI.prop.X,
          ~~(x + ((_j = props.button_settings_xoffset) != null ? _j : 0))
        );
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
    this._widgets = {};
    this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
  }
  onCreate(prop) {
    var _a, _b;
    this._widgets.bg = this._widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width$2,
      h: height$2,
      color: 0
    });
    this._widgets.logo = this._widgetFactory.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 0,
      w: width$2,
      h: height$2,
      text_size: px(42),
      text: "HZ-Engine Demo",
      color: 15658734,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });
    this._widgets.bg.setAlpha(~~(((_a = prop == null ? void 0 : prop.bg_alpha) != null ? _a : 1) * 255));
    this._widgets.logo.setAlpha(~~(((_b = prop == null ? void 0 : prop.logo_alpha) != null ? _b : 1) * 255));
  }
  onCommit(prop) {
    var _a, _b;
    this._widgets.bg.setAlpha(~~(((_a = prop == null ? void 0 : prop.bg_alpha) != null ? _a : 1) * 255));
    this._widgets.logo.setAlpha(~~(((_b = prop == null ? void 0 : prop.logo_alpha) != null ? _b : 1) * 255));
  }
  onDestroy() {
    hmUI.deleteWidget(this._widgets.bg);
    hmUI.deleteWidget(this._widgets.logo);
  }
}
const { width: width$1, height: height$1, screenShape } = getDeviceInfo();
class QuickMenu extends UI.View {
  constructor() {
    super(...arguments);
    this._widgets = null;
    this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
  }
  onCreate(prop) {
    this._widgets = {};
    {
      this._widgets.mask = this._widgetFactory.createWidget(
        hmUI.widget.FILL_RECT,
        {
          x: 0,
          y: 0,
          w: width$1,
          h: height$1,
          color: 0,
          alpha: 192
        }
      );
    }
    {
      let w = width$1;
      let h = Number(px(60));
      this._widgets.title_text = this._widgetFactory.createWidget(
        hmUI.widget.TEXT,
        {
          x: (width$1 - w) / 2,
          y: Number(px(40)),
          w,
          h,
          text_size: px(40),
          color: 16777215,
          text: getText("quick_menu"),
          align_h: hmUI.align.CENTER_H,
          align_v: hmUI.align.CENTER_V
        }
      );
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$1 - w) / 2;
      let y = Number(px(130));
      this._widgets.button_start = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          text: getText("quick_save"),
          text_size: px(36),
          normal_color: 3355443,
          press_color: 5592405,
          click_func: () => {
            if (this.core.storage.projectRoot == null) {
              hmUI.showToast({ text: "请先打开项目" });
              return;
            }
            try {
              this.core.storage.saveArchiveData("archive_quick.json");
            } catch (e) {
              hmUI.showToast({ text: "快速存档失败" });
              this.core.debug.log(
                "[QuickMenu]",
                `quick save failed, error: 
${e}`
              );
              throw e;
            }
            hmUI.showToast({ text: "快速存档成功" });
          }
        }
      );
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$1 - w) / 2;
      let y = Number(px(210));
      this._widgets.button_load = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          text: getText("quick_load"),
          text_size: px(36),
          normal_color: 3355443,
          press_color: 5592405,
          click_func: () => {
            if (this.core.storage.projectRoot == null) {
              hmUI.showToast({ text: "请先打开项目" });
              return;
            }
            try {
              this.core.storage.loadArchiveData("archive_quick.json");
            } catch (e) {
              hmUI.showToast({ text: "快速读档失败" });
              this.core.debug.log(
                "[QuickMenu]",
                `quick load failed, error: 
${e}`
              );
              throw e;
            }
            hmUI.showToast({ text: "快速读档成功" });
            this.core.ui.getRouter("page").pop();
          }
        }
      );
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$1 - w) / 2;
      let y = Number(px(290));
      this._widgets.button_gallery = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          text: getText("archive_page"),
          text_size: px(36),
          normal_color: 3355443,
          press_color: 5592405,
          click_func: () => {
            hmUI.showToast({ text: "施工中..." });
          }
        }
      );
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$1 - w) / 2;
      let y = Number(px(370));
      this._widgets.button_settings = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          text: getText("settings"),
          text_size: px(36),
          normal_color: 3355443,
          press_color: 5592405,
          click_func: () => {
            hmUI.showToast({ text: "施工中..." });
          }
        }
      );
    }
  }
  onCommit(prop) {
  }
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
function ViewPlugin(core) {
  core.ui.registerView("say", CustomSayView);
  core.ui.registerView("fg_img", FgImgView);
  core.ui.registerView("bg_img", BgImgView);
  core.ui.registerView("menu", MenuView);
  core.ui.registerView("title", TitleView);
  core.ui.registerView("quick_menu", QuickMenu);
  core.ui.registerView("info_opening", InfoOpening);
}
const { width, height } = getDeviceInfo();
const profiler = new Profiler();
profiler.show();
const battery = new Battery();
battery.getCurrent();
let hzengine = null;
Page({
  state: {
    params: null,
    projectPath: null,
    cachePath: null,
    savePath: null
  },
  onInit(params) {
    if (params) {
      this.state.params = JSON.parse(params);
      this.state.projectPath = this.state.params.projectPath;
      this.state.cachePath = this.state.params.cachePath;
      this.state.savePath = this.state.params.savePath;
    }
  },
  build() {
    setStatusBarVisible(false);
    if (!this.state.projectPath) {
      hmUI__default.createWidget(hmUI__default.widget.TEXT, {
        x: 0,
        y: 0,
        w: width,
        h: height,
        text: "未传入项目路径",
        color: 15658734,
        align_h: hmUI__default.align.CENTER_H,
        align_v: hmUI__default.align.CENTER_V,
        text_size: px$1(32)
      });
      return;
    }
    var timeSensor = new Time();
    var _hmPlayer = null, hmPlayerOccupied = false;
    hzengine = new HZEngineCore({
      name: "zeppos",
      // screen
      getScreenSize() {
        return [width, height];
      },
      // ui
      createUILayer({ z_index }) {
        return hmUI__default.createWidget(hmUI__default.widget.VIEW_CONTAINER, {
          scroll_enable: 0,
          z_index
        });
      },
      deleteUILayer(widgetFactory) {
        hmUI__default.deleteWidget(widgetFactory);
      },
      // fs
      isFileSync({ path }) {
        let code = hmFS.openSync({ path });
        if (code >= 0) {
          hmFS.closeSync({ fd: code });
          return true;
        } else {
          return false;
        }
      },
      readdirSync(option) {
        return hmFS.readdirSync(option);
      },
      statSync(option) {
        return hmFS.statSync(option);
      },
      readFileSync(option) {
        return hmFS.readFileSync(option);
      },
      writeFileSync(option) {
        return hmFS.writeFileSync(option);
      },
      getImageInfo(img_path) {
        return hmUI__default.getImageInfo(img_path);
      },
      // timer & async
      getTime: () => timeSensor.getTime(),
      // audio
      createAudioPlayer() {
        if (!_hmPlayer) {
          _hmPlayer = create(id.PLAYER);
        }
        if (hmPlayerOccupied) throw new Error(`[HZEngine] ZeppOS can only have one AudioPlayer.`);
        hmPlayerOccupied = true;
        return _hmPlayer;
      },
      releaseAudioPlayer(audio_player) {
        audio_player.stop();
        hmPlayerOccupied = false;
      },
      setFrameInterval(callback) {
        setInterval(callback, 1e3 / 60);
      }
    });
    hzengine.loadPlugin("views", ViewPlugin);
    hzengine.loadPlugin("black_trans", BlackTrans);
    hzengine.loadProject({
      projectPath: this.state.projectPath,
      cachePath: this.state.cachePath,
      savePath: this.state.savePath
    });
    let isEmulator = current === 0;
    hzengine.storage.gd.realEnv = !isEmulator;
    console.log(`当前电量为${current}%，是否认定为模拟器:${isEmulator}`);
    hzengine.start();
    function tryOpenQuickMenu() {
      if (hzengine.system.condition !== System.Condition.Free) {
        let router = hzengine.ui.getRouter("page");
        if (router && router.length) {
          router.pop();
        } else {
          if (!router) router = hzengine.ui.addRouter("page", "overlay");
          router.push("quick_menu", {});
        }
        return true;
      }
    }
    function global_gesture2(core) {
      function addTouchPad(layerInstance) {
        core.debug.log("[TouchPad] Test for ZeppOS");
        let touchPad = layerInstance.widgetFactory.createWidget(hmUI__default.widget.TEXT, {
          x: 0,
          y: 0,
          w: 600,
          h: 600,
          text: ""
        });
        touchPad.addEventListener(hmUI__default.event.SELECT, (info) => {
          console.log("按下了屏幕");
          if (core.system.condition === System.Condition.Pause) {
            core.system.continue();
          }
        });
      }
      addTouchPad(core.ui.getLayer("ct"));
      core.on("afterAddLayer", (layerInstance) => {
        if (layerInstance.name !== "ct") return;
        addTouchPad(layerInstance);
      });
    }
    global_gesture2(hzengine);
    hzengine.on("test.log", (...args) => {
      console.log("test.log", ...args);
    });
    onKey({
      callback: (key, keyEvent) => {
        if ((key === KEY_BACK || key === KEY_SHORTCUT) && keyEvent === KEY_EVENT_CLICK) {
          if (tryOpenQuickMenu()) return true;
        }
        if (key === KEY_SELECT && keyEvent === KEY_EVENT_CLICK) {
          if (hzengine.system.condition === System.Condition.Pause) {
            hzengine.system.continue();
          }
        }
        return false;
      }
    });
    onGesture({
      callback: (event) => {
        if (event === GESTURE_LEFT) {
          if (tryOpenQuickMenu()) return true;
        }
        return false;
      }
    });
    console.log("page.js build已顺利完成");
  },
  onDestroy() {
    hzengine && hzengine.storage.saveArchiveData("archive000.json", true);
  }
});

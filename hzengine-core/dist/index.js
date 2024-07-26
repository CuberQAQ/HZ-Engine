"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = exports.Script = exports.Storage = exports.UI = exports.HZEngineCore = void 0;
const async_1 = require("./async");
const basic_command_1 = require("./plugins/basic_command");
const global_gesture_1 = require("./plugins/global_gesture");
const script_1 = require("./script");
Object.defineProperty(exports, "Script", { enumerable: true, get: function () { return script_1.Script; } });
const storage_1 = require("./storage");
Object.defineProperty(exports, "Storage", { enumerable: true, get: function () { return storage_1.Storage; } });
const system_1 = require("./system");
Object.defineProperty(exports, "System", { enumerable: true, get: function () { return system_1.System; } });
const ui_1 = require("./ui");
Object.defineProperty(exports, "UI", { enumerable: true, get: function () { return ui_1.UI; } });
class HZEngineCore {
    constructor() {
        // 請不要調整這裡的初始化順序，不然會有問題（裝飾器裡有時候要用到前面初始化的東西）
        this._eventCallbacks = new Map();
        this.storage = new storage_1.Storage(this);
        this.ui = new ui_1.UI(this);
        this.script = new script_1.Script(this);
        this.system = new system_1.System(this);
        // internal plugin
        this.loadPlugin("global_gesture", global_gesture_1.global_gesture);
        this.loadPlugin("basic_command", basic_command_1.basic_command);
    }
    loadProject(projectPath) {
        this.storage.loadProject(projectPath);
    }
    start(callback) {
        // this.system.start()
        async_1.Async.nextTick(() => {
            var _a;
            let title = (_a = this.storage.packageData) === null || _a === void 0 ? void 0 : _a.name;
            if (title == null) {
                throw `[HZEngine] project name is null, please loadProject first or check your project.json format`;
            }
            this.ui.getRouter("page").push("title", {
                title,
            });
            callback === null || callback === void 0 ? void 0 : callback();
        });
    }
    // Load Plugin
    loadPlugin(name, plugin) {
        console.log(`[HZEngine] load plugin [${name}]`);
        plugin(this);
    }
    // Event Bus
    on(event, cb) {
        if (this._eventCallbacks.has(event)) {
            this._eventCallbacks.get(event).add(cb);
        }
        else {
            this._eventCallbacks.set(event, new Set().add(cb));
        }
    }
    off(event, cb) {
        var _a;
        return !!((_a = this._eventCallbacks.get(event)) === null || _a === void 0 ? void 0 : _a.delete(cb));
    }
    emit(event, ...args) {
        var _a;
        (_a = this._eventCallbacks.get(event)) === null || _a === void 0 ? void 0 : _a.forEach((cb) => {
            cb(...args);
        });
    }
}
exports.HZEngineCore = HZEngineCore;

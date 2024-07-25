"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = exports.UI = exports.HZEngineCore = void 0;
const basic_command_1 = require("./plugins/basic_command");
const global_gesture_1 = require("./plugins/global_gesture");
const script_1 = require("./script");
const storage_1 = require("./storage");
Object.defineProperty(exports, "Storage", { enumerable: true, get: function () { return storage_1.Storage; } });
const system_1 = require("./system");
const ui_1 = require("./ui");
Object.defineProperty(exports, "UI", { enumerable: true, get: function () { return ui_1.UI; } });
class HZEngineCore {
    constructor() {
        this.ui = new ui_1.UI(this);
        this.storage = new storage_1.Storage(this);
        this.script = new script_1.Script(this);
        this.system = new system_1.System(this);
        // Event Bus
        this._eventCallbacks = new Map();
        // internal plugin
        this.loadPlugin("global_gesture", global_gesture_1.global_gesture);
        this.loadPlugin("basic_command", basic_command_1.basic_command);
    }
    loadProject(projectPath) {
        this.storage.loadProject(projectPath);
    }
    start() {
        var _a;
        // this.system.start()
        let title = (_a = this.storage.packageData) === null || _a === void 0 ? void 0 : _a.name;
        if (title == null) {
            throw `[HZEngine] project name is null, please loadProject first or check your project.json format`;
        }
        this.ui.getRouter("page").push("title", {
            title,
        });
    }
    // Load Plugin
    loadPlugin(name, plugin) {
        console.log(`[HZEngine] load plugin [${name}]`);
        plugin(this);
    }
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

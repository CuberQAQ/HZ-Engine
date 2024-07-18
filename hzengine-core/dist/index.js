"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = exports.UI = exports.HZEngineCore = void 0;
const storage_1 = require("./storage");
Object.defineProperty(exports, "Storage", { enumerable: true, get: function () { return storage_1.Storage; } });
const ui_1 = require("./ui");
Object.defineProperty(exports, "UI", { enumerable: true, get: function () { return ui_1.UI; } });
class HZEngineCore {
    constructor() {
        this.ui = new ui_1.UI(this);
        this.storage = new storage_1.Storage(this);
        // Event Bus
        this._eventCallbacks = new Map();
    }
    loadProject(projectPath) {
        this.storage.loadProject(projectPath);
    }
    start() { }
    // Load Plugin
    loadPlugin(name, plugin) {
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

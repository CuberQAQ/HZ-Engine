"use strict";
/**
 * HZEngineCore
 * @copyright Copyright (c) 2024 CuberQAQ. All rights reserved.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformPlugin = exports.Async = exports.System = exports.Script = exports.Storage = exports.UI = exports.HZEngineCore = void 0;
const async_1 = require("./async");
Object.defineProperty(exports, "Async", { enumerable: true, get: function () { return async_1.Async; } });
const debug_1 = require("./debug");
const basic_command_1 = require("./plugins/basic_command");
const global_gesture_1 = require("./plugins/global_gesture");
const transform_1 = require("./plugins/transform");
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
        this.async = new async_1.Async(this);
        this.ui = new ui_1.UI(this);
        this.script = new script_1.Script(this);
        this.system = new system_1.System(this);
        this.debug = new debug_1.Debug(this);
        this.plugins = new Map();
        // internal plugin
        this.loadPlugin("global_gesture", global_gesture_1.global_gesture);
        this.loadPlugin("transform", transform_1.registerPlugin);
        this.loadPlugin("basic_command", basic_command_1.basic_command);
    }
    loadProject(options) {
        this.storage.loadProject(options);
    }
    start(callback) {
        // this.system.start()
        async_1.Async.nextTick(() => {
            var _a;
            console.log("[HZEngine] Game Start");
            let title = (_a = this.storage.packageData) === null || _a === void 0 ? void 0 : _a.name;
            if (title == null) {
                throw `[HZEngine] project name is null, please loadProject first or check your project.json format`;
            }
            this.ui.getRouter("page").push("title", {
                title,
            });
            // this.on("gameEnd", () => {
            //   let router = this.ui.getRouter("page")!;
            //   if (router.length > 0) return;
            //   router.push("title", {
            //     title,
            //   });
            // });
            callback === null || callback === void 0 ? void 0 : callback();
        });
    }
    end() {
        var _a;
        console.log("[HZEngine] Game End, return to title");
        let title = (_a = this.storage.packageData) === null || _a === void 0 ? void 0 : _a.name;
        if (title == null) {
            throw `[HZEngine] project name is null, please loadProject first or check your project.json format`;
        }
        this.system.condition = system_1.System.Condition.Free;
        this.ui.resetUI();
        if (this.ui.getRouter("page").length > 0)
            return;
        this.ui.getRouter("page").push("title", {
            title,
        });
    }
    // Load Plugin
    loadPlugin(name, plugin) {
        console.log(`[HZEngine] load plugin [${name}]`);
        let slot = plugin(this);
        if (slot != undefined)
            this.plugins.set(name, slot);
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
exports.TransformPlugin = __importStar(require("./plugins/transform"));

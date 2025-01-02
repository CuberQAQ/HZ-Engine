/**
 * HZEngineCore
 * @copyright Copyright (c) 2024 CuberQAQ. All rights reserved.
 */
import { Async } from "./async/index.js";
import { Audio } from "./audio/index.js";
import { Config } from "./config/index.js";
import { Debug } from "./debug/index.js";
import { basic_command } from "./plugins/basic_command/index.js";
import { global_gesture } from "./plugins/global_gesture/index.js";
import { registerPlugin } from "./plugins/transform/index.js";
import { Script } from "./script/index.js";
import { Storage } from "./storage/index.js";
import { System } from "./system/index.js";
import { UI } from "./ui/index.js";
class HZEngineCore {
    constructor(platform) {
        this.platform = platform;
        this._eventCallbacks = new Map();
        this.plugins = new Map();
        // 請不要調整這裡的初始化順序，不然會有問題（裝飾器裡有時候要用到前面初始化的東西）
        this.storage = new Storage(this);
        this.async = new Async(this);
        this.ui = new UI(this);
        this.script = new Script(this);
        this.system = new System(this);
        this.config = new Config(this);
        this.audio = new Audio(this);
        this.debug = new Debug(this);
        // internal plugin
        this.loadPlugin("global_gesture", global_gesture);
        this.loadPlugin("transform", registerPlugin);
        this.loadPlugin("basic_command", basic_command);
    }
    loadProject(options) {
        this.storage.loadProject(options);
    }
    start(callback) {
        // this.system.start()
        Async.nextTick(() => {
            var _a;
            this.debug.log("[HZEngine] Game Start");
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
        this.debug.log("[HZEngine] Game End, return to title");
        let title = (_a = this.storage.packageData) === null || _a === void 0 ? void 0 : _a.name;
        if (title == null) {
            throw `[HZEngine] project name is null, please loadProject first or check your project.json format`;
        }
        this.system.condition = System.Condition.Free;
        this.ui.resetUI();
        if (this.ui.getRouter("page").length > 0)
            return;
        this.ui.getRouter("page").push("title", {
            title,
        });
    }
    // Load Plugin
    loadPlugin(name, plugin) {
        this.debug.log(`[HZEngine] load plugin [${name}]`);
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
export { HZEngineCore, UI, Storage, Script, System, Async };
export * as TransformPlugin from "./plugins/transform/index.js";

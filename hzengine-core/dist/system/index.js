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
import { Save } from "../storage/decorator.js";
let System = (() => {
    let _condition_decorators;
    let _condition_initializers = [];
    let _condition_extraInitializers = [];
    return class System {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _condition_decorators = [Save("system.condition")];
            __esDecorate(this, null, _condition_decorators, { kind: "accessor", name: "condition", static: false, private: false, access: { has: obj => "condition" in obj, get: obj => obj.condition, set: (obj, value) => { obj.condition = value; } }, metadata: _metadata }, _condition_initializers, _condition_extraInitializers);
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
        #condition_accessor_storage = __runInitializers(this, _condition_initializers, System.Condition.Free);
        get condition() { return this.#condition_accessor_storage; }
        set condition(value) { this.#condition_accessor_storage = value; }
        _pauseTimer = (__runInitializers(this, _condition_extraInitializers), null);
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
export { System };
(function (System) {
    let Condition;
    (function (Condition) {
        Condition[Condition["Free"] = 0] = "Free";
        Condition[Condition["Pause"] = 1] = "Pause";
        Condition[Condition["Blocked"] = 2] = "Blocked";
        Condition[Condition["Gaming"] = 3] = "Gaming";
    })(Condition = System.Condition || (System.Condition = {}));
})(System || (System = {}));

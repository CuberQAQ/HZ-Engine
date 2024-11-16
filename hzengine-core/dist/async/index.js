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
// import { Time } from "@zos/sensor";
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
            __esDecorate(this, null, __nextTimerId_decorators, { kind: "accessor", name: "_nextTimerId", static: false, private: false, access: { has: obj => "_nextTimerId" in obj, get: obj => obj._nextTimerId, set: (obj, value) => { obj._nextTimerId = value; } }, metadata: _metadata }, __nextTimerId_initializers, __nextTimerId_extraInitializers);
            __esDecorate(this, null, __delayTasks_decorators, { kind: "accessor", name: "_delayTasks", static: false, private: false, access: { has: obj => "_delayTasks" in obj, get: obj => obj._delayTasks, set: (obj, value) => { obj._delayTasks = value; } }, metadata: _metadata }, __delayTasks_initializers, __delayTasks_extraInitializers);
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
        // private _fps = 45;
        // private _hmTime = new Time();
        _lastTime;
        constructor(_core) {
            __runInitializers(this, __delayTasks_extraInitializers);
            this._core = _core;
            // console.log("async init");
            // let timer = new ZeppTimer(() => {
            // //   console.log(`async timer cb`);
            //   this._scheduleTask();
            // }, ~~(1000 / this._fps));
            // timer.start();
            this._lastTime = this._core.platform.getTime();
            // setInterval(() => {
            //   this._scheduleTask();
            // }, ~~(1000 / this._fps));
            _core.platform.setFrameInterval(() => {
                this._scheduleTask();
            });
        }
        _scheduleTask() {
            // TODO 沒有充分考慮存檔時產生的問題（this._delayTasks引用變化），及其它問題
            let now = this._core.platform.getTime();
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
        #_nextTimerId_accessor_storage = __runInitializers(this, __nextTimerId_initializers, 50);
        get _nextTimerId() { return this.#_nextTimerId_accessor_storage; }
        set _nextTimerId(value) { this.#_nextTimerId_accessor_storage = value; }
        #_delayTasks_accessor_storage = (__runInitializers(this, __nextTimerId_extraInitializers), __runInitializers(this, __delayTasks_initializers, {}));
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
export { Async };

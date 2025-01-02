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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
import { Save } from "../storage/decorator.js";
// import { Time } from "@zos/sensor";
let Async = (() => {
    var _a, _Async__nextTimerId_accessor_storage, _Async__delayTasks_accessor_storage;
    let __nextTimerId_decorators;
    let __nextTimerId_initializers = [];
    let __nextTimerId_extraInitializers = [];
    let __delayTasks_decorators;
    let __delayTasks_initializers = [];
    let __delayTasks_extraInitializers = [];
    return _a = class Async {
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
            constructor(_core) {
                this._core = _core;
                _Async__nextTimerId_accessor_storage.set(this, __runInitializers(this, __nextTimerId_initializers, 50));
                _Async__delayTasks_accessor_storage.set(this, (__runInitializers(this, __nextTimerId_extraInitializers), __runInitializers(this, __delayTasks_initializers, {})));
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
            get _nextTimerId() { return __classPrivateFieldGet(this, _Async__nextTimerId_accessor_storage, "f"); }
            set _nextTimerId(value) { __classPrivateFieldSet(this, _Async__nextTimerId_accessor_storage, value, "f"); }
            // tasks
            get _delayTasks() { return __classPrivateFieldGet(this, _Async__delayTasks_accessor_storage, "f"); }
            set _delayTasks(value) { __classPrivateFieldSet(this, _Async__delayTasks_accessor_storage, value, "f"); }
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
                    next: delayMs !== null && delayMs !== void 0 ? delayMs : intervalMs,
                    repeat: intervalMs,
                };
                let id = this._nextTimerId++;
                this._delayTasks[id] = task;
                return id;
            }
            removeTask(id) {
                delete this._delayTasks[id];
            }
        },
        _Async__nextTimerId_accessor_storage = new WeakMap(),
        _Async__delayTasks_accessor_storage = new WeakMap(),
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __nextTimerId_decorators = [Save("async.nextTimerId")];
            __delayTasks_decorators = [Save("async.delayTasks")];
            __esDecorate(_a, null, __nextTimerId_decorators, { kind: "accessor", name: "_nextTimerId", static: false, private: false, access: { has: obj => "_nextTimerId" in obj, get: obj => obj._nextTimerId, set: (obj, value) => { obj._nextTimerId = value; } }, metadata: _metadata }, __nextTimerId_initializers, __nextTimerId_extraInitializers);
            __esDecorate(_a, null, __delayTasks_decorators, { kind: "accessor", name: "_delayTasks", static: false, private: false, access: { has: obj => "_delayTasks" in obj, get: obj => obj._delayTasks, set: (obj, value) => { obj._delayTasks = value; } }, metadata: _metadata }, __delayTasks_initializers, __delayTasks_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a._nextTickCallbacks = [],
        _a._nextTickTimerId = null,
        _a;
})();
export { Async };

"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
const decorator_1 = require("../storage/decorator");
let System = (() => {
    var _a, _System_condition_accessor_storage;
    let _condition_decorators;
    let _condition_initializers = [];
    let _condition_extraInitializers = [];
    return _a = class System {
            constructor(_core) {
                this._core = _core;
                _System_condition_accessor_storage.set(this, __runInitializers(this, _condition_initializers, _a.Condition.Free));
                __runInitializers(this, _condition_extraInitializers);
                this._core = _core;
            }
            get condition() { return __classPrivateFieldGet(this, _System_condition_accessor_storage, "f"); }
            set condition(value) { __classPrivateFieldSet(this, _System_condition_accessor_storage, value, "f"); }
            pause(delayMs) {
                console.log(`[HZEngine] Pause`);
                if (delayMs)
                    throw `delayMs not implemented`;
                if (this.condition === _a.Condition.Gaming) {
                    this.condition = _a.Condition.Pause;
                }
                else
                    throw `pause but condition error (todo)`; // TODO
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
                    // console.log("Run Single Line");
                    this._core.script.runSingleLine();
                }
            }
            start(initLabel = "start") {
                // 初始化存档
                this._core.storage.archiveData;
                console.log("ciallo");
                this._core.script.clear();
                this._core.script.jumpLabel(initLabel);
                this.run();
            }
        },
        _System_condition_accessor_storage = new WeakMap(),
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _condition_decorators = [(0, decorator_1.ArchiveStateAccessor)("system.condition")];
            __esDecorate(_a, null, _condition_decorators, { kind: "accessor", name: "condition", static: false, private: false, access: { has: obj => "condition" in obj, get: obj => obj.condition, set: (obj, value) => { obj.condition = value; } }, metadata: _metadata }, _condition_initializers, _condition_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.System = System;
(function (System) {
    let Condition;
    (function (Condition) {
        Condition[Condition["Free"] = 0] = "Free";
        Condition[Condition["Pause"] = 1] = "Pause";
        Condition[Condition["Blocked"] = 2] = "Blocked";
        Condition[Condition["Gaming"] = 3] = "Gaming";
    })(Condition = System.Condition || (System.Condition = {}));
})(System || (exports.System = System = {}));

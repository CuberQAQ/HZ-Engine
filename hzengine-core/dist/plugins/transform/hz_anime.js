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
exports.AnimationPlugin = void 0;
const decorator_1 = require("../../storage/decorator");
const animation_1 = require("./animation");
const sensor_1 = require("@zos/sensor");
let AnimationPlugin = (() => {
    var _a, _AnimationPlugin__nextAnimationId_accessor_storage, _AnimationPlugin__animationMap_accessor_storage;
    let __nextAnimationId_decorators;
    let __nextAnimationId_initializers = [];
    let __nextAnimationId_extraInitializers = [];
    let __animationMap_decorators;
    let __animationMap_initializers = [];
    let __animationMap_extraInitializers = [];
    return _a = class AnimationPlugin {
            constructor(_core) {
                this._core = _core;
                _AnimationPlugin__nextAnimationId_accessor_storage.set(this, __runInitializers(this, __nextAnimationId_initializers, 1));
                _AnimationPlugin__animationMap_accessor_storage.set(this, (__runInitializers(this, __nextAnimationId_extraInitializers), __runInitializers(this, __animationMap_initializers, {})));
                this._timeSensor = (__runInitializers(this, __animationMap_extraInitializers), new sensor_1.Time());
                this._lastCbUtc = this._timeSensor.getTime();
                this._nextTempAnimationId = -1; // self-decrement
                this._tempAnimationMap = {};
                _core.loadPlugin("animation", () => this);
                _core.on("anime.cb", this._timerCb.bind(this));
                _core.async.addRepeatTask("anime.cb", [], 0); // 此處周期應考慮加個sync update
            }
            get _nextAnimationId() { return __classPrivateFieldGet(this, _AnimationPlugin__nextAnimationId_accessor_storage, "f"); } // self-increment
            set _nextAnimationId(value) { __classPrivateFieldSet(this, _AnimationPlugin__nextAnimationId_accessor_storage, value, "f"); }
            get _animationMap() { return __classPrivateFieldGet(this, _AnimationPlugin__animationMap_accessor_storage, "f"); }
            set _animationMap(value) { __classPrivateFieldSet(this, _AnimationPlugin__animationMap_accessor_storage, value, "f"); }
            applyAnimation({ profile, targetView, options, }) {
                var _b, _c, _d;
                const id = this._nextAnimationId++;
                let animation = new animation_1.Animation(profile, {
                    initProps: (_b = targetView.prop) !== null && _b !== void 0 ? _b : {},
                    wrappers: options === null || options === void 0 ? void 0 : options.customWrappers,
                });
                if (!targetView.id)
                    throw "targetView.id must be not null";
                this._animationMap[id] = {
                    destroyOnEnd: (_c = options === null || options === void 0 ? void 0 : options.destroyOnEnd) !== null && _c !== void 0 ? _c : false,
                    isSave: (_d = options === null || options === void 0 ? void 0 : options.isSave) !== null && _d !== void 0 ? _d : true,
                    instance: animation,
                    targetViewId: targetView.id,
                };
                this._linkAnimationCb(animation, id);
                animation.goto(0);
                this._core.on("afterLoadArchive", () => {
                    this._lastCbUtc = this._timeSensor.getTime();
                });
                return id;
            }
            stopAnimation(id) {
                if (this._animationMap[id] !== undefined) {
                    this._animationMap[id].instance.stop();
                    delete this._animationMap[id];
                }
            }
            createTempAnimation({ profile, onFrame, onEnd, initProps, wrappers, }) {
                let id = this._nextTempAnimationId--;
                let animation = new animation_1.Animation(profile, {
                    initProps,
                    wrappers,
                });
                animation.onFrame = onFrame !== null && onFrame !== void 0 ? onFrame : null;
                animation.onEnd = () => {
                    if (onEnd)
                        onEnd();
                    delete this._tempAnimationMap[id];
                };
                this._tempAnimationMap[id] = animation;
                return id;
            }
            clearTempAnimation(id) {
                if (this._tempAnimationMap[id] !== undefined) {
                    this._tempAnimationMap[id].stop();
                    delete this._tempAnimationMap[id];
                }
            }
            _timerCb() {
                let utc = this._timeSensor.getTime();
                let delta_time = (utc - this._lastCbUtc) / 1000;
                this._lastCbUtc = utc;
                // this._core.debug.log(`delta time: ${delta_time}`);
                for (let id in this._animationMap) {
                    this._animationMap[id].instance.step(delta_time);
                }
                for (let id in this._tempAnimationMap) {
                    this._tempAnimationMap[id].step(delta_time);
                }
            }
            _frameCb(props, id) {
                if (this._animationMap[id] !== undefined) {
                    let view = this._core.ui.getView(this._animationMap[id].targetViewId);
                    if (!view) {
                        this._core.debug.log(`view ${id} not found, stop animation`);
                        this.stopAnimation(id); // TODO
                        return;
                    }
                    view.commit(props);
                    // this._core.debug.log(`update view ${view.name} with ${JSON.stringify(props)}`);
                }
            }
            _linkAnimationCb(animation, id) {
                animation.onFrame = (props) => {
                    // console.log("onFrame cb");
                    this._frameCb(props, id);
                };
                animation.onEnd = () => this._endCb(id);
            }
            _endCb(id) {
                if (this._animationMap[id] !== undefined) {
                    if (this._animationMap[id].destroyOnEnd) {
                        let view = this._core.ui.getView(id);
                        if (!view)
                            return;
                        this._core.ui.destroyView(view);
                    }
                    delete this._animationMap[id];
                }
            }
        },
        _AnimationPlugin__nextAnimationId_accessor_storage = new WeakMap(),
        _AnimationPlugin__animationMap_accessor_storage = new WeakMap(),
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __nextAnimationId_decorators = [(0, decorator_1.ArchiveStateAccessor)("anime.nid")];
            __animationMap_decorators = [(0, decorator_1.ArchiveStateAccessorWithSerializer)("anime.map", function (obj) {
                    let res = {};
                    for (let id in obj) {
                        if (!obj[id].isSave)
                            continue;
                        res[id] = {
                            destroyOnEnd: obj[id].destroyOnEnd,
                            isSave: obj[id].isSave,
                            targetViewId: obj[id].targetViewId,
                            serializedInstance: obj[id].instance.serialize(),
                        };
                    }
                    return res;
                }, function (obj) {
                    let res = {};
                    for (let id in obj) {
                        if (!obj[id].isSave)
                            continue;
                        let animation = animation_1.Animation.unserialize(obj[id].serializedInstance);
                        this._linkAnimationCb(animation, Number(id));
                        res[id] = {
                            destroyOnEnd: obj[id].destroyOnEnd,
                            isSave: obj[id].isSave,
                            targetViewId: obj[id].targetViewId,
                            instance: animation,
                        };
                    }
                    return res;
                })];
            __esDecorate(_a, null, __nextAnimationId_decorators, { kind: "accessor", name: "_nextAnimationId", static: false, private: false, access: { has: obj => "_nextAnimationId" in obj, get: obj => obj._nextAnimationId, set: (obj, value) => { obj._nextAnimationId = value; } }, metadata: _metadata }, __nextAnimationId_initializers, __nextAnimationId_extraInitializers);
            __esDecorate(_a, null, __animationMap_decorators, { kind: "accessor", name: "_animationMap", static: false, private: false, access: { has: obj => "_animationMap" in obj, get: obj => obj._animationMap, set: (obj, value) => { obj._animationMap = value; } }, metadata: _metadata }, __animationMap_initializers, __animationMap_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.AnimationPlugin = AnimationPlugin;

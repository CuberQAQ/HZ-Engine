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
import { Save, CustomSave, } from "../../storage/decorator.js";
import { Animation } from "./animation.js";
import { Time } from "@zos/sensor";
let AnimationPlugin = (() => {
    let __nextAnimationId_decorators;
    let __nextAnimationId_initializers = [];
    let __nextAnimationId_extraInitializers = [];
    let __animationMap_decorators;
    let __animationMap_initializers = [];
    let __animationMap_extraInitializers = [];
    return class AnimationPlugin {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __nextAnimationId_decorators = [Save("anime.nid")];
            __animationMap_decorators = [CustomSave("anime.map", function (obj) {
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
                        let animation = Animation.unserialize(obj[id].serializedInstance);
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
            __esDecorate(this, null, __nextAnimationId_decorators, { kind: "accessor", name: "_nextAnimationId", static: false, private: false, access: { has: obj => "_nextAnimationId" in obj, get: obj => obj._nextAnimationId, set: (obj, value) => { obj._nextAnimationId = value; } }, metadata: _metadata }, __nextAnimationId_initializers, __nextAnimationId_extraInitializers);
            __esDecorate(this, null, __animationMap_decorators, { kind: "accessor", name: "_animationMap", static: false, private: false, access: { has: obj => "_animationMap" in obj, get: obj => obj._animationMap, set: (obj, value) => { obj._animationMap = value; } }, metadata: _metadata }, __animationMap_initializers, __animationMap_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _core;
        constructor(_core) {
            this._core = _core;
            _core.loadPlugin("animation", () => this);
            _core.on("anime.cb", this._timerCb.bind(this));
            _core.async.addRepeatTask("anime.cb", [], 0); // 此處周期應考慮加個sync update
        }
        #_nextAnimationId_accessor_storage = __runInitializers(this, __nextAnimationId_initializers, 1);
        get _nextAnimationId() { return this.#_nextAnimationId_accessor_storage; } // self-increment
        set _nextAnimationId(value) { this.#_nextAnimationId_accessor_storage = value; }
        #_animationMap_accessor_storage = (__runInitializers(this, __nextAnimationId_extraInitializers), __runInitializers(this, __animationMap_initializers, {}));
        get _animationMap() { return this.#_animationMap_accessor_storage; }
        set _animationMap(value) { this.#_animationMap_accessor_storage = value; }
        _timeSensor = (__runInitializers(this, __animationMap_extraInitializers), new Time());
        _lastCbUtc = this._timeSensor.getTime();
        applyAnimation({ profile, targetView, options, }) {
            const id = this._nextAnimationId++;
            let animation = new Animation(profile, {
                initProps: targetView.prop ?? {},
                wrappers: options?.customWrappers,
            });
            if (!targetView.id)
                throw "targetView.id must be not null";
            this._animationMap[id] = {
                destroyOnEnd: options?.destroyOnEnd ?? false,
                isSave: options?.isSave ?? true,
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
        _nextTempAnimationId = -1; // self-decrement
        _tempAnimationMap = {};
        createTempAnimation({ profile, onFrame, onEnd, initProps, wrappers, }) {
            let id = this._nextTempAnimationId--;
            let animation = new Animation(profile, {
                initProps,
                wrappers,
            });
            animation.onFrame = onFrame ?? null;
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
    };
})();
export { AnimationPlugin };

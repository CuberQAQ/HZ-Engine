"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.UI = void 0;
const decorator_1 = require("../storage/decorator");
/// <reference path="node_modules/@zeppos/device-types/dist/index.d.ts" />
const hmUI = __importStar(require("@zos/ui"));
let UI = (() => {
    var _a, _UI__layerList_accessor_storage, _UI__nextViewId_accessor_storage, _UI__viewMap_accessor_storage, _UI__routerMap_accessor_storage;
    let __layerList_decorators;
    let __layerList_initializers = [];
    let __layerList_extraInitializers = [];
    let __nextViewId_decorators;
    let __nextViewId_initializers = [];
    let __nextViewId_extraInitializers = [];
    let __viewMap_decorators;
    let __viewMap_initializers = [];
    let __viewMap_extraInitializers = [];
    let __routerMap_decorators;
    let __routerMap_initializers = [];
    let __routerMap_extraInitializers = [];
    return _a = class UI {
            constructor(_core) {
                this._core = _core;
                _UI__layerList_accessor_storage.set(this, __runInitializers(this, __layerList_initializers, new Map()));
                // View Class
                this._viewClassMap = (__runInitializers(this, __layerList_extraInitializers), new Map());
                _UI__nextViewId_accessor_storage.set(this, __runInitializers(this, __nextViewId_initializers, 50));
                _UI__viewMap_accessor_storage.set(this, (__runInitializers(this, __nextViewId_extraInitializers), __runInitializers(this, __viewMap_initializers, new Map())));
                _UI__routerMap_accessor_storage.set(this, (__runInitializers(this, __viewMap_extraInitializers), __runInitializers(this, __routerMap_initializers, new Map())));
                __runInitializers(this, __routerMap_extraInitializers);
                this._core = _core;
                this._initUI();
            }
            _initUI() {
                this.addLayer("bg", 1);
                this.addLayer("fg", 2);
                this.addLayer("ct", 3);
                this.addLayer("overlay", 4);
                this.addRouter("page", "overlay", false);
            }
            _cleanUI() {
                for (let [key, value] of this.layerList) {
                    value.destroy();
                }
                this.layerList.clear();
                this._routerMap.clear();
            }
            resetUI() {
                this._cleanUI();
                this._initUI();
            }
            // Layer
            get _layerList() { return __classPrivateFieldGet(this, _UI__layerList_accessor_storage, "f"); }
            set _layerList(value) { __classPrivateFieldSet(this, _UI__layerList_accessor_storage, value, "f"); }
            get layerList() {
                return this._layerList;
            }
            addLayer(name, z_index) {
                this._core.emit("beforeAddLayer", name, z_index);
                if (this._layerList.has(name))
                    throw `Layer ${name} already exist`;
                let newLayer = new _a.Layer(name, z_index);
                this._layerList.set(name, newLayer);
                this._core.emit("afterAddLayer", newLayer);
            }
            getLayer(name) {
                return this.layerList.get(name);
            }
            // _activeViewList: [name: string, layer: string, instance: UI.View<unknown>][] =
            //   [];
            registerView(name, cls) {
                this._viewClassMap.set(name, cls);
            }
            // View
            get _nextViewId() { return __classPrivateFieldGet(this, _UI__nextViewId_accessor_storage, "f"); }
            set _nextViewId(value) { __classPrivateFieldSet(this, _UI__nextViewId_accessor_storage, value, "f"); }
            get _viewMap() { return __classPrivateFieldGet(this, _UI__viewMap_accessor_storage, "f"); }
            set _viewMap(value) { __classPrivateFieldSet(this, _UI__viewMap_accessor_storage, value, "f"); }
            getView(id) {
                var _b;
                return (_b = this._viewMap.get(id)) !== null && _b !== void 0 ? _b : null;
            }
            createView(name, layer, prop, isSave) {
                let id = this._nextViewId++;
                let viewInstance = this._produceViewWithId(name, layer, prop, id);
                viewInstance.isSave = isSave;
                this._viewMap.set(id, viewInstance);
                return viewInstance;
            }
            updateView(viewInstance, new_prop) {
                viewInstance.commit(new_prop);
            }
            destroyView(viewInstance) {
                if (viewInstance.id != null)
                    this._viewMap.delete(viewInstance.id);
                viewInstance.destroy();
            }
            /**由調用者提供id，創建一個View，不會處理isSave，也不會更新viewMap */
            _produceViewWithId(name, layer, prop, id) {
                if (!this._viewClassMap.get(name)) {
                    throw "要创建的View不存在";
                }
                let _ViewFactory = this._viewClassMap.get(name);
                let viewInstance = new _ViewFactory(layer, this._core);
                viewInstance.id = id;
                viewInstance.name = name;
                viewInstance.create(prop);
                return viewInstance;
            }
            get _routerMap() { return __classPrivateFieldGet(this, _UI__routerMap_accessor_storage, "f"); }
            set _routerMap(value) { __classPrivateFieldSet(this, _UI__routerMap_accessor_storage, value, "f"); }
            getRouter(tag) {
                return this._routerMap.get(tag);
            }
            addRouter(tag, layer, isSave = true) {
                if (this._routerMap.has(tag))
                    throw `Route with tag [${tag}] already exist!`;
                let router = new _a.Router(this, tag, layer, isSave);
                this._routerMap.set(tag, router);
                return router;
            }
        },
        _UI__layerList_accessor_storage = new WeakMap(),
        _UI__nextViewId_accessor_storage = new WeakMap(),
        _UI__viewMap_accessor_storage = new WeakMap(),
        _UI__routerMap_accessor_storage = new WeakMap(),
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __layerList_decorators = [(0, decorator_1.ArchiveStateAccessorWithSerializer)("ui.layerList", function serializer(layerList) {
                    let obj = {};
                    for (let [key, value] of this.layerList) {
                        obj[key] = [value.name, value.z_index];
                    }
                    return obj;
                }, function deserializer(obj) {
                    // destroy old layer
                    for (let [key, value] of this.layerList) {
                        value.destroy();
                    }
                    this.layerList.clear();
                    let newLayerList = new Map();
                    // create new layer
                    for (let key in obj) {
                        let newLayer = new UI.Layer(obj[key][0], obj[key][1]);
                        newLayerList.set(key, newLayer);
                        this._core.emit("afterAddLayer", newLayer);
                    }
                    return newLayerList;
                })];
            __nextViewId_decorators = [(0, decorator_1.ArchiveStateAccessor)("ui.nextViewId")];
            __viewMap_decorators = [(0, decorator_1.ArchiveStateAccessorWithSerializer)("ui.viewMap", function serializer(viewMap) {
                    let obj = {};
                    for (let [id, view] of viewMap) {
                        // 注意viewMap中的id是number，而obj中的id會自動轉成string
                        if (view.isSave)
                            obj[id] = view.serialize();
                    }
                    return obj;
                }, function deserializer(obj) {
                    let newViewMap = new Map();
                    for (let key in obj) {
                        let item = obj[key];
                        let view = this._produceViewWithId(item.name, item.layer, item.prop, Number(key));
                        view.isSave = true;
                        newViewMap.set(Number(key), view);
                    }
                    return newViewMap;
                })];
            __routerMap_decorators = [(0, decorator_1.ArchiveStateAccessorWithSerializer)("ui.routerMap", function serializer(routerMap) {
                    let obj = {};
                    for (let [key, value] of routerMap) {
                        if (!value.isSave)
                            continue;
                        obj[key] = value.serialize();
                    }
                    return obj;
                }, function deserializer(obj) {
                    let newRouterMap = new Map();
                    // reshow not save router
                    for (let [name, router] of this._routerMap) {
                        if (!router.isSave) {
                            if (router.length > 0) {
                                // TODO 因爲讀檔的時候會重置整個ui系統，所以要重新創建activeViewInstance  這裏感覺有點問題
                                router.activeViewInstance = this._core.ui.createView(router.viewStack[0][0], router.layer, router.viewStack[0][1], router.isSave);
                            }
                            newRouterMap.set(name, router);
                        }
                    }
                    // reshow save router
                    for (let key in obj) {
                        newRouterMap.set(key, UI.Router.deserialize(this, obj[key]));
                    }
                    return newRouterMap;
                })];
            __esDecorate(_a, null, __layerList_decorators, { kind: "accessor", name: "_layerList", static: false, private: false, access: { has: obj => "_layerList" in obj, get: obj => obj._layerList, set: (obj, value) => { obj._layerList = value; } }, metadata: _metadata }, __layerList_initializers, __layerList_extraInitializers);
            __esDecorate(_a, null, __nextViewId_decorators, { kind: "accessor", name: "_nextViewId", static: false, private: false, access: { has: obj => "_nextViewId" in obj, get: obj => obj._nextViewId, set: (obj, value) => { obj._nextViewId = value; } }, metadata: _metadata }, __nextViewId_initializers, __nextViewId_extraInitializers);
            __esDecorate(_a, null, __viewMap_decorators, { kind: "accessor", name: "_viewMap", static: false, private: false, access: { has: obj => "_viewMap" in obj, get: obj => obj._viewMap, set: (obj, value) => { obj._viewMap = value; } }, metadata: _metadata }, __viewMap_initializers, __viewMap_extraInitializers);
            __esDecorate(_a, null, __routerMap_decorators, { kind: "accessor", name: "_routerMap", static: false, private: false, access: { has: obj => "_routerMap" in obj, get: obj => obj._routerMap, set: (obj, value) => { obj._routerMap = value; } }, metadata: _metadata }, __routerMap_initializers, __routerMap_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UI = UI;
(function (UI) {
    class View {
        get prop() {
            return this._prop;
        }
        set prop(prop) {
            this._prop = prop;
        }
        constructor(layer, core) {
            this.layer = layer;
            this.core = core;
            this.id = null;
            this.name = null;
            this.isSave = true;
            this._prop = null;
        }
        create(prop) {
            this.prop = prop;
            this.onCreate(prop);
        }
        commit(prop) {
            this.prop = prop;
            this.onCommit(prop);
        }
        destroy() {
            this.onDestroy();
            this.prop = null;
            this.id = null;
        }
        serialize() {
            if (this.name == null)
                throw new Error("View name is null when serialize");
            return {
                name: this.name,
                layer: this.layer,
                prop: this.prop,
            };
        }
    }
    UI.View = View;
    class MessageView extends View {
    }
    UI.MessageView = MessageView;
    class MenuView extends View {
    }
    UI.MenuView = MenuView;
    class FgImgView extends View {
    }
    UI.FgImgView = FgImgView;
    class BgImgView extends View {
    }
    UI.BgImgView = BgImgView;
    class Layer {
        constructor(name, z_index) {
            this.name = name;
            this.z_index = z_index;
            this.widgetFactory = hmUI.createWidget(hmUI.widget.VIEW_CONTAINER, {
                scroll_enable: 0,
                z_index,
            });
        }
        destroy() {
            hmUI.deleteWidget(this.widgetFactory);
        }
    }
    UI.Layer = Layer;
    class Router {
        constructor(_ui, tag, layer, isSave = true) {
            this._ui = _ui;
            this.tag = tag;
            this.layer = layer;
            this.isSave = isSave;
            this.viewStack = [];
            this.activeViewInstance = null;
        }
        serialize() {
            var _a, _b;
            return {
                tag: this.tag,
                layer: this.layer,
                isSave: this.isSave,
                viewStack: this.viewStack,
                activeViewId: (_b = (_a = this.activeViewInstance) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
            };
        }
        static deserialize(ui, data) {
            let router = new Router(ui, data.tag, data.layer, data.isSave);
            router.viewStack = data.viewStack;
            if (data.activeViewId != null) {
                let viewInstance = ui.getView(data.activeViewId);
                if (!viewInstance)
                    throw `View [${data.activeViewId}] not found when deserialize`;
                router.activeViewInstance = viewInstance;
            }
            return router;
        }
        get length() {
            return this.viewStack.length;
        }
        push(view_name, prop, strategy) {
            var _a, _b;
            if (this.activeViewInstance) {
                // this._ui.destroyView(this.activeViewInstance);
                ((_a = strategy === null || strategy === void 0 ? void 0 : strategy.destroy) !== null && _a !== void 0 ? _a : Router.defaultRouteStrategy.destroy)(this.activeViewInstance, this._ui);
                this.activeViewInstance = null;
            }
            let layerInstance = this._ui.getLayer(this.layer);
            if (!layerInstance)
                throw `Layer [${this.layer}] not found`;
            this.activeViewInstance = ((_b = strategy === null || strategy === void 0 ? void 0 : strategy.create) !== null && _b !== void 0 ? _b : Router.defaultRouteStrategy.create)(view_name, this.layer, prop, this._ui, this.isSave);
            this.viewStack.push([view_name, prop]);
        }
        pop(back_prop, strategy) {
            var _a, _b;
            if (this.activeViewInstance) {
                // this._ui.destroyView(this.activeViewInstance);
                ((_a = strategy === null || strategy === void 0 ? void 0 : strategy.destroy) !== null && _a !== void 0 ? _a : Router.defaultRouteStrategy.destroy)(this.activeViewInstance, this._ui);
                this.activeViewInstance = null;
            }
            this.viewStack.pop();
            if (this.viewStack.length) {
                let backViewInfo = this.viewStack[this.viewStack.length - 1];
                let layerInstance = this._ui.getLayer(this.layer);
                if (!layerInstance)
                    throw `Layer [${this.layer}] not found`;
                this.activeViewInstance = ((_b = strategy === null || strategy === void 0 ? void 0 : strategy.create) !== null && _b !== void 0 ? _b : Router.defaultRouteStrategy.create)(backViewInfo[0], this.layer, back_prop !== null && back_prop !== void 0 ? back_prop : backViewInfo[1], this._ui, this.isSave);
            }
        }
        replace(view_name, prop, strategy) {
            var _a, _b;
            if (this.activeViewInstance) {
                // this._ui.destroyView(this.activeViewInstance);
                ((_a = strategy === null || strategy === void 0 ? void 0 : strategy.destroy) !== null && _a !== void 0 ? _a : Router.defaultRouteStrategy.destroy)(this.activeViewInstance, this._ui);
                this.activeViewInstance = null;
            }
            this.viewStack.pop();
            let layerInstance = this._ui.getLayer(this.layer);
            if (!layerInstance)
                throw `Layer [${this.layer}] not found`;
            this.activeViewInstance = ((_b = strategy === null || strategy === void 0 ? void 0 : strategy.create) !== null && _b !== void 0 ? _b : Router.defaultRouteStrategy.create)(view_name, this.layer, prop, this._ui, this.isSave);
            this.viewStack.push([view_name, prop]);
        }
        update(prop, strategy) {
            var _a;
            if (!this.activeViewInstance)
                throw `Update View but activeViewInstance is null`;
            this.viewStack[this.viewStack.length - 1][1] = prop;
            ((_a = strategy === null || strategy === void 0 ? void 0 : strategy.update) !== null && _a !== void 0 ? _a : Router.defaultRouteStrategy.update)(this.activeViewInstance, prop, this._ui);
        }
        clear(strategy) {
            var _a;
            if (this.activeViewInstance) {
                ((_a = strategy === null || strategy === void 0 ? void 0 : strategy.destroy) !== null && _a !== void 0 ? _a : Router.defaultRouteStrategy.destroy)(this.activeViewInstance, this._ui);
                this.activeViewInstance = null;
            }
            this.viewStack = [];
        }
    }
    Router.defaultRouteStrategy = {
        destroy(viewInstance, ui) {
            ui.destroyView(viewInstance);
        },
        create(viewName, layer, prop, ui, isSave) {
            return ui.createView(viewName, layer, prop, isSave);
        },
        update(viewInstance, prop, ui) {
            ui.updateView(viewInstance, prop);
        },
    };
    UI.Router = Router;
})(UI || (exports.UI = UI = {}));

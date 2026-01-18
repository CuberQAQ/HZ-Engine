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
import { Save, CustomSave } from "../storage/decorator.js";
// / <reference path="node_modules/@zeppos/device-types/dist/index.d.ts" />
// import * as hmUI from "@zos/ui";
// import {} from "@zos/ui";
// import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
// const { width, height, screenShape } = getDeviceInfo();
let UI = (() => {
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
    return class UI {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __layerList_decorators = [CustomSave("ui.layerList", function serializer(layerList) {
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
                        let newLayer = new UI.Layer(this._core, obj[key][0], obj[key][1]);
                        newLayerList.set(key, newLayer);
                        this._core.emit("afterAddLayer", newLayer);
                    }
                    return newLayerList;
                })];
            __nextViewId_decorators = [Save("ui.nextViewId")];
            __viewMap_decorators = [CustomSave("ui.viewMap", function serializer(viewMap) {
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
            __routerMap_decorators = [CustomSave("ui.routerMap", function serializer(routerMap) {
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
            __esDecorate(this, null, __layerList_decorators, { kind: "accessor", name: "_layerList", static: false, private: false, access: { has: obj => "_layerList" in obj, get: obj => obj._layerList, set: (obj, value) => { obj._layerList = value; } }, metadata: _metadata }, __layerList_initializers, __layerList_extraInitializers);
            __esDecorate(this, null, __nextViewId_decorators, { kind: "accessor", name: "_nextViewId", static: false, private: false, access: { has: obj => "_nextViewId" in obj, get: obj => obj._nextViewId, set: (obj, value) => { obj._nextViewId = value; } }, metadata: _metadata }, __nextViewId_initializers, __nextViewId_extraInitializers);
            __esDecorate(this, null, __viewMap_decorators, { kind: "accessor", name: "_viewMap", static: false, private: false, access: { has: obj => "_viewMap" in obj, get: obj => obj._viewMap, set: (obj, value) => { obj._viewMap = value; } }, metadata: _metadata }, __viewMap_initializers, __viewMap_extraInitializers);
            __esDecorate(this, null, __routerMap_decorators, { kind: "accessor", name: "_routerMap", static: false, private: false, access: { has: obj => "_routerMap" in obj, get: obj => obj._routerMap, set: (obj, value) => { obj._routerMap = value; } }, metadata: _metadata }, __routerMap_initializers, __routerMap_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _core;
        constructor(_core) {
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
        #_layerList_accessor_storage = __runInitializers(this, __layerList_initializers, new Map());
        // Layer
        get _layerList() { return this.#_layerList_accessor_storage; }
        set _layerList(value) { this.#_layerList_accessor_storage = value; }
        get layerList() {
            return this._layerList;
        }
        addLayer(name, z_index) {
            this._core.emit("beforeAddLayer", name, z_index);
            if (this._layerList.has(name))
                throw `Layer ${name} already exist`;
            let newLayer = new UI.Layer(this._core, name, z_index);
            this._layerList.set(name, newLayer);
            this._core.emit("afterAddLayer", newLayer);
        }
        getLayer(name) {
            return this.layerList.get(name);
        }
        // View Class
        _viewClassMap = (__runInitializers(this, __layerList_extraInitializers), new Map());
        // _activeViewList: [name: string, layer: string, instance: UI.View<unknown>][] =
        //   [];
        registerView(name, cls) {
            this._viewClassMap.set(name, cls);
        }
        #_nextViewId_accessor_storage = __runInitializers(this, __nextViewId_initializers, 50);
        // View
        get _nextViewId() { return this.#_nextViewId_accessor_storage; }
        set _nextViewId(value) { this.#_nextViewId_accessor_storage = value; }
        #_viewMap_accessor_storage = (__runInitializers(this, __nextViewId_extraInitializers), __runInitializers(this, __viewMap_initializers, new Map()));
        get _viewMap() { return this.#_viewMap_accessor_storage; }
        set _viewMap(value) { this.#_viewMap_accessor_storage = value; }
        getView(id) {
            return this._viewMap.get(id) ?? null;
        }
        createView(name, layer, prop, isSave) {
            let id = this._nextViewId++;
            let viewInstance = this._produceViewWithId(name, layer, prop, id);
            this._core.debug.log(`creating view ${viewInstance.name}`);
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
            this._core.debug.log(`producing view ${viewInstance.name}`);
            return viewInstance;
        }
        #_routerMap_accessor_storage = (__runInitializers(this, __viewMap_extraInitializers), __runInitializers(this, __routerMap_initializers, new Map()));
        get _routerMap() { return this.#_routerMap_accessor_storage; }
        set _routerMap(value) { this.#_routerMap_accessor_storage = value; }
        getRouter(tag) {
            return this._routerMap.get(tag);
        }
        addRouter(tag, layer, isSave = true) {
            if (this._routerMap.has(tag))
                throw `Route with tag [${tag}] already exist!`;
            let router = new UI.Router(this, tag, layer, isSave);
            this._routerMap.set(tag, router);
            return router;
        }
        getScreenSize() {
            let [width, height] = this._core.platform.getScreenSize();
            return { width, height };
        }
        /**
         * 根据 BasicUniversalProp 计算屏幕上的位置
         * @param prop 包含 BasicUniversalProp 的 prop
         * @param size (可选)图像的尺寸，若不指定，返回的anchor坐标和origin坐标一样
         * @returns
         */
        calcPosition(prop, size) {
            let { width, height } = this.getScreenSize();
            // 1. 确定 anchor
            // 2. 通过 align 确定初始位置
            // 3. offset
            // 返回左上角的位置
            let anchor_coord = {
                x: (width * ((prop.xalign ?? 0) + 1)) / 2 + // 根据 align 求出 anchor 位置
                    (prop.xoffset ?? 0), // offset
                y: (height * ((prop.yalign ?? 0) + 1)) / 2 + // 根据 align 求出 anchor 位置
                    (prop.yoffset ?? 0), // offset
            };
            let origin_coord = {
                x: anchor_coord.x - (((prop.xanchor ?? 0) + 1) / 2) * (size?.width ?? 0),
                y: anchor_coord.y - (((prop.yanchor ?? 0) + 1) / 2) * (size?.height ?? 0),
            };
            return {
                anchor: anchor_coord,
                origin: origin_coord,
            };
        }
    };
})();
export { UI };
(function (UI) {
    class View {
        layer;
        core;
        id = null;
        name = null;
        isSave = true;
        _prop = null;
        get prop() {
            return this._prop;
        }
        set prop(prop) {
            this._prop = prop;
        }
        constructor(layer, core) {
            this.layer = layer;
            this.core = core;
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
        _core;
        name;
        z_index;
        widgetFactory;
        constructor(_core, name, z_index) {
            this._core = _core;
            this.name = name;
            this.z_index = z_index;
            // this.widgetFactory = hmUI.createWidget(
            //   (hmUI.widget as any).VIEW_CONTAINER,
            //   {
            //     scroll_enable: 0,
            //     z_index,
            //   }
            // ) as unknown as Layer.WidgetFactory;
            this.widgetFactory = _core.platform.createUILayer({
                z_index,
            });
        }
        destroy() {
            // hmUI.deleteWidget(this.widgetFactory as any);
            this._core.platform.deleteUILayer(this.widgetFactory);
        }
    }
    UI.Layer = Layer;
    class Router {
        _ui;
        tag;
        layer;
        isSave;
        constructor(_ui, tag, layer, isSave = true) {
            this._ui = _ui;
            this.tag = tag;
            this.layer = layer;
            this.isSave = isSave;
        }
        serialize() {
            return {
                tag: this.tag,
                layer: this.layer,
                isSave: this.isSave,
                viewStack: this.viewStack,
                activeViewId: this.activeViewInstance?.id ?? null,
            };
        }
        defaultRouteStrategy = {
            destroy: (viewInstance, ui) => {
                this._ui._core.debug.log(`destroy view ${viewInstance.name}`);
                ui.destroyView(viewInstance);
            },
            create: (viewName, layer, prop, ui, isSave) => {
                this._ui._core.debug.log(`create view ${viewName}`);
                return ui.createView(viewName, layer, prop, isSave);
            },
            update: (viewInstance, prop, ui) => {
                this._ui._core.debug.log(`update view ${viewInstance.name}`);
                ui.updateView(viewInstance, prop);
            },
        };
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
        viewStack = [];
        get length() {
            return this.viewStack.length;
        }
        activeViewInstance = null;
        push(view_name, prop, strategy) {
            if (this.activeViewInstance) {
                // this._ui.destroyView(this.activeViewInstance);
                // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
                //   this.activeViewInstance,
                //   this._ui
                // );
                if (strategy?.destroy) {
                    strategy.destroy(this.activeViewInstance, this._ui);
                }
                else {
                    this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
                }
                this.activeViewInstance = null;
            }
            let layerInstance = this._ui.getLayer(this.layer);
            if (!layerInstance)
                throw `Layer [${this.layer}] not found`;
            // this.activeViewInstance = (
            //   strategy?.create ?? this.defaultRouteStrategy.create!
            // )(view_name, this.layer, prop, this._ui, this.isSave);
            if (strategy?.create) {
                this.activeViewInstance = strategy.create(view_name, this.layer, prop, this._ui, this.isSave);
            }
            else {
                this.activeViewInstance = this.defaultRouteStrategy.create(view_name, this.layer, prop, this._ui, this.isSave);
            }
            this.viewStack.push([view_name, prop]);
        }
        pop(back_prop, strategy) {
            if (this.activeViewInstance) {
                // this._ui.destroyView(this.activeViewInstance);
                // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
                //   this.activeViewInstance,
                //   this._ui
                // );
                if (strategy?.destroy) {
                    strategy.destroy(this.activeViewInstance, this._ui);
                }
                else {
                    this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
                }
                this.activeViewInstance = null;
            }
            this.viewStack.pop();
            if (this.viewStack.length) {
                let backViewInfo = this.viewStack[this.viewStack.length - 1];
                let layerInstance = this._ui.getLayer(this.layer);
                if (!layerInstance)
                    throw `Layer [${this.layer}] not found`;
                // this.activeViewInstance = (
                //   strategy?.create ?? this.defaultRouteStrategy.create!
                // )(
                //   backViewInfo[0],
                //   this.layer,
                //   back_prop ?? backViewInfo[1],
                //   this._ui,
                //   this.isSave
                // );
                if (strategy?.create) {
                    this.activeViewInstance = strategy.create(backViewInfo[0], this.layer, back_prop ?? backViewInfo[1], this._ui, this.isSave);
                }
                else {
                    this.activeViewInstance = this.defaultRouteStrategy.create(backViewInfo[0], this.layer, back_prop ?? backViewInfo[1], this._ui, this.isSave);
                }
            }
        }
        replace(view_name, prop, strategy) {
            if (this.activeViewInstance) {
                // this._ui.destroyView(this.activeViewInstance);
                // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
                //   this.activeViewInstance,
                //   this._ui
                // );
                if (strategy?.destroy) {
                    strategy.destroy(this.activeViewInstance, this._ui);
                }
                else {
                    this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
                }
                this.activeViewInstance = null;
            }
            this.viewStack.pop();
            let layerInstance = this._ui.getLayer(this.layer);
            if (!layerInstance)
                throw `Layer [${this.layer}] not found`;
            // this.activeViewInstance = (
            //   strategy?.create ?? this.defaultRouteStrategy.create!
            // )(view_name, this.layer, prop, this._ui, this.isSave);
            if (strategy?.create) {
                this.activeViewInstance = strategy.create(view_name, this.layer, prop, this._ui, this.isSave);
            }
            else {
                this.activeViewInstance = this.defaultRouteStrategy.create(view_name, this.layer, prop, this._ui, this.isSave);
            }
            this.viewStack.push([view_name, prop]);
        }
        update(prop, strategy) {
            if (!this.activeViewInstance)
                throw `Update View but activeViewInstance is null`;
            this.viewStack[this.viewStack.length - 1][1] = prop;
            // (strategy?.update ?? this.defaultRouteStrategy.update!)(
            //   this.activeViewInstance,
            //   prop,
            //   this._ui
            // );
            if (strategy?.update) {
                strategy.update(this.activeViewInstance, prop, this._ui);
            }
            else {
                this.defaultRouteStrategy.update(this.activeViewInstance, prop, this._ui);
            }
        }
        clear(strategy) {
            if (this.activeViewInstance) {
                // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
                //   this.activeViewInstance,
                //   this._ui
                // );
                if (strategy?.destroy) {
                    strategy.destroy(this.activeViewInstance, this._ui);
                }
                else {
                    this.defaultRouteStrategy.destroy(this.activeViewInstance, this._ui);
                }
                this.activeViewInstance = null;
            }
            this.viewStack = [];
        }
    }
    UI.Router = Router;
})(UI || (UI = {}));

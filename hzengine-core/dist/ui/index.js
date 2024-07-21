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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI = void 0;
/// <reference path="node_modules/@zeppos/device-types/dist/index.d.ts" />
const hmUI = __importStar(require("@zos/ui"));
class UI {
    constructor(_core) {
        this._core = _core;
        // Layer
        this._layerList = new Map();
        // View
        this._viewClassMap = new Map();
        // Tag & Route
        this._routerMap = new Map();
        this.addLayer("bg", 1);
        this.addLayer("fg", 3);
        this.addLayer("ct", 5);
        this.addLayer("overlay", 7);
    }
    get layerList() {
        return this._layerList;
    }
    addLayer(name, z_index) {
        if (this._layerList.has(name))
            throw `Layer ${name} already exist`;
        this._layerList.set(name, new UI.Layer(name, z_index));
    }
    getLayer(name) {
        return this.layerList.get(name);
    }
    // _activeViewList: [name: string, layer: string, instance: UI.View<unknown>][] =
    //   [];
    registerView(name, cls) {
        this._viewClassMap.set(name, cls);
    }
    createView(name, layer, prop) {
        if (!this._viewClassMap.get(name)) {
            throw "要创建的View不存在";
        }
        let _ViewFactory = this._viewClassMap.get(name);
        let viewInstance = new _ViewFactory(layer, this._core);
        viewInstance.onCreate(prop);
        // this._activeViewList.push([name, layer, viewInstance]);
        return viewInstance;
    }
    updateView(viewInstance, new_prop) {
        viewInstance.onCommit(new_prop);
    }
    destroyView(viewInstance) {
        viewInstance.onDestroy();
    }
    getRouter(tag) {
        return this._routerMap.get(tag);
    }
    addRouter(tag, layer) {
        if (this._routerMap.has(tag))
            throw `Route with tag [${tag}] already exist!`;
        this._routerMap.set(tag, new UI.Router(this, tag, layer));
    }
}
exports.UI = UI;
(function (UI) {
    class View {
        constructor(layer, core) {
            this.layer = layer;
            this.core = core;
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
    }
    UI.Layer = Layer;
    class Router {
        constructor(_ui, tag, layer) {
            this._ui = _ui;
            this.tag = tag;
            this.layer = layer;
            this.viewStack = [];
            this.activeViewInstance = null;
        }
        get length() {
            return this.viewStack.length;
        }
        push(view_name, prop) {
            let layerInstance = this._ui.getLayer(this.layer);
            if (!layerInstance)
                throw `Layer [${this.layer}] not found`;
            this.activeViewInstance = this._ui.createView(view_name, this.layer, prop);
            this.viewStack.push([view_name, prop]);
        }
        pop(back_prop) {
            if (this.activeViewInstance) {
                this._ui.destroyView(this.activeViewInstance);
                this.activeViewInstance = null;
            }
            this.viewStack.pop();
            if (this.viewStack.length) {
                let backViewInfo = this.viewStack[this.viewStack.length - 1];
                let layerInstance = this._ui.getLayer(this.layer);
                if (!layerInstance)
                    throw `Layer [${this.layer}] not found`;
                this.activeViewInstance = this._ui.createView(backViewInfo[0], this.layer, back_prop !== null && back_prop !== void 0 ? back_prop : backViewInfo[1]);
            }
        }
        replace(view_name, prop) {
            if (this.activeViewInstance) {
                this._ui.destroyView(this.activeViewInstance);
                this.activeViewInstance = null;
            }
            this.viewStack.pop();
            let layerInstance = this._ui.getLayer(this.layer);
            if (!layerInstance)
                throw `Layer [${this.layer}] not found`;
            this.activeViewInstance = this._ui.createView(view_name, this.layer, prop);
            this.viewStack.push([view_name, prop]);
        }
        update(prop) {
            if (!this.activeViewInstance)
                throw `Update View but activeViewInstance is null`;
            this._ui.updateView(this.activeViewInstance, prop);
        }
        clear() {
            if (this.activeViewInstance) {
                this._ui.destroyView(this.activeViewInstance);
            }
            this.viewStack = [];
        }
    }
    UI.Router = Router;
})(UI || (exports.UI = UI = {}));

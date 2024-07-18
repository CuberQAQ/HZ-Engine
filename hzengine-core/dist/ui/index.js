"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI = void 0;
class UI {
    constructor(_core) {
        this._core = _core;
        this._layerList = new Map();
        this._viewClassMap = new Map();
        this._activeViewList = [];
    }
    get layerList() {
        return this._layerList;
    }
    addLayer(name) { }
    getLayer(name) {
        return this.layerList.get(name);
    }
    registerView(name, cls) {
        this._viewClassMap.set(name, cls);
    }
    createView(name, layer, prop) {
        if (!this._viewClassMap.get(name)) {
            throw "要创建的View不存在";
        }
        let _ViewFactory = this._viewClassMap.get(name);
        let viewInstance = new _ViewFactory();
        viewInstance.onCreate(prop, layer, this._core);
        this._activeViewList.push([name, layer, viewInstance]);
    }
}
exports.UI = UI;
(function (UI) {
    class View {
    }
    UI.View = View;
    class MessageView extends View {
    }
    UI.MessageView = MessageView;
    class ChoiceView extends View {
    }
    UI.ChoiceView = ChoiceView;
    class FgImgView extends View {
    }
    UI.FgImgView = FgImgView;
    class BgImgView extends View {
    }
    UI.BgImgView = BgImgView;
    class Layer {
    }
    UI.Layer = Layer;
})(UI || (exports.UI = UI = {}));

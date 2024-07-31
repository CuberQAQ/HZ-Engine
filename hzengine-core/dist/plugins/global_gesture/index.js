"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.global_gesture = global_gesture;
const ui_1 = __importDefault(require("@zos/ui"));
const system_1 = require("../../system");
function global_gesture(core) {
    function addTouchPad(layerInstance) {
        let touchPad = layerInstance.widgetFactory.createWidget(ui_1.default.widget.TEXT, {
            x: 0,
            y: 0,
            w: 600,
            h: 600,
            text: "",
        });
        touchPad.addEventListener(ui_1.default.event.SELECT, (info) => {
            console.log("按下了屏幕");
            if (core.system.condition === system_1.System.Condition.Pause) {
                core.system.continue();
            }
        });
    }
    addTouchPad(core.ui.getLayer("ct"));
    core.on("afterAddLayer", (layerInstance) => {
        if (layerInstance.name !== "ct")
            return;
        addTouchPad(layerInstance);
    });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.global_gesture = void 0;
const ui_1 = __importDefault(require("@zos/ui"));
const system_1 = require("../../system");
function global_gesture(core) {
    let touchPad = core.ui.getLayer("ct").widgetFactory.createWidget(ui_1.default.widget.TEXT, {
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
exports.global_gesture = global_gesture;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animation = animation;
function animation(core) {
    core.on("afterAddLayer", (layerInstance) => {
        if (layerInstance.name !== "ct")
            return;
        addTouchPad(layerInstance);
    });
}

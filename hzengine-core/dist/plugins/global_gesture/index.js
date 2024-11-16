export function global_gesture(core) {
    function addTouchPad(layerInstance) {
        // TODO touch pad
        core.debug.log("[TouchPad] Not implemented");
        // let touchPad = layerInstance.widgetFactory.createWidget(hmUI.widget.TEXT, {
        //   x: 0,
        //   y: 0,
        //   w: 600,
        //   h: 600,
        //   text: "",
        // });
        // touchPad.addEventListener(hmUI.event.SELECT, (info: any) => {
        //   console.log("按下了屏幕");
        //   if (core.system.condition === System.Condition.Pause) {
        //     core.system.continue();
        //   }
        // });
    }
    addTouchPad(core.ui.getLayer("ct"));
    core.on("afterAddLayer", (layerInstance) => {
        if (layerInstance.name !== "ct")
            return;
        addTouchPad(layerInstance);
    });
}

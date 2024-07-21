import hmUI from "@zos/ui";
import { HZEngineCore, UI } from "../..";
import { System } from "../../system";

export function global_gesture(core: HZEngineCore) {
  console.log("fuck huami");

  let touchPad = core.ui.getLayer("ct")!.widgetFactory.createWidget(hmUI.widget.TEXT, {
    x: 0,
    y: 0,
    w: 600,
    h: 600,
    text: "",
  });

  touchPad.addEventListener(hmUI.event.SELECT, (info: any) => {
    console.log("ct SELECT event");
    if(core.system.condition === System.Condition.Pause) {
        core.system.continue()
    }
  });
}

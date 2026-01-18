import { getText } from "@zos/i18n";
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device";
import hmUI__default from "@zos/ui";
import hmFS__default from "@zos/fs";
import * as hmRouter from "@zos/router";
import { A as AsukaUI, a as asukauiPlatformZeppos, N as NativeBindingsFactory, L as LayoutManagerFactory, E as EdgeInsets, M as MainAxisAlignment, r as reportError } from "../shared/asukaui-platform-zeppos.chunk.js";
import { P as Profiler } from "../shared/profiler.chunk.js";
import "@zos/utils";
import "@zos/app";
import "@zos/settings";
var designWidth = 480;
const profiler = new Profiler();
profiler.show();
function px(raw) {
  return Math.ceil(raw / designWidth * DEVICE_WIDTH);
}
const {
  width,
  height,
  screenShape
} = getDeviceInfo();
Page({
  build() {
    console.log(`Test IMG: list=${hmFS__default.readdirSync({ path: "data://games/f9c5b194-2f3e-4418-a454-4ab019d78643/image/bg" })} size=${JSON.stringify(hmUI__default.getImageInfo("data://games/f9c5b194-2f3e-4418-a454-4ab019d78643/image/bg/bg cafe.png"))}`);
    try {
      hmUI__default.setStatusBarVisible(false);
      let asuka = new AsukaUI(asukauiPlatformZeppos);
      asuka.registerNodeFactory(NativeBindingsFactory);
      asuka.registerNodeFactory(LayoutManagerFactory);
      let view = asuka.mountView(hmUI__default);
      let outside_padding = asuka.createNode("padding");
      outside_padding.setProperty("padding", EdgeInsets.symmetric({
        horizontal: screenShape === SCREEN_SHAPE_ROUND ? px(40) : px(0)
      }));
      view.mountChild(outside_padding);
      let column_buttons = asuka.createNode("column");
      column_buttons.setProperty("mainAxisAlignment", MainAxisAlignment.center);
      outside_padding.mountChild(column_buttons);
      const createSpacer = () => {
        let spacer = asuka.createNode("space");
        spacer.setProperty("h", px(20));
        column_buttons.mountChild(spacer);
      };
      let button_style = {
        ncolor: 3355443,
        pcolor: 5592405,
        text_size: px(40),
        radius: px(40),
        h: px(80)
      };
      let button_list = asuka.createNode("button");
      button_list.setProperties({
        text: getText("home.button_list.text"),
        ...button_style
      });
      button_list.addEventListener("click", function() {
        hmRouter.push({
          url: getText("urls.project_list")
        });
      });
      column_buttons.mountChild(button_list);
      console.log("page render 1");
      createSpacer();
      let button_transfer = asuka.createNode("button");
      button_transfer.setProperties({
        text: getText("home.button_transfer.text"),
        ...button_style
      });
      button_transfer.addEventListener("click", function() {
        hmRouter.push({
          url: getText("urls.transfer")
        });
      });
      column_buttons.mountChild(button_transfer);
      createSpacer();
      console.log("page render 2");
      asuka.refreshSync();
      console.log("page render done");
    } catch (e) {
      reportError("page error", e);
    }
  },
  onDestroy() {
  }
});

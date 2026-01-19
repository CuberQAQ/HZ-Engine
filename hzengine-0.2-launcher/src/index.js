import { AsukaUI, LayoutManagerFactory, EdgeInsets, MainAxisAlignment, reportError } from '@cuberqaq/asuka-ui';
import { getText } from '@zos/i18n';
import { NativeBindingsFactory } from "@cuberqaq/asuka-ui/zeppos"
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from '@zos/device';
import hmUI from '@zos/ui';
import hmFS from '@zos/fs';
import * as hmRouter from '@zos/router';
import asukauiPlatformZeppos from '../shared/asukaui-platform-zeppos';
var designWidth = 480;
// import { Profiler } from "@silver-zepp/profiler"
// const profiler = new Profiler();
// profiler.show();
const {
  width,
  height,
  screenShape
} = getDeviceInfo();

/**
 * 动态计算尺寸
 * @param {number} raw 
 */
function px(raw) {
  return Math.ceil(raw / designWidth * width);
}
Page({
  build() {


    console.log(`Test IMG: \
list=${hmFS.readdirSync({path:"data://games/f9c5b194-2f3e-4418-a454-4ab019d78643/image/bg"})} \
size=${JSON.stringify(hmUI.getImageInfo("data://games/f9c5b194-2f3e-4418-a454-4ab019d78643/image/bg/bg cafe.png"))}`)

    try {
      // 隐藏方屏设备的顶栏
      hmUI.setStatusBarVisible(false);
      let asuka = new AsukaUI(asukauiPlatformZeppos);
      asuka.registerNodeFactory(NativeBindingsFactory);
      asuka.registerNodeFactory(LayoutManagerFactory);
      let view = asuka.mountView(hmUI);
      // padding (圆形屏幕两边留空)
      let outside_padding = asuka.createNode("padding");
      outside_padding.setProperty("padding", EdgeInsets.symmetric({
        horizontal: screenShape === SCREEN_SHAPE_ROUND ? px(40) : px(0)
      }));
      view.mountChild(outside_padding);

      // column
      let column_buttons = asuka.createNode("column");
      column_buttons.setProperty('mainAxisAlignment', MainAxisAlignment.center);
      outside_padding.mountChild(column_buttons);

      // spacer
      const createSpacer = () => {
        let spacer = asuka.createNode("space");
        spacer.setProperty('h', px(20));
        column_buttons.mountChild(spacer);
      };

      // buttons
      let button_style = {
        ncolor: 0x333333,
        pcolor: 0x555555,
        text_size: px(40),
        radius: px(40),
        h: px(80)
      };

      /** 视觉小说包列表 @type {RenderNode} */
      let button_list = asuka.createNode("button");
      button_list.setProperties({
        text: getText("home.button_list.text"),
        ...button_style
      });
      button_list.addEventListener("click", function () {
        hmRouter.push({
          url: getText("urls.project_list")
        });
      });
      column_buttons.mountChild(button_list);
      console.log("page render 1");
      createSpacer();

      /** 包传输页面 @type {RenderNode} */
      let button_transfer = asuka.createNode("button");
      button_transfer.setProperties({
        text: getText("home.button_transfer.text"),
        ...button_style
      });
      button_transfer.addEventListener("click", function () {
        hmRouter.push({
          url: getText("urls.transfer")
        });
      });
      column_buttons.mountChild(button_transfer);
      // createSpacer();

      // /** 设置 @type {RenderNode} */
      // let button_settings = asuka.createNode("button");
      // button_settings.setProperties({
      //   text: getText("home.button_settings.text"),
      //   ...button_style
      // });
      // button_settings.addEventListener("click", function () {
      //   hmRouter.push({
      //     url: getText("urls.settings")
      //   });
      // });
      // column_buttons.mountChild(button_settings);


      console.log("page render 2");
      asuka.refreshSync();
      console.log("page render done");
    } catch (e) {
      reportError("page error", e);
    }
  },
  onDestroy() {}
});

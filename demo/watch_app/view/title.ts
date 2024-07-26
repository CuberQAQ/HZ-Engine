import * as hmUI from "@zos/ui";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { HZEngineCore, UI } from "hzengine-core";
import { px } from "@zos/utils";
import path from "@cuberqaq/path-polyfill";
import { getText } from "@zos/i18n";
const { width, height, screenShape } = getDeviceInfo();

export class TitleView extends UI.View<TitleViewProp> {
  _widgets: any | null = null;
  _widgetFactory = this.core.ui.getLayer(this.layer)!.widgetFactory;
  onCreate(prop: TitleViewProp): void {
    // title text widget
    {
      let w = width;
      let h = Number(px(60));
      this._widgets = {
        title_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, {
          x: (width - w) / 2,
          y: Number(px(40)),
          w,
          h,
          text_size: px(40),
          color: 0xffffff,
          text: prop.title,
          align_h: hmUI.align.CENTER_H,
          align_v: hmUI.align.CENTER_V,
        }),
      };
    }
    // start game button
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width - w) / 2;
      let y = Number(px(130));
      this._widgets.button_start = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          text: getText("start_game"),
          text_size: px(36),
          normal_color: 0x333333,
          press_color: 0x555555,
          click_func: () => {
            this.core.ui.getRouter("page")!.clear();
            this.core.system.start();
          },
        }
      );
    }
    // load archives button
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width - w) / 2;
      let y = Number(px(210));
      this._widgets.button_load = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          text: getText("continue_game"),
          text_size: px(36),
          normal_color: 0x333333,
          press_color: 0x555555,
          click_func: () => {
            // hmUI.showToast({ text: "施工中..." });
            try {
              this.core.storage.loadArchiveData("archive000.json");
            } catch(e) {
              console.log("請先開始遊戲");
              throw e
            }
            this.core.ui.getRouter("page")!.pop();
          },
        }
      );
    }
    // gallery button
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width - w) / 2;
      let y = Number(px(290));
      this._widgets.button_gallery = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          text: getText("gallery"),
          text_size: px(36),
          normal_color: 0x333333,
          press_color: 0x555555,
          click_func: () => {
            hmUI.showToast({ text: "施工中..." });
            this.core.ui.getRouter("page")!.push("gallery", {});
          },
        }
      );
    }
    // settings button
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width - w) / 2;
      let y = Number(px(370));
      this._widgets.button_settings = this._widgetFactory.createWidget(
        hmUI.widget.BUTTON,
        {
          x,
          y,
          w,
          h,
          text: getText("settings"),
          text_size: px(36),
          normal_color: 0x333333,
          press_color: 0x555555,
          click_func: () => {
            hmUI.showToast({ text: "施工中..." });
            this.core.ui.getRouter("page")!.push("settings", {});
          },
        }
      );
    }
  }
  onCommit(prop: TitleViewProp): void {
    this._widgets.title_text.setProperty(hmUI.prop.TEXT, prop.title);
  }
  onDestroy(): void {
    hmUI.deleteWidget(this._widgets.title_text);
    hmUI.deleteWidget(this._widgets.button_start);
    hmUI.deleteWidget(this._widgets.button_load);
    hmUI.deleteWidget(this._widgets.button_gallery);
    hmUI.deleteWidget(this._widgets.button_settings);
    this._widgets = null;
  }
}

export interface TitleViewProp {
  title: string;
}

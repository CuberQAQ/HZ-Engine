import * as hmUI from "@zos/ui";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { HZEngineCore, UI } from "hzengine-core";
import { px } from "@zos/utils";
import { Fx } from "../../shared/fx.js";
import path from "@cuberqaq/path-polyfill";
const { width, height, screenShape } = getDeviceInfo();

export { CustomSayView as SayView, FgImgView, BgImgView, MenuView };

/**
 * 顯示對話文字的窗口
 */
class CustomSayView extends UI.MessageView {
  _fx: Fx | null = null;
  _widgets: any = null;
  enableAnim = true;
  _widgetFactory = this.core.ui.getLayer(this.layer)!.widgetFactory;
  _what: string | null = null;
  onCreate(prop: UI.Message): void {
    let w = screenShape === SCREEN_SHAPE_SQUARE ? width : width;
    let h = screenShape === SCREEN_SHAPE_SQUARE ? height / 2 : height / 2;
    console.log(`SayView OnCreate who=${prop.who} what=${prop.what}`);
    this._what = prop.what;
    this._widgets = {
      bg: this._widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        x: (width - w) / 2,
        y: height / 2,
        w,
        h,
        color: 0x555555,
        radius: 5,
        alpha: 128,
      }),
      who_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width - w) / 2 + px(10),
        y: height / 2,
        w: w - Number(px(20)),
        h: px(50),
        text_size: px(40),
        color: 0xffffff,
        text: prop.who,
        font: "project/font/normal.ttf",
      }),
      what_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width - w) / 2 + px(10),
        y: height / 2 + Number(px(50)),
        w: w - Number(px(20)),
        h: height - Number(px(50)),
        text_size: px(36),
        color: 0xf2f2f2,
        align_v: hmUI.align.TOP,
        align_h: hmUI.align.CENTER_H,
        text: this.enableAnim ? "" : prop.what,
        text_style: hmUI.text_style.WRAP,
        font: "project/font/normal.ttf",
      }),
    };

    this._widgets.bg.setEnable(false);
    this._widgets.who_text.setEnable(false);
    this._widgets.what_text.setEnable(false);

    this.enableAnim && this._buildAnim();
  }
  onCommit(prop: UI.Message): void {
    if (this._fx) {
      this._fx.setEnable(false);
      this._fx = null;
    }
    this._widgets.who_text.setProperty(hmUI.prop.TEXT, prop.who);
    this._widgets.what_text.setProperty(
      hmUI.prop.TEXT,
      this.enableAnim ? "" : prop.what
    );
    this._what = prop.what;
    this.enableAnim && this._buildAnim();
  }
  onDestroy(): void {
    if (this._fx) this._fx.setEnable(false);
    this._fx = null;
    hmUI.deleteWidget(this._widgets.bg);
    hmUI.deleteWidget(this._widgets.who_text);
    hmUI.deleteWidget(this._widgets.what_text);
  }
  _buildAnim() {
    if (this._fx) this._fx.setEnable(false);
    this._fx = new Fx({
      begin: 0, // Initial value of function. 初始函数值
      end: this._what!.length, // Target value of function. 目标函数值
      fps: 60, // FPS 帧率
      time: this._what!.length * 0.06, // Total during time (s). 总时长(秒)
      style: Fx.Styles.LINEAR, // Types of animation presets used, seeing @Fx.Style. 预设类型 见下面的Fx.Style
      // Callback function for each frame, the parameter is the current function value, the value range is [begin, end]
      // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
      func: (result: number) =>
        this._widgets?.what_text.setProperty(
          hmUI.prop.TEXT,
          this._what?.slice(0, ~~result)
        ),
      //   enable: false,
    } as any);
    // this._fx.restart();
  }
}

/**
 * 展示人物立绘的窗口
 */
class FgImgView extends UI.FgImgView {
  _widget: any = null;
  _widgetFactory = this.core.ui.getLayer(this.layer)!.widgetFactory;
  onCreate(prop: UI.FgImgViewProp): void {
    // TODO
    this._widget = this._widgetFactory.createWidget(hmUI.widget.IMG, {
      x: (width - prop.size.width) / 2 + prop.offset.x,
      y: prop.offset.y,
      src: prop.imgPath,
    });
  }
  onCommit(prop: UI.FgImgViewProp): void {
    this._widget.setProperty(hmUI.prop.MORE, {
      x: (width - prop.size.width) / 2 + prop.offset.x,
      y: prop.offset.y,
      src: prop.imgPath,
    });
  }
  onDestroy(): void {
    hmUI.deleteWidget(this._widget);
    this._widget = null;
  }
}

/**
 * 展示背景的窗口
 */
class BgImgView extends UI.BgImgView {
  _widget: any = null;
  _widgetFactory = this.core.ui.getLayer(this.layer)!.widgetFactory;
  _calSize(size: UI.Size): UI.Size {
    if (size.height >= size.width) {
      let rate = size.height / size.width;
      return {
        width: Number(px(480)),
        height: Number(px(480)) * rate,
      };
    } else {
      let rate = size.width / size.height;
      return {
        width: Number(px(480)) * rate,
        height: Number(px(480)),
      };
    }
  }
  onCreate(prop: UI.FgImgViewProp): void {
    // TODO
    let size = this._calSize(prop.size);
    this._widget = this._widgetFactory.createWidget(hmUI.widget.IMG, {
      x: (width - size.width) / 2 + prop.offset.x,
      y: (height - size.height) / 2 + prop.offset.y,
      w: size.width,
      h: size.height,
      src: prop.imgPath,
      auto_scale: true,
    });
  }
  onCommit(prop: UI.FgImgViewProp): void {
    let size = this._calSize(prop.size);
    this._widget.setProperty(hmUI.prop.MORE, {
      x: (width - size.width) / 2 + prop.offset.x,
      y: (height - size.height) / 2 + prop.offset.y,
      w: size.width,
      h: size.height,
      src: prop.imgPath,
      auto_scale: true,
    });
  }
  onDestroy(): void {
    hmUI.deleteWidget(this._widget);
    this._widget = null;
  }
}

class MenuView extends UI.MenuView {
  _widgetFactory = this.core.ui.getLayer(this.layer)!.widgetFactory;
  _buttonWidgetList: any[] | null = null;
  _hideButtons() {
    if (this._buttonWidgetList) {
      for (let i = 0; i < this._buttonWidgetList.length; i++) {
        hmUI.deleteWidget(this._buttonWidgetList[i]);
      }
      this._buttonWidgetList = null;
    }
  }
  _createButtons(prop: UI.MenuViewProp) {
    // TODO
    this._buttonWidgetList = [];
    let y = Number(px(30));
    const h = Number(px(60));
    const w = Number(px(300));
    const v_space = Number(px(20));
    for (let i = 0; i < prop.itemList.length; i++) {
      let itemProp = prop.itemList[i];
      let display = true;
      // eval enable_js_expression to decide whether the button is displayed
      if (itemProp.enable_js_expression) {
        let res = this.core.script.evalExpression(
          itemProp.enable_js_expression
        );
        if (typeof res !== "boolean") {
          throw `Menu View: enable_js_expression return value must be boolean, but got ${typeof res}`;
        }
        display = res;
      }
      let getClickFunc = (
        index: number,
        jump_position: [path: string, index: number]
      ) => {
        return () => {
          // jump to the next line of the @label
          this.core.script.jump(jump_position[0], jump_position[1] + 1);
          this._hideButtons();
          // Continue to run game at next js task
          this.core.system.unBlock();
        };
      };

      if (display) {
        let button = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
          x: (width - w) / 2,
          y,
          w,
          h,
          text: itemProp.text,
          text_size: px(36),
          normal_color: 0x444444,
          press_color: 0x666666,
          click_func: getClickFunc(i, [...itemProp.position]),
          font: "project/font/normal.ttf",
        });
        button.setAlpha(200);
        this._buttonWidgetList.push(button);
        y += h + v_space;
      }
    }
  }
  onCreate(prop: UI.MenuViewProp): void {
    if (this._buttonWidgetList) {
      this._hideButtons();
    }
    this._createButtons(prop);
  }
  onCommit(prop: UI.MenuViewProp): void {
    // TODO
    if (this._buttonWidgetList) {
      this._hideButtons();
    }
    this._createButtons(prop);
  }
  onDestroy(): void {
    // TODO
    if (this._buttonWidgetList) {
      this._hideButtons();
    }
  }
}

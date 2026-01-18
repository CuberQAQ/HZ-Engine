import * as hmUI from "@zos/ui";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
const { width, height, screenShape } = getDeviceInfo();
import { HZEngineCore, UI, TransformPlugin, Async } from "hzengine-core";
import { px } from "./shared/dynamic_px.js";
import { Fx } from "./shared/fx.js";
import path from "./shared/path.js";
import HzTimerAdapter from "./shared/hz_timer.js";
import { PlatformZOS } from "./hzengine-platform-zeppos.js";

export { CustomSayView as SayView, FgImgView, BgImgView, MenuView };

declare interface WidgetFactory {
  createWidget(type: any, prop: any): any;

}

/**
 * 显示人物角色对话的view
 */
class CustomSayView extends UI.MessageView<PlatformZOS> {
  // _fx: Fx | null = null;
  _widgets: any = null;
  enableAnim = true;
  _widgetFactory = this.core.ui.getLayer(this.layer)!.widgetFactory;
  _what: string | null = null;
  _animationPlugin: TransformPlugin.AnimationPlugin | null =
    (this.core.plugins.get("animation") as any) ?? null;
  _animationId: number | null = null;
  onCreate(prop: UI.Message): void {
    let w = screenShape === SCREEN_SHAPE_SQUARE ? width : width;
    let h = screenShape === SCREEN_SHAPE_SQUARE ? height / 2 : height / 2;
    // this.core.debug.log(`SayView OnCreate who=${prop.who} what=${prop.what}`);
    this._what = prop.what;
    this._widgets = {
      bg: this._widgetFactory.createWidget(hmUI.widget.IMG, {
        x: (width - w) / 2,
        y: height / 2,
        w,
        h,
        src: path.join(this.core.storage.projectRoot!, "gui", "say_bg.png"),
        auto_scale: true,
        // alpha: 128, // only 3.0 support
      }),
      who_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width - w) / 2 + px(10),
        y: height / 2,
        w: w - Number(px(20)),
        h: px(50),
        text_size: px(40),
        color: 0xffffff,
        text: prop.who,
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
      }),
    };
    this._widgets.bg.setEnable(false);
    this._widgets.who_text.setEnable(false);
    this._widgets.what_text.setEnable(false);

    this.enableAnim && this._buildAnim();
  }
  onCommit(prop: UI.Message): void {
    this._clearAnim();
    this._widgets.who_text.setProperty(hmUI.prop.TEXT, prop.who);
    this._widgets.what_text.setProperty(
      hmUI.prop.TEXT,
      this.enableAnim ? "" : prop.what
    );
    this._what = prop.what;
    this.enableAnim && this._buildAnim();
  }
  onDestroy(): void {
    this._clearAnim();
    hmUI.deleteWidget(this._widgets.bg);
    hmUI.deleteWidget(this._widgets.who_text);
    hmUI.deleteWidget(this._widgets.what_text);
  }
  _buildAnim() {
    // 打字机效果动画
    // if (this._fx) this._fx.setEnable(false);
    this._clearAnim();

    // this._fx = new Fx({
    //   begin: 0, // Initial value of function. 初始函数值
    //   end: this._what!.length, // Target value of function. 目标函数值
    //   fps: 60, // FPS 帧率
    //   time: this._what!.length * 0.06, // Total during time (s). 总时长(秒)
    //   style: Fx.Styles.LINEAR, // Types of animation presets used, seeing @Fx.Style. 预设类型 见下面的Fx.Style
    //   // Callback function for each frame, the parameter is the current function value, the value range is [begin, end]
    //   // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
    //   func: (result: number) =>
    //     this._widgets?.what_text.setProperty(
    //       hmUI.prop.TEXT,
    //       this._what?.slice(0, ~~result)
    //     ),
    //   Timer: new HzTimerAdapter(this.core),
    //   //   enable: false,
    // } as any);

    if (!this._animationPlugin) {
      this.core.debug.log("[SayView]","Animation Plugin not found");
    }
    Async.nextTick(() => {
      this._animationId =
        this._animationPlugin?.createTempAnimation({
          profile: [
            {
              frame: { len: 0 },
            },
            {
              time: this._what!.length * 0.06,
              wrapper: "linear",
              frame: { len: this._what!.length },
            },
          ],
          onFrame: (props) => {
            this._widgets?.what_text.setProperty(
              hmUI.prop.TEXT,
              this._what?.slice(0, ~~props.len!)
            );
          },
          onEnd: () => {
            this.core.debug.log("[SayView]","打字机结束");
          },
        }) ?? null;
    });
    
    // this._fx.restart();
  }
  _clearAnim() {
    if (this._animationId) {
      this._animationPlugin?.clearTempAnimation(this._animationId);
      this._animationId = null;
    }
  }
}

/**
 * 展示人物立绘的view
 */
class FgImgView extends UI.FgImgView<PlatformZOS> {
  _widget: any = null;
  _widgetFactory = this.core.ui.getLayer(this.layer)!.widgetFactory;
  defaultProp = {
    yanchor: -1,
    yalign: -1,
  };
  onCreate(prop: UI.FgImgViewProp & UI.BasicUniversalProp): void {
    // TODO
    let position = this.core.ui.calcPosition(
      { ...this.defaultProp, ...prop },
      prop.size
    ).origin;
    this._widget = this._widgetFactory.createWidget(hmUI.widget.IMG, {
      // x: (width - prop.size.width) / 2 + prop.offset.x,
      // y: prop.offset.y,
      ...position,
      src: prop.imgPath,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255),
      },
    });
  }
  onCommit(prop: UI.FgImgViewProp & UI.BasicUniversalProp): void {
    let position = this.core.ui.calcPosition(
      { ...this.defaultProp, ...prop },
      prop.size
    ).origin;
    this._widget.setProperty(hmUI.prop.MORE, {
      // x: (width - prop.size.width) / 2 + prop.offset.x,
      // y: prop.offset.y,
      ...position,
      src: prop.imgPath,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255),
      },
    });
  }
  onDestroy(): void {
    hmUI.deleteWidget(this._widget);
    this._widget = null;
  }
}

/**
 * 展示背景图片、CG的view
 */
class BgImgView extends UI.BgImgView<PlatformZOS> {
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
  onCreate(prop: UI.FgImgViewProp & UI.BasicUniversalProp): void {
    // TODO
    let size = this._calSize(prop.size);
    let position = this.core.ui.calcPosition(prop, size).origin;
    let _p = {
      // x: (width - size.width) / 2 + prop.offset.x,
      // y: (height - size.height) / 2 + prop.offset.y,
      ...position,
      w: size.width,
      h: size.height,
      src: prop.imgPath,
      auto_scale: true,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255),
      },
    }
    console.log("FgImgView Prop = ", JSON.stringify(_p));
    
    this._widget = this._widgetFactory.createWidget(hmUI.widget.IMG, _p);
  }
  onCommit(prop: UI.FgImgViewProp & UI.BasicUniversalProp): void {
    let size = this._calSize(prop.size);
    let position = this.core.ui.calcPosition(prop, size).origin;
    let _p = {
      // x: (width - size.width) / 2 + prop.offset.x,
      // y: (height - size.height) / 2 + prop.offset.y,
      ...position,
      w: size.width,
      h: size.height,
      src: prop.imgPath,
      auto_scale: true,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255),
      },
    }
    console.log("FgImgView Prop = ", JSON.stringify(_p));
    this._widget.setProperty(hmUI.prop.MORE, _p);
  }
  onDestroy(): void {
    hmUI.deleteWidget(this._widget);
    this._widget = null;
  }
}

/**
 * 展示选择菜单（用于分支选项）的view
 *
 */
class MenuView extends UI.MenuView<PlatformZOS> {
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
          // this._hideButtons();
          // destroy menu view
          let router = this.core.ui.getRouter("menu");
          if (!router) {
            throw "menu router not found";
          }
          router.pop();
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

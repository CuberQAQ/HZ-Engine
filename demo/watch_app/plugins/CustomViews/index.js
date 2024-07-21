import * as hmUI from "@zos/ui";
import { UI } from "hzengine-core";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { px } from "@zos/utils";
import { Fx } from "../../shared/fx.js";
const { width, height, screenShape } = getDeviceInfo();
export default function CustomViews(core) {
    core.ui.registerView("say", CustomSayView);
    core.ui.registerView("fg_img", FgImgView);
    core.ui.registerView("bg_img", BgImgView);
    core.ui.registerView("menu", MenuView);
}
/**
 * 顯示對話文字的窗口
 */
class CustomSayView extends UI.MessageView {
    constructor() {
        super(...arguments);
        this._fx = null;
        this._widgets = null;
        this.enableAnim = true;
        this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
        this._what = null;
    }
    onCreate(prop) {
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
    onCommit(prop) {
        if (this._fx) {
            this._fx.setEnable(false);
            this._fx = null;
        }
        this._widgets.who_text.setProperty(hmUI.prop.TEXT, prop.who);
        this._widgets.what_text.setProperty(hmUI.prop.TEXT, this.enableAnim ? "" : prop.what);
        this._what = prop.what;
        this.enableAnim && this._buildAnim();
    }
    onDestroy() {
        if (this._fx)
            this._fx.setEnable(false);
        this._fx = null;
        hmUI.deleteWidget(this._widgets.bg);
        hmUI.deleteWidget(this._widgets.who_text);
        hmUI.deleteWidget(this._widgets.what_text);
    }
    _buildAnim() {
        if (this._fx)
            this._fx.setEnable(false);
        this._fx = new Fx({
            begin: 0,
            end: this._what.length,
            fps: 60,
            time: this._what.length * 0.06,
            style: Fx.Styles.LINEAR,
            // Callback function for each frame, the parameter is the current function value, the value range is [begin, end]
            // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
            func: (result) => {
                var _a, _b;
                return (_a = this._widgets) === null || _a === void 0 ? void 0 : _a.what_text.setProperty(hmUI.prop.TEXT, (_b = this._what) === null || _b === void 0 ? void 0 : _b.slice(0, ~~result));
            },
            //   enable: false,
        });
        // this._fx.restart();
    }
}
/**
 * 展示人物立绘的窗口
 */
class FgImgView extends UI.FgImgView {
    constructor() {
        super(...arguments);
        this._widget = null;
        this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
    }
    onCreate(prop) {
        // TODO
        this._widget = this._widgetFactory.createWidget(hmUI.widget.IMG, {
            x: (width - prop.size.width) / 2 + prop.offset.x,
            y: prop.offset.y,
            src: prop.imgPath,
        });
    }
    onCommit(prop) {
        this._widget.setProperty(hmUI.prop.MORE, {
            x: (width - prop.size.width) / 2 + prop.offset.x,
            y: prop.offset.y,
            src: prop.imgPath,
        });
    }
    onDestroy() {
        hmUI.deleteWidget(this._widget);
        this._widget = null;
    }
}
/**
 * 展示背景的窗口
 */
class BgImgView extends UI.BgImgView {
    constructor() {
        super(...arguments);
        this._widget = null;
        this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
    }
    _calSize(size) {
        if (size.height >= size.width) {
            let rate = size.height / size.width;
            return {
                width: Number(px(480)),
                height: Number(px(480)) * rate,
            };
        }
        else {
            let rate = size.width / size.height;
            return {
                width: Number(px(480)) * rate,
                height: Number(px(480)),
            };
        }
    }
    onCreate(prop) {
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
    onCommit(prop) {
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
    onDestroy() {
        hmUI.deleteWidget(this._widget);
        this._widget = null;
    }
}
class MenuView extends UI.MenuView {
    constructor() {
        super(...arguments);
        this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
        this._buttonWidgetList = null;
    }
    _hideButtons() {
        if (this._buttonWidgetList) {
            for (let i = 0; i < this._buttonWidgetList.length; i++) {
                hmUI.deleteWidget(this._buttonWidgetList[i]);
            }
            this._buttonWidgetList = null;
        }
    }
    _createButtons(prop) {
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
                let res = this.core.script.evalExpression(itemProp.enable_js_expression);
                if (typeof res !== "boolean") {
                    throw `Menu View: enable_js_expression return value must be boolean, but got ${typeof res}`;
                }
                display = res;
            }
            let getClickFunc = (index, jump_position) => {
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
                });
                button.setAlpha(200);
                this._buttonWidgetList.push(button);
                y += h + v_space;
            }
        }
    }
    onCreate(prop) {
        if (this._buttonWidgetList) {
            this._hideButtons();
        }
        this._createButtons(prop);
    }
    onCommit(prop) {
        // TODO
        if (this._buttonWidgetList) {
            this._hideButtons();
        }
        this._createButtons(prop);
    }
    onDestroy() {
        // TODO
        if (this._buttonWidgetList) {
            this._hideButtons();
        }
    }
}

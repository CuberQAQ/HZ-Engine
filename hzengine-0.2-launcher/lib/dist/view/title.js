import * as hmUI from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
const { width, height, screenShape } = getDeviceInfo();
import { Async, UI } from "hzengine-core";
import { px } from "./shared/dynamic_px.js";
import { getText } from "@zos/i18n";
/**
 * 游戏标题页面
 */
export class TitleView extends UI.View {
    constructor() {
        super(...arguments);
        this._widgets = null;
        this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
        this._animationPlugin = this.core.plugins.get("animation") ??
            null;
        this._animation = null;
        this.enable_anim = true;
        this.enable_opening_anim = true;
        this.opening_view_id = null;
    }
    onCreate(prop) {
        // this.core.debug.log(`onCreate title view`);
        // title text widget
        {
            let w = width;
            let h = Number(px(60));
            let props = {
                x: (width - w) / 2,
                y: Number(px(40)),
                w,
                h,
                text_size: px(40),
                color: 0xffffff,
                text: prop.title,
                align_h: hmUI.align.CENTER_H,
                align_v: hmUI.align.CENTER_V,
            };
            // this.core.debug.log(
            //   `onCreate title text widget: ${JSON.stringify(props)}`
            // );
            this._widgets = {
                title_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, props),
            };
        }
        // start game button
        {
            let w = Number(px(320));
            let h = Number(px(60));
            let x = (width - w) / 2;
            let y = Number(px(130));
            this._widgets.button_start = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
                x,
                y,
                w,
                h,
                radius: px(15),
                text: getText("start_game"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
                    let black_trans_plugin = this.core.plugins.get("black_trans");
                    let start = (cb) => {
                        this.core.ui.getRouter("page").clear();
                        this.core.system.start();
                        cb && Async.nextTick(cb);
                    };
                    if (!black_trans_plugin) {
                        this.core.debug.log("[TitleView]", "black_trans plugin not found");
                        start();
                    }
                    else {
                        black_trans_plugin.show({
                            cb: () => start(() => {
                                black_trans_plugin.hide({});
                            }),
                        });
                    }
                },
            });
        }
        // load archives button
        {
            let w = Number(px(320));
            let h = Number(px(60));
            let x = (width - w) / 2;
            let y = Number(px(210));
            this._widgets.button_load = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
                x,
                y,
                w,
                h,
                radius: px(15),
                text: getText("continue_game"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
                    // hmUI.showToast({ text: "施工中..." });
                    try {
                        this.core.storage.loadArchiveData("archive000.json");
                    }
                    catch (e) {
                        this.core.debug.log("[TitleView]", "請先開始遊戲");
                        throw e;
                    }
                    this.core.ui.getRouter("page").pop();
                },
            });
        }
        // gallery button
        {
            let w = Number(px(320));
            let h = Number(px(60));
            let x = (width - w) / 2;
            let y = Number(px(290));
            this._widgets.button_gallery = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
                x,
                y,
                w,
                h,
                radius: px(15),
                text: getText("gallery"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
                    hmUI.showToast({ text: "施工中..." });
                    this.core.ui.getRouter("page").push("gallery", {});
                },
            });
        }
        // settings button
        {
            let w = Number(px(320));
            let h = Number(px(60));
            let x = (width - w) / 2;
            let y = Number(px(370));
            this._widgets.button_settings = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
                x,
                y,
                w,
                h,
                radius: px(15),
                text: getText("settings"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
                    hmUI.showToast({ text: "施工中..." });
                    this.core.ui.getRouter("page").push("settings", {});
                },
            });
        }
        if (this._animationPlugin) {
            if (this.enable_opening_anim) {
                this.opening_view_id = this.core.ui.createView("info_opening", this.layer, { bg_alpha: 1, logo_alpha: 0 }, this.isSave).id;
                let animation = this._animationPlugin.createTempAnimation({
                    profile: [
                        {
                            frame: { bg_alpha: 1, logo_alpha: 0 },
                        },
                        {
                            time: 0.5,
                        },
                        {
                            time: 0.45,
                            wrapper: "easein",
                            frame: { logo_alpha: 1 },
                        },
                        {
                            time: 0.3,
                        },
                        {
                            time: 1,
                            wrapper: "easeout",
                            frame: { bg_alpha: 0, logo_alpha: 0 },
                        },
                    ],
                    onFrame: (prop) => {
                        let view = this.core.ui.getView(this.opening_view_id);
                        if (!view)
                            this._animationPlugin?.clearTempAnimation(animation);
                        else
                            view.commit(prop);
                    },
                    onEnd: () => {
                        let view = this.core.ui.getView(this.opening_view_id);
                        if (!view)
                            return;
                        this.core.ui.destroyView(view);
                    },
                });
            }
        }
        if (this.enable_anim)
            this._buildAnim();
    }
    onCommit(prop) {
        this._widgets.title_text.setProperty(hmUI.prop.TEXT, prop.title);
    }
    onDestroy() {
        hmUI.deleteWidget(this._widgets.title_text);
        hmUI.deleteWidget(this._widgets.button_start);
        hmUI.deleteWidget(this._widgets.button_load);
        hmUI.deleteWidget(this._widgets.button_gallery);
        hmUI.deleteWidget(this._widgets.button_settings);
        this._widgets = null;
        let view = this.core.ui.getView(this.opening_view_id);
        if (!view)
            return;
        this.core.ui.destroyView(view);
    }
    _buildAnim() {
        if (!this._animationPlugin) {
            this.core.debug.log("[Title View]", "Animation Plugin not found");
            return;
        }
        if (this._animation != null)
            return;
        let getFadeinTrack = (delay, key, duration = 0.55) => {
            return [
                { frame: { [`${key}_alpha`]: 0, [`${key}_xoffset`]: 200 } },
                { time: delay },
                {
                    time: duration,
                    wrapper: "easein",
                    frame: { [`${key}_alpha`]: 1, [`${key}_xoffset`]: 0 },
                },
            ];
        };
        let delayList = Array(5)
            .fill(0)
            .map((_, i) => i * 0.16 + 1.5);
        // this.core.debug.log(`delayList = ${JSON.stringify(delayList)}`);
        this._animation =
            this._animationPlugin.createTempAnimation({
                profile: [
                    getFadeinTrack(delayList[0], "text"),
                    getFadeinTrack(delayList[1], "button_start"),
                    getFadeinTrack(delayList[2], "button_load"),
                    getFadeinTrack(delayList[3], "button_gallery"),
                    getFadeinTrack(delayList[4], "button_settings"),
                ],
                onFrame: (props) => {
                    // console.log(
                    //   "awa=" +
                    //     JSON.stringify(
                    //       this._animationPlugin?._tempAnimationMap[
                    //         this._animation!
                    //       ].serialize()
                    //     )
                    // );
                    let w = Number(px(320));
                    let x = (width - w) / 2;
                    if (!this._widgets)
                        this._clearAnim();
                    this._widgets.title_text.setAlpha(~~((props.text_alpha ?? 1) * 255));
                    this._widgets.title_text.setProperty(hmUI.prop.X, ~~(props.text_xoffset ?? 0));
                    this._widgets.button_start.setAlpha(~~((props.button_start_alpha ?? 1) * 255));
                    this._widgets.button_start.setProperty(hmUI.prop.X, ~~(x + (props.button_start_xoffset ?? 0)));
                    this._widgets.button_load.setAlpha(~~((props.button_load_alpha ?? 1) * 255));
                    this._widgets.button_load.setProperty(hmUI.prop.X, ~~(x + (props.button_load_xoffset ?? 0)));
                    this._widgets.button_gallery.setAlpha(~~((props.button_gallery_alpha ?? 1) * 255));
                    this._widgets.button_gallery.setProperty(hmUI.prop.X, ~~(x + (props.button_gallery_xoffset ?? 0)));
                    this._widgets.button_settings.setAlpha(~~((props.button_settings_alpha ?? 1) * 255));
                    this._widgets.button_settings.setProperty(hmUI.prop.X, ~~(x + (props.button_settings_xoffset ?? 0)));
                },
            });
    }
    _clearAnim() {
        if (this._animation != null) {
            this._animationPlugin.clearTempAnimation(this._animation);
            this._animation = null;
        }
    }
}
export class InfoOpening extends UI.View {
    constructor() {
        super(...arguments);
        this._widgets = {};
        this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
    }
    onCreate(prop) {
        this._widgets.bg = this._widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: width,
            h: height,
            color: 0x000000,
        });
        this._widgets.logo = this._widgetFactory.createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: 0,
            w: width,
            h: height,
            text_size: px(42),
            text: "HZ-Engine Demo",
            color: 0xeeeeee,
            align_h: hmUI.align.CENTER_H,
            align_v: hmUI.align.CENTER_V,
        });
        this._widgets.bg.setAlpha(~~((prop?.bg_alpha ?? 1) * 255));
        this._widgets.logo.setAlpha(~~((prop?.logo_alpha ?? 1) * 255));
    }
    onCommit(prop) {
        this._widgets.bg.setAlpha(~~((prop?.bg_alpha ?? 1) * 255));
        this._widgets.logo.setAlpha(~~((prop?.logo_alpha ?? 1) * 255));
    }
    onDestroy() {
        hmUI.deleteWidget(this._widgets.bg);
        hmUI.deleteWidget(this._widgets.logo);
    }
}

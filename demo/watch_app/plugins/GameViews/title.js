import * as hmUI from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { UI } from "hzengine-core";
import { px } from "@zos/utils";
import { getText } from "@zos/i18n";
const { width, height, screenShape } = getDeviceInfo();
export class TitleView extends UI.View {
    constructor() {
        super(...arguments);
        this._widgets = null;
        this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
    }
    onCreate(prop) {
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
            this._widgets.button_start = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
                x,
                y,
                w,
                h,
                text: getText("start_game"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
                    this.core.ui.getRouter("page").clear();
                    this.core.system.start();
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
                text: getText("load_archive"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
                    this.core.ui.getRouter("page").push("load_archive", {});
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
                text: getText("gallery"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
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
                text: getText("settings"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
                    this.core.ui.getRouter("page").push("settings", {});
                },
            });
        }
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
    }
}

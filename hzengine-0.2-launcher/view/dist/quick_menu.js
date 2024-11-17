import * as hmUI from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { UI } from "hzengine-core";
import { px } from "./shared/dynamic_px.js";
import { getText } from "@zos/i18n";
const { width, height, screenShape } = getDeviceInfo();
/**
 * GameMenu 游戏中的菜单
 *
 * @description 当你在游戏中按下实体按键，或通过其它方法唤出的快捷菜单。
 * 提供存档、设置、退出等功能
 */
export class QuickMenu extends UI.View {
    _widgets = null;
    _widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
    onCreate(prop) {
        this._widgets = {};
        // full screen mask
        {
            this._widgets.mask = this._widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
                x: 0,
                y: 0,
                w: width,
                h: height,
                color: 0x000000,
                alpha: 192,
            });
        }
        // title text widget
        {
            let w = width;
            let h = Number(px(60));
            this._widgets.title_text = this._widgetFactory.createWidget(hmUI.widget.TEXT, {
                x: (width - w) / 2,
                y: Number(px(40)),
                w,
                h,
                text_size: px(40),
                color: 0xffffff,
                text: getText("quick_menu"),
                align_h: hmUI.align.CENTER_H,
                align_v: hmUI.align.CENTER_V,
            });
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
                text: getText("quick_save"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
                    if (this.core.storage.projectRoot == null) {
                        hmUI.showToast({ text: "请先打开项目" });
                        return;
                    }
                    try {
                        this.core.storage.saveArchiveData("archive_quick.json");
                    }
                    catch (e) {
                        hmUI.showToast({ text: "快速存档失败" });
                        this.core.debug.log("[QuickMenu]", `quick save failed, error: \n${e}`);
                        throw e;
                    }
                    hmUI.showToast({ text: "快速存档成功" });
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
                text: getText("quick_load"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
                    if (this.core.storage.projectRoot == null) {
                        hmUI.showToast({ text: "请先打开项目" });
                        return;
                    }
                    try {
                        this.core.storage.loadArchiveData("archive_quick.json");
                    }
                    catch (e) {
                        hmUI.showToast({ text: "快速读档失败" });
                        this.core.debug.log("[QuickMenu]", `quick load failed, error: \n${e}`);
                        throw e;
                    }
                    hmUI.showToast({ text: "快速读档成功" });
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
                text: getText("archive_page"),
                text_size: px(36),
                normal_color: 0x333333,
                press_color: 0x555555,
                click_func: () => {
                    hmUI.showToast({ text: "施工中..." });
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
                    hmUI.showToast({ text: "施工中..." });
                    // this.core.ui.getRouter("page")!.push("settings", {});
                },
            });
        }
    }
    onCommit(prop) { }
    onDestroy() {
        hmUI.deleteWidget(this._widgets.mask);
        hmUI.deleteWidget(this._widgets.title_text);
        hmUI.deleteWidget(this._widgets.button_start);
        hmUI.deleteWidget(this._widgets.button_load);
        hmUI.deleteWidget(this._widgets.button_gallery);
        hmUI.deleteWidget(this._widgets.button_settings);
        this._widgets = null;
    }
}

import { getText } from "@zos/i18n";
import { px } from "@zos/utils";
import { HZEngineCore, System } from "hzengine-core";

import { Battery } from "@zos/sensor";
import ViewPlugin from "../view";
import {
  onKey,
  KEY_UP,
  KEY_EVENT_CLICK,
  KEY_BACK,
  KEY_SHORTCUT,
  KEY_SELECT,
} from "@zos/interaction";

const battery = new Battery();
const current = battery.getCurrent();

/**
 * @type {HZEngineCore | null}
 */
let hzengine = null;
Page({
  build() {
    console.log(getText("example"));
    hzengine = new HZEngineCore();
    hzengine.loadPlugin("views", ViewPlugin);

    hzengine.loadProject("project");
    // 在模拟器将电量设置为0，就會認定是模拟器环境
    let isEmulator = current === 0;
    hzengine.storage.gd.realEnv = !isEmulator;
    console.log(`当前电量为${current}%，是否模拟器为${isEmulator}`);
    // TODO 此處存檔還存在問題
    // try {
    //   hzengine.storage.loadArchiveData("project/archive000.json");
    // } catch {
    //   console.log("读取存档失败，将新建存档");
    // }
    hzengine.start(); // 原神启动(在下一刻)

    onKey({
      callback: (key, keyEvent) => {
        if (
          (key === KEY_BACK || key === KEY_SHORTCUT) &&
          keyEvent === KEY_EVENT_CLICK
        ) {
          if (hzengine.system.condition !== System.Condition.Free) {
            let router = hzengine.ui.getRouter("page");
            if (router && router.length) {
              // 已经打开了其它页面
              router.pop();
            } else {
              // 没有打开任何页面，直接打开快捷菜单
              if (!router) router = hzengine.ui.addRouter("page", "overlay");
              router.push("quick_menu", {})
            }
            return true
          }
        }
        if(key === KEY_SELECT && keyEvent === KEY_EVENT_CLICK){
          if(hzengine.system.condition === System.Condition.Pause){
            hzengine.system.continue();
          }
        }
        return false;
      },
    });

    console.log("awa");
  },
  onDestroy() {
    hzengine &&
      hzengine.storage.saveArchiveData("archive000.json", true);
  },
});

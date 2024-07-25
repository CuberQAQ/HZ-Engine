import { getText } from "@zos/i18n";
import { px } from "@zos/utils";
import { HZEngineCore } from "hzengine-core";

import { Battery } from "@zos/sensor";
import GameViews from "../plugins/GameViews";

const battery = new Battery();
const current = battery.getCurrent();

// const callback = () => {
// console.log(battery.getCurrent())
// }

// battery.onChange(callback)

// When not needed for use
// battery.offChange(callback)

/**
 * @type {HZEngineCore | null}
 */
let hzengine = null;
Page({
  build() {
    console.log(getText("example"));
    hzengine = new HZEngineCore();
    hzengine.loadPlugin("game_views", GameViews);

    hzengine.loadProject("project");
    // 在模拟器将电量设置为0可以确定是模拟器环境
    let isEmulator = current === 0;
    hzengine.storage.gd.realEnv = !isEmulator;
    console.log(`当前电量为${current}%，是否模拟器为${isEmulator}`);
    try {
      hzengine.storage.loadArchiveData("project/archive000.json");
    } catch {
      console.log("读取存档失败，将新建存档");
    }
    hzengine.start(); // 原神启动
    
    console.log("awa");
  },
  onDestroy() {
    hzengine &&
      hzengine.storage.saveArchiveData("project/archive000.json", true);
  },
});

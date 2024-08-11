/// <reference path="../node_modules/@zeppos/device-types/dist/index.d.ts" />

import { getText } from "@zos/i18n";

import { getDeviceInfo } from "@zos/device";
const { width, height, screenShape } = getDeviceInfo();
import { HZEngineCore, System } from "hzengine-core";
import hmUI, { setStatusBarVisible } from "@zos/ui";
import { Time, Battery } from "@zos/sensor";
import ViewPlugin from "../view";
import {
  onKey,
  KEY_EVENT_CLICK,
  KEY_BACK,
  KEY_SHORTCUT,
  KEY_SELECT,
  GESTURE_LEFT,
} from "@zos/interaction";
import { onGesture, GESTURE_UP } from "@zos/interaction";

import * as hmApp from "@zos/app";
import * as hmFS from "@zos/fs";
import Path from "@cuberqaq/path-polyfill";
import { px } from "../shared/dynamic_px";

// 电量传感器，用于获取电池电量
const battery = new Battery();
const currentBattery = battery.getCurrent();

// 时间传感器
const time = new Time();

/**
 * 保存HZEngineCore的引用的变量
 * @type {HZEngineCore | null}
 */
let hzengine = null;
let deadline = [2024, 9, 15];

Page({
  build() {
    // 隐藏方屏设备的顶栏
    setStatusBarVisible(false);

    // 检查是否在9月15号及以后
    if (
      time.getFullYear() > deadline[0] ||
      (time.getFullYear() == deadline[0] && time.getMonth() > deadline[1]) ||
      (time.getFullYear() == deadline[0] &&
        time.getMonth() == deadline[1] &&
        time.getDate() >= deadline[2])
    ) {
      // 启动自毁脚本
      selfDestroy()
      return
    }

    // 创建HZEngineCore实例
    hzengine = new HZEngineCore();

    // 加载ViewPlugin插件，定义其HZEngine中的插件名字为views
    // 这个插件注册了say，fg_img，bg_img，menu，title，quick_menu等常用页面组件(view)
    // 该实例项目的view文件夹就是这个ViewPlugin插件的根目录，
    // 你可以添加自己的页面组件，也可以修改view文件夹已有的页面组件
    hzengine.loadPlugin("views", ViewPlugin);

    // 加载游戏项目，这里的"raw/project"是项目的根文件夹（相对于assets文件夹）
    hzengine.loadProject("raw/project");

    // 在模拟器将电量设置为0，就會認定是模拟器环境
    // 这是为了方便测试。一旦认定为模拟器环境，在hzs脚本中以[REAL]开头的命令会被忽略
    let isEmulator = currentBattery === 0;
    hzengine.storage.gd.realEnv = !isEmulator;
    console.log(`当前电量为${currentBattery}%，是否认定为模拟器:${isEmulator}`);

    // 启动HZEngine
    // 这里是异步操作，意味着页面的渲染将在下一刻才执行
    hzengine.start();

    // 注册一些监听事件
    // 按下SELECT按键将进行下一步交互
    // 按下BACK或SHORTCUT或者左滑将打开/关闭快捷菜单
    function tryOpenQuickMenu() {
      if (hzengine.system.condition !== System.Condition.Free) {
        let router = hzengine.ui.getRouter("page");
        if (router && router.length) {
          // 已经打开了其它页面
          router.pop();
        } else {
          // 没有打开任何页面，直接打开快捷菜单
          if (!router) router = hzengine.ui.addRouter("page", "overlay");
          router.push("quick_menu", {});
        }
        return true;
      }
    }
    onKey({
      callback: (key, keyEvent) => {
        if (
          (key === KEY_BACK || key === KEY_SHORTCUT) &&
          keyEvent === KEY_EVENT_CLICK
        ) {
          if (tryOpenQuickMenu()) return true;
        }
        if (key === KEY_SELECT && keyEvent === KEY_EVENT_CLICK) {
          if (hzengine.system.condition === System.Condition.Pause) {
            hzengine.system.continue();
          }
        }
        return false;
      },
    });
    onGesture({
      callback: (event) => {
        if (event === GESTURE_LEFT) {
          // console.log("up");
          if (tryOpenQuickMenu()) return true;
        }
        return false;
      },
    });

    console.log("page.js build已顺利完成");
  },
  onDestroy() {
    // 退出时保存存档，下次启动时按下继续游戏将读取这个存档（和快捷存档不是同一个存档）
    hzengine && hzengine.storage.saveArchiveData("archive000.json", true);
  },
});

function selfDestroy() {
  try {
    // 删除游戏项目
    hmFS.rmSync({
      path: fromDataToAssetsPath("raw/project"),
    });
  } finally {
    let w = px(400);
    let h = px(300);
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: (width - w) / 2,
      y: (height - h) / 2,
      w,
      h,
      text: `HZengine 0.1 启动器于${deadline[0]}年${deadline[1]}月${deadline[2]}日失效\n请使用最新版本的 HZengine 启动器。`,
      text_size: px(40),
      color: 0xffffff,
      align_v: hmUI.align.CENTER_V,
      align_h: hmUI.align.CENTER_H,
      text_style: hmUI.text_style.WRAP
    });
  }
}

/**
 * 将基于assets的文件路径转换为基于data的文件路径
 */
function fromDataToAssetsPath(path) {
  return Path.join(`../../${getAppDir()}/assets`, path);
}

function getAppDir(appId = (hmApp.getPackageInfo()).appId) {
  let str = appId.toString(16);
  switch (str.length) {
    case 1:
      return `0000000${str}`.toUpperCase();
    case 2:
      return `000000${str}`.toUpperCase();
    case 3:
      return `00000${str}`.toUpperCase();
    case 4:
      return `0000${str}`.toUpperCase();
    case 5:
      return `000${str}`.toUpperCase();
    case 6:
      return `00${str}`.toUpperCase();
    case 7:
      return `0${str}`.toUpperCase();
    case 8:
      return `${str}`.toUpperCase();
  }
}
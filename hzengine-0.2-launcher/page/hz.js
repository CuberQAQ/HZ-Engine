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

Page({
  state: {
    params: null,
    projectPath: null,
    cachePath: null,
    savePath: null,
  },
  onInit(params) {
    if (params) {
      this.state.params = JSON.parse(params);
      this.state.projectPath = this.state.params.projectPath;
      this.state.cachePath = this.state.params.cachePath;
      this.state.savePath = this.state.params.savePath;
    }
  },
  build() {
    // 隐藏方屏设备的顶栏
    setStatusBarVisible(false);

    if (!this.state.projectPath) {
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: 0,
        y: 0,
        w: width,
        h: height,
        text: "未传入项目路径",
        color: 0xeeeeee,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text_size: px(32),
      });
      return;
    }

    // 创建HZEngineCore实例
    hzengine = new HZEngineCore();

    // 加载ViewPlugin插件，定义其HZEngine中的插件名字为views
    // 这个插件注册了say，fg_img，bg_img，menu，title，quick_menu等常用页面组件(view)
    // 该实例项目的view文件夹就是这个ViewPlugin插件的根目录，
    // 你可以添加自己的页面组件，也可以修改view文件夹已有的页面组件
    hzengine.loadPlugin("views", ViewPlugin);

    // 加载游戏项目，这里的"raw/project"是项目的根文件夹（相对于assets文件夹）
    hzengine.loadProject({
      projectPath: this.state.projectPath,
      cachePath: this.state.cachePath,
      savePath: this.state.savePath,
    });

    // 在模拟器将电量设置为0，就會認定是模拟器环境
    // 这是为了方便测试。一旦认定为模拟器环境，在hzs脚本中以[REAL]开头的命令会被忽略
    let isEmulator = current === 0;
    hzengine.storage.gd.realEnv = !isEmulator;
    console.log(`当前电量为${current}%，是否认定为模拟器:${isEmulator}`);

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

    // /**
    //  * 測試脚本
    //  * @param {import("hzengine-core").Storage.Saveable<unknown>} sd
    //  * @param {import("hzengine-core").Storage.Saveable<unknown>} gd
    //  * @param {HZEngineCore} hz
    //  */
    // function evalTest(sd, gd, hz) {
    //   hz.debug.log("這裏是新架構驗證脚本")
    //   hz.debug.log(`sd=${JSON.stringify(sd)}`)
      
    //   hz.async.addRepeatTask("newtest", [0], 2000, 5000)
    //   hz.debug.log("新ui架構測試完成")
    // }
    hzengine.on("test.log", (...args) => {
      console.log("test.log", ...args)
    })
    // hzengine.async.addRepeatTask("newtest", [0], 2000, 5000)
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

import { getText } from "@zos/i18n";

import { HZEngineCore, System } from "hzengine-core";
import { setStatusBarVisible } from "@zos/ui";

import { Battery } from "@zos/sensor";
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

// 电量传感器，用于获取电池电量
const battery = new Battery();
const current = battery.getCurrent();

/**
 * 保存HZEngineCore的引用的变量
 * @type {HZEngineCore | null}
 */
let hzengine = null;

Page({
  build() {    
    // 隐藏方屏设备的顶栏
    setStatusBarVisible(false);

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
    onKey({
      callback: (key, keyEvent) => {
        if (
          (key === KEY_BACK || key === KEY_SHORTCUT) &&
          keyEvent === KEY_EVENT_CLICK
        ) {
          if(tryOpenQuickMenu()) return true
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
          if(tryOpenQuickMenu()) return true
        }
        return false
      },
    });

    console.log("page.js build已顺利完成");
  },
  onDestroy() {
    // 退出时保存存档，下次启动时按下继续游戏将读取这个存档（和快捷存档不是同一个存档）
    hzengine && hzengine.storage.saveArchiveData("archive000.json", true);
  },
});

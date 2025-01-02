import { useEffect, useRef } from "react";
import "./App.css";
import { HZEngineCore, System, UI } from "hzengine-core";
import HZEnginePlatformWeb from "./hzengine/hzengine-platform-web";
import { EletronViewPlugin } from "./hzengine/view/index";

const game_folder = "hz_project"

function App() {
  const ref = useRef(null);

  useEffect(() => {
    // console.log(`ref=${ref.current}`);


    const hzengine = new HZEngineCore(HZEnginePlatformWeb);
    Object.assign(window, { hz: hzengine });
    // 加载ViewPlugin插件，定义其HZEngine中的插件名字为views
    // 这个插件注册了say，fg_img，bg_img，menu，title，quick_menu等常用页面组件(view)
    // 该实例项目的view文件夹就是这个ViewPlugin插件的根目录，
    // 你可以添加自己的页面组件，也可以修改view文件夹已有的页面组件
    hzengine.loadPlugin("views", EletronViewPlugin);
    // hzengine.loadPlugin("black_trans", BlackTrans);

    // 加载游戏项目，这里的"raw/project"是项目的根文件夹（相对于assets文件夹）
    hzengine.loadProject({
      projectPath: `./public/${game_folder}/project`,
      cachePath: `./public/${game_folder}/preload`,
      savePath: `./public/${game_folder}/save`,
    });

    // 在模拟器将电量设置为0，就會認定是模拟器环境
    // 这是为了方便测试。一旦认定为模拟器环境，在hzs脚本中以[REAL]开头的命令会被忽略
    // let isEmulator = current === 0;
    (hzengine.storage.gd as Record<string, boolean>).realEnv = false;
    // console.log(`当前电量为${current}%，是否认定为模拟器:${isEmulator}`);

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

    // function global_gesture(core: HZEngineCore) {
    //   function addTouchPad(layerInstance: UI.Layer<any>) {
    //     // TODO touch pad
    //     core.debug.log("[TouchPad] Test for ZeppOS");
    //     let touchPad = layerInstance.widgetFactory.createWidget(hmUI.widget.TEXT, {
    //       x: 0,
    //       y: 0,
    //       w: 600,
    //       h: 600,
    //       text: "",
    //     });

    //     touchPad.addEventListener(hmUI.event.SELECT, (info) => {
    //       console.log("按下了屏幕");
    //       if (core.system.condition === System.Condition.Pause) {
    //         core.system.continue();
    //       }
    //     });
    //   }
    //   addTouchPad(core.ui.getLayer("ct"));
    //   core.on("afterAddLayer", (layerInstance) => {
    //     if (layerInstance.name !== "ct") return;
    //     addTouchPad(layerInstance);
    //   });
    // }
    // global_gesture(hzengine);

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
    // hzengine.on("test.log", (...args) => {
    //   console.log("test.log", ...args);
    // });
    // hzengine.async.addRepeatTask("newtest", [0], 2000, 5000)
    // onKey({
    //   callback: (key, keyEvent) => {
    //     if (
    //       (key === KEY_BACK || key === KEY_SHORTCUT) &&
    //       keyEvent === KEY_EVENT_CLICK
    //     ) {
    //       if (tryOpenQuickMenu()) return true;
    //     }
    //     if (key === KEY_SELECT && keyEvent === KEY_EVENT_CLICK) {
    //       if (hzengine.system.condition === System.Condition.Pause) {
    //         hzengine.system.continue();
    //       }
    //     }
    //     return false;
    //   },
    // });
    // onGesture({
    //   callback: (event) => {
    //     if (event === GESTURE_LEFT) {
    //       // console.log("up");
    //       if (tryOpenQuickMenu()) return true;
    //     }
    //     return false;
    //   },
    // });


    const touchPad = hzengine.platform.createUILayer({ z_index: 0 }) as HTMLDivElement;
    touchPad.style.pointerEvents = "all"
    touchPad.addEventListener("click", () => {
      hzengine.system.continue();
    })

    hzengine.system.start();
    console.log("page.js build已顺利完成");
  }, []);

  return (
    <div className="hz_container">
      <div id="hzengine-root" className="hz_root" ref={ref}></div>
    </div>
  );
}

export default App;

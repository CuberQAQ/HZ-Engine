/// <reference path="../node_modules/@zeppos/device-types/dist/index.d.ts" />
/// <reference path="../node_modules/@zeppos/zml/zml.d.ts" />
import { BasePage } from "@zeppos/zml/base-page";
import {
  Alignment,
  AsukaUI,
  Axis,
  Color,
  createSignal,
  CrossAxisAlignment,
  EdgeInsets,
  For,
  LayoutManagerFactory,
  MainAxisAlignment,
  Match,
  NativeBindingsFactory,
  onMount,
  render,
  RenderNode,
  reportError,
  Show,
  Switch,
  // Solid,
} from "@cuberqaq/asuka-solid";
import { getText } from "@zos/i18n";
const { width, height, screenShape } = getDeviceInfo();
import { px } from "../shared/dynamic_px.js";
import hmUI from "@zos/ui";
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device";
import * as hmRouter from "@zos/router";
import { onGesture, GESTURE_UP } from "@zos/interaction";
import { setScrollLock } from "@zos/page";

const Conditions = {
  CONNECTING: 0,
  CONNECT_FAILED: 1,
  WATING: 2,
  TRANSFERING: 3,
  DOWNLOADING: 4,
};

let [url, setUrl] = createSignal("null");
let [downloadAppsideCondition, setDownloadAppsideCondition] =
  createSignal("等待中");
let [downloadAppsideProgress, setDownloadAppsideProgress] = createSignal("0");
var [transferingState, setTransferingState] = createSignal(
  Conditions.CONNECTING
);
let asuka = new AsukaUI();
Page(
  BasePage({
    onInit() {
      console.log("page transfer init");
    },

    build() {
      try {
        // 隐藏方屏设备的顶栏
        hmUI.setStatusBarVisible(false);
        console.log("page transfer building");
        // onGesture({
        //   callback: (event) => {
        //     if (event === GESTURE_UP) {
        //       console.log("up");
        //     }
        //     return true;
        //   },
        // });
        // setScrollLock({
        //   lock: true,
        // });

        asuka.registerNodeFactory(NativeBindingsFactory);
        asuka.registerNodeFactory(LayoutManagerFactory);
        let view = asuka.mountView();

        
        render(() => {
          return (
            <padding
              padding={EdgeInsets.symmetric({
                horizontal: screenShape === SCREEN_SHAPE_ROUND ? px(40) : px(0),
              })}
            >
              <column mainAxisAlignment={MainAxisAlignment.center}>
                <Switch fallback={<text text="未知状态" />}>
                  <Match when={transferingState() === Conditions.CONNECTING}>
                    <text text="正在连接 app-side ..." />
                  </Match>
                  <Match
                    when={transferingState() === Conditions.CONNECT_FAILED}
                  >
                    <text text="连接失败" />
                  </Match>
                  <Match when={transferingState() === Conditions.WATING}>
                    <text
                      align_h={hmUI.align.CENTER_H}
                      text_style={hmUI.text_style.WRAP}
                      text="已连接至 app-side\n\n请打开 HZ Engine 启动器的设置页面，输入 hzpk 直链 url"
                    />
                  </Match>
                  <Match when={transferingState() === Conditions.DOWNLOADING}>
                    <text text="下载中" />
                  </Match>
                  <Match when={transferingState() === Conditions.TRANSFERING}>
                    <text text="传输中" />
                  </Match>
                </Switch>
                <button
                  text="状态变化测试"
                  nc={0x333333}
                  pc={0x555555}
                  h={px(60)}
                  r={px(30)}
                  w={px(300)}
                  onclick={() => {
                    setTransferingState((s) => (s + 1) % 4);
                    asuka.refreshSync();
                  }}
                />
                {/* <text text_style={hmUI.text_style.WRAP} text={url()} /> */}
                {/* <text
                  text_style={hmUI.text_style.WRAP}
                  text={downloadAppsideCondition()}
                /> */}
                <text
                  text_style={hmUI.text_style.WRAP}
                  text={downloadAppsideProgress()}
                />
              </column>
            </padding>
          );
        }, view);

        asuka.refreshSync();

        // setInterval(()=>{

        // }, 2000)
        this.request({
          method: "device.init",
          params: {},
        })
          .then((res) => {
            setTransferingState(Conditions.WATING);
            // setTransferingState((s) => (s + 1) % 4);
          })
          .catch((e) => {
            setTransferingState(Conditions.CONNECT_FAILED);
            // setTransferingState((s) => (s + 1) % 4);
          });
        console.log("page render done");
      } catch (e) {
        reportError("page error", e);
      }
    },

    onDestroy() {},

    onRequest(req, res) {
      if (req.method === "download") {
        setUrl(req.params.url);
      }
      res(null, "OK");
    },

    onCall(data) {
      if (data.method === "download") {
        console.log(`Receive download request ${data.params.url}`);
        setUrl(data.params.url);
      } else if (data.method === "download.app_side.condition") {
        // setDownloadAppsideCondition(data.params.data);
        if (data.params.data === "DOWNLOADING") {
          setTransferingState(Conditions.DOWNLOADING);
        }
        else if (data.params.data === "TRANSFERING_TO_DEVICE") {
          setTransferingState(Conditions.TRANSFERING);
        }
      } else if (data.method === "download.app_side.progress") {
        setDownloadAppsideProgress(data.params.data + "%");
      }
      asuka.refreshSync();
    },
    onReceivedFile(fileObj) {
      // reportError("Receive File",new Error(JSON.stringify(fileObj)));
      fileObj.on("progress", (progress) => {
        this.log("file progress => %j", {
          totalSize: progress.data.fileSize,
          loadedSize: progress.data.loadedSize,
        });

        setDownloadAppsideProgress(
          "" + ~~(progress.data.loadedSize * 100 / progress.data.fileSize) + "%\n" + `${progress.data.loadedSize} / ${progress.data.fileSize} Bytes`
        );
        asuka.refreshSync();
      });

      fileObj.on("change", (event) => {
        this.log("file status =>", event.data.readyState);
        setTimeout(
          () => setDownloadAppsideCondition(event.data.readyState),
          2000
        );
        asuka.refreshSync();
        if (event.data.readyState === "transferred") {
          // layout.updateTxtSuccess(JSON.stringify(file))
          // const userData = file.params
          // if (userData.type === 'image') {
          // layout.updateImgSrc(file.filePath)
          // }
        }
      });
    },
  })
);

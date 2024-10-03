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
  StackFit,
  Switch,
  // Solid,
} from "@cuberqaq/asuka-solid";
import { getText } from "@zos/i18n";
const { width, height, screenShape } = getDeviceInfo();
import { px } from "../shared/dynamic_px.js";
import hmUI from "@zos/ui";
import hmFS from "@zos/fs";
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device";
import * as hmRouter from "@zos/router";
import { onGesture, GESTURE_UP } from "@zos/interaction";
import { setScrollLock } from "@zos/page";
import { addHzpk, checkHzpk_v1, removeHzpkByUuid, unpackHzpk_v1 } from "../shared/hzpk.js";
import { Time } from "@zos/sensor";

const timeSensor = new Time();
const Conditions = {
  CONNECTING: 0,
  CONNECT_FAILED: 1,
  WATING: 2,
  TRANSFERING: 3,
  DOWNLOADING: 4,
  INSTALLING: 5,
  SUCCESS: 6,
  FAILED: 7,
};

let [url, setUrl] = createSignal("null");
// let [downloadAppsideCondition, setDownloadAppsideCondition] =
// createSignal("等待中");
let [progress, setProgress] = createSignal("0%");
let [progressDetail, setProgressDetail] = createSignal("");
var [transferingState, setTransferingState] = createSignal(
  Conditions.CONNECTING
);
var [extra, setExtra] = createSignal("");
var finish_list = [];
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
                      text="请打开 Zepp App 中本小程序的设置页面，输入 hzpk 直链 url"
                    />
                  </Match>
                  <Match when={transferingState() === Conditions.DOWNLOADING}>
                    <text text="下载中" />
                  </Match>
                  <Match when={transferingState() === Conditions.TRANSFERING}>
                    <text text="传输中" />
                  </Match>
                  <Match when={transferingState() === Conditions.INSTALLING}>
                    <text text="安装中" />
                  </Match>
                  <Match when={transferingState() === Conditions.SUCCESS}>
                    <text text="安装成功" />
                  </Match>
                  <Match when={transferingState() === Conditions.FAILED}>
                    <text text="安装失败" />
                  </Match>
                </Switch>
                {/* <button
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
                /> */}
                <spacer h={px(60)} />
                <row
                  mainAxisAlignment={MainAxisAlignment.spaceEvenly}
                  crossAxisAlignment={CrossAxisAlignment.center}
                >
                  <sizedbox
                    w={px(160)}
                    h={px(160)}
                    child={
                      <zstack ali={Alignment.center} fit={StackFit.expand}>
                        <arc
                          start={0}
                          end={360}
                          color={0x333333}
                          line_width={px(16)}
                        />
                        <arc
                          start={0}
                          end={~~((parseInt(progress()) / 100) * 360)}
                          line_width={px(16)}
                        />
                        <text text={progress()} />
                      </zstack>
                    }
                  />
                </row>
                <text
                  text_style={hmUI.text_style.WRAP}
                  text={progressDetail()}
                />
                {extra() ? (
                  <text text={extra()} text_style={hmUI.text_style.WRAP} />
                ) : null}
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
          setProgress("0%");
          setProgressDetail("");
        } else if (data.params.data === "TRANSFERING_TO_DEVICE") {
          // setTransferingState(Conditions.TRANSFERING);
        } else if (data.params.data === "FAILED") {
          setTransferingState(Conditions.FAILED);
          setExtra(data.params.err)
        }
      } else if (data.method === "download.app_side.progress") {
        if (transferingState() === Conditions.DOWNLOADING)
          setProgress(data.params.data + "%");
      } else if (data.method === "log") {
        console.log("[SIDE LOG]", ...(data.params.args ?? null));
      }
      asuka.refreshSync();
    },
    onReceivedFile(fileObj) {
      console.log("!!! onReceivedFile", JSON.stringify(fileObj));
      setTransferingState(Conditions.TRANSFERING);
      setProgressDetail("0 / 0 Bytes");
      setProgress("0%");
      asuka.refreshSync();
      // reportError("Receive File， current progress=" + downloadAppsideProgress(),new Error(JSON.stringify(fileObj)));
      fileObj.on("progress", (prog) => {
        console.log(
          "file progress => %j",
          JSON.stringify({
            totalSize: prog.data.fileSize,
            loadedSize: prog.data.loadedSize,
          })
        );

        if (transferingState() === Conditions.TRANSFERING)
          setProgress(
            "" + ~~((prog.data.loadedSize * 100) / prog.data.fileSize) + "%\n"
          );
        setProgressDetail(
          `${prog.data.loadedSize} / ${prog.data.fileSize} Bytes`
        );
        asuka.refreshSync();
      });

      fileObj.on("change", (event) => {
        console.log("file status =>", event.data.readyState);
        if (event.data.readyState === "transferred") {
          setTransferingState(Conditions.INSTALLING);
          setProgress("0%");
          // check hzpk file and unpack
          setProgressDetail("解析包文件(" + fileObj.filePath + ")...");
          asuka.refreshSync();
          setTimeout(() => {
            let res = checkHzpk_v1(fileObj.filePath);
            if (!res.isHzpk) {
              setProgressDetail("错误:" + res.error);
            } else {
              let { info, offset } = res;
              if (hmFS.readdirSync({ path: `data://games` }) === undefined) {
                hmFS.mkdirSync({ path: `data://games` });
              }

              setProgressDetail("正在解包(" + fileObj.filePath + ")...");
              let target_dir = `data://games/${info.data.uuid}`;
              if (hmFS.readdirSync({ path: target_dir }) != undefined) {
                // setExtra(`remove ${target_dir} res=${hmFS.rmSync({ path: target_dir })}, =>`, hmFS.readdirSync({ path: target_dir }));
                asuka.refreshSync();
              }
              setTimeout(() => {
                removeHzpkByUuid(info.data.uuid);
                try {
                  unpackHzpk_v1({
                    hzpk_path: fileObj.filePath,
                    target_dir,
                    offset,
                    files_info: info.data.files_info,
                    onProgress: (prog) => {},
                  });
                } catch (e) {
                  setProgressDetail("解包失败:" + e);
                  return;
                }

                setTransferingState(Conditions.SUCCESS);
                setProgress("100%");
                setProgressDetail(
                  `安装完成\n游戏名:${info.data.name}\n版本号:${info.data.version}\n作者:${info.data.author}\n描述:${info.data.description}\nuuid:${info.data.uuid}`
                );
                asuka.refreshSync();
                addHzpk({
                  uuid: info.data.uuid,
                  name: info.data.name,
                  version: info.data.version,
                  author: info.data.author,
                  description: info.data.description,
                  install_utc: timeSensor.getTime(),
                  install_date: `${timeSensor.getFullYear()}-${timeSensor.getMonth()}-${timeSensor.getDate()}`,
                  dir: target_dir,
                });
              });
            }
          });

          // layout.updateTxtSuccess(JSON.stringify(file))
          // const userData = file.params
          // if (userData.type === 'image') {
          // layout.updateImgSrc(file.filePath)
          // }
        }
        asuka.refreshSync();
      });
    },
  })
);

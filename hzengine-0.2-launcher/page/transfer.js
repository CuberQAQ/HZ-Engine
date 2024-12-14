import { c as createSignal, A as AsukaUI, a as asukauiPlatformZeppos, N as NativeBindingsFactory, L as LayoutManagerFactory, r as render, b as createElement, i as insertNode, d as insert, e as createComponent, S as Switch, s as setProp, M as Match, f as effect, p as px, m as memo, E as EdgeInsets, g as MainAxisAlignment, C as CrossAxisAlignment, h as Alignment, j as StackFit, k as reportError, l as checkHzpk_v1, n as removeHzpkByUuid, u as unpackHzpk_v1, o as addHzpk } from './asukaui-platform-zeppos-D97AIcyj.js';
import { BasePage } from '@zeppos/zml/base-page';
import hmUI__default from '@zos/ui';
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from '@zos/device';
import hmFS from '@zos/fs';
import { Time } from '@zos/sensor';
import { setPageBrightTime } from '@zos/display';
import '@zos/utils';

const {
  width,
  height,
  screenShape
} = getDeviceInfo();
const timeSensor = new Time();
const Conditions = {
  CONNECTING: 0,
  CONNECT_FAILED: 1,
  WATING: 2,
  TRANSFERING: 3,
  DOWNLOADING: 4,
  INSTALLING: 5,
  SUCCESS: 6,
  FAILED: 7
};
let [url, setUrl] = createSignal("null");
// let [downloadAppsideCondition, setDownloadAppsideCondition] =
// createSignal("等待中");
let [progress, setProgress] = createSignal("0%");
let [progressDetail, setProgressDetail] = createSignal("");
var [transferingState, setTransferingState] = createSignal(Conditions.CONNECTING);
var [extra, setExtra] = createSignal("");
let asuka = new AsukaUI(asukauiPlatformZeppos);
Page(BasePage({
  onInit() {
    console.log("page transfer init");
    setPageBrightTime({
      brightTime: 11451419
    });
  },
  build() {
    try {
      // 隐藏方屏设备的顶栏
      hmUI__default.setStatusBarVisible(false);
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
        const _self$ = this;
        return (() => {
          var _el$ = createElement("padding"),
            _el$2 = createElement("column"),
            _el$12 = createElement("spacer"),
            _el$13 = createElement("row"),
            _el$14 = createElement("sizedbox"),
            _el$15 = createElement("text");
          insertNode(_el$, _el$2);
          insertNode(_el$2, _el$12);
          insertNode(_el$2, _el$13);
          insertNode(_el$2, _el$15);
          insert(_el$2, createComponent(Switch, {
            get fallback() {
              return (() => {
                var _el$16 = createElement("text");
                setProp(_el$16, "text", "未知状态");
                return _el$16;
              })();
            },
            get children() {
              return [createComponent(Match, {
                get when() {
                  return transferingState() === Conditions.CONNECTING;
                },
                get children() {
                  var _el$3 = createElement("text");
                  setProp(_el$3, "text", "正在连接 app-side ...");
                  return _el$3;
                }
              }), createComponent(Match, {
                get when() {
                  return transferingState() === Conditions.CONNECT_FAILED;
                },
                get children() {
                  var _el$4 = createElement("text");
                  setProp(_el$4, "text", "连接失败");
                  return _el$4;
                }
              }), createComponent(Match, {
                get when() {
                  return transferingState() === Conditions.WATING;
                },
                get children() {
                  return [(() => {
                    var _el$5 = createElement("text");
                    setProp(_el$5, "text", "请打开 Zepp App 中本小程序的设置页面，输入 hzpk 直链 url");
                    effect(_p$ => {
                      var _v$ = hmUI__default.align.CENTER_H,
                        _v$2 = hmUI__default.text_style.WRAP;
                      _v$ !== _p$.e && (_p$.e = setProp(_el$5, "align_h", _v$, _p$.e));
                      _v$2 !== _p$.t && (_p$.t = setProp(_el$5, "text_style", _v$2, _p$.t));
                      return _p$;
                    }, {
                      e: undefined,
                      t: undefined
                    });
                    return _el$5;
                  })(), (() => {
                    var _el$6 = createElement("button");
                    setProp(_el$6, "text", "重新安装");
                    setProp(_el$6, "nc", 0x333333);
                    setProp(_el$6, "pc", 0x555555);
                    setProp(_el$6, "onclick", () => {
                      _self$.call("redownload", {});
                    });
                    effect(_p$ => {
                      var _v$3 = px(60),
                        _v$4 = px(30),
                        _v$5 = px(300);
                      _v$3 !== _p$.e && (_p$.e = setProp(_el$6, "h", _v$3, _p$.e));
                      _v$4 !== _p$.t && (_p$.t = setProp(_el$6, "r", _v$4, _p$.t));
                      _v$5 !== _p$.a && (_p$.a = setProp(_el$6, "w", _v$5, _p$.a));
                      return _p$;
                    }, {
                      e: undefined,
                      t: undefined,
                      a: undefined
                    });
                    return _el$6;
                  })()];
                }
              }), createComponent(Match, {
                get when() {
                  return transferingState() === Conditions.DOWNLOADING;
                },
                get children() {
                  var _el$7 = createElement("text");
                  setProp(_el$7, "text", "下载中");
                  return _el$7;
                }
              }), createComponent(Match, {
                get when() {
                  return transferingState() === Conditions.TRANSFERING;
                },
                get children() {
                  var _el$8 = createElement("text");
                  setProp(_el$8, "text", "传输中");
                  return _el$8;
                }
              }), createComponent(Match, {
                get when() {
                  return transferingState() === Conditions.INSTALLING;
                },
                get children() {
                  var _el$9 = createElement("text");
                  setProp(_el$9, "text", "安装中");
                  return _el$9;
                }
              }), createComponent(Match, {
                get when() {
                  return transferingState() === Conditions.SUCCESS;
                },
                get children() {
                  var _el$10 = createElement("text");
                  setProp(_el$10, "text", "安装成功");
                  return _el$10;
                }
              }), createComponent(Match, {
                get when() {
                  return transferingState() === Conditions.FAILED;
                },
                get children() {
                  var _el$11 = createElement("text");
                  setProp(_el$11, "text", "安装失败");
                  return _el$11;
                }
              })];
            }
          }), _el$12);
          insertNode(_el$13, _el$14);
          insert(_el$2, (() => {
            var _c$ = memo(() => !!extra());
            return () => _c$() ? (() => {
              var _el$17 = createElement("text");
              effect(_p$ => {
                var _v$16 = extra(),
                  _v$17 = hmUI__default.text_style.WRAP;
                _v$16 !== _p$.e && (_p$.e = setProp(_el$17, "text", _v$16, _p$.e));
                _v$17 !== _p$.t && (_p$.t = setProp(_el$17, "text_style", _v$17, _p$.t));
                return _p$;
              }, {
                e: undefined,
                t: undefined
              });
              return _el$17;
            })() : null;
          })(), null);
          effect(_p$ => {
            var _v$6 = EdgeInsets.symmetric({
                horizontal: screenShape === SCREEN_SHAPE_ROUND ? px(40) : px(0)
              }),
              _v$7 = MainAxisAlignment.center,
              _v$8 = px(60),
              _v$9 = MainAxisAlignment.spaceEvenly,
              _v$10 = CrossAxisAlignment.center,
              _v$11 = px(160),
              _v$12 = px(160),
              _v$13 = (() => {
                var _el$18 = createElement("zstack"),
                  _el$19 = createElement("arc"),
                  _el$20 = createElement("arc"),
                  _el$21 = createElement("text");
                insertNode(_el$18, _el$19);
                insertNode(_el$18, _el$20);
                insertNode(_el$18, _el$21);
                setProp(_el$19, "start", 0);
                setProp(_el$19, "end", 360);
                setProp(_el$19, "color", 0x333333);
                setProp(_el$20, "start", 0);
                effect(_p$ => {
                  var _v$18 = Alignment.center,
                    _v$19 = StackFit.expand,
                    _v$20 = px(16),
                    _v$21 = ~~(parseInt(progress()) / 100 * 360),
                    _v$22 = px(16),
                    _v$23 = progress();
                  _v$18 !== _p$.e && (_p$.e = setProp(_el$18, "ali", _v$18, _p$.e));
                  _v$19 !== _p$.t && (_p$.t = setProp(_el$18, "fit", _v$19, _p$.t));
                  _v$20 !== _p$.a && (_p$.a = setProp(_el$19, "line_width", _v$20, _p$.a));
                  _v$21 !== _p$.o && (_p$.o = setProp(_el$20, "end", _v$21, _p$.o));
                  _v$22 !== _p$.i && (_p$.i = setProp(_el$20, "line_width", _v$22, _p$.i));
                  _v$23 !== _p$.n && (_p$.n = setProp(_el$21, "text", _v$23, _p$.n));
                  return _p$;
                }, {
                  e: undefined,
                  t: undefined,
                  a: undefined,
                  o: undefined,
                  i: undefined,
                  n: undefined
                });
                return _el$18;
              })(),
              _v$14 = hmUI__default.text_style.WRAP,
              _v$15 = progressDetail();
            _v$6 !== _p$.e && (_p$.e = setProp(_el$, "padding", _v$6, _p$.e));
            _v$7 !== _p$.t && (_p$.t = setProp(_el$2, "mainAxisAlignment", _v$7, _p$.t));
            _v$8 !== _p$.a && (_p$.a = setProp(_el$12, "h", _v$8, _p$.a));
            _v$9 !== _p$.o && (_p$.o = setProp(_el$13, "mainAxisAlignment", _v$9, _p$.o));
            _v$10 !== _p$.i && (_p$.i = setProp(_el$13, "crossAxisAlignment", _v$10, _p$.i));
            _v$11 !== _p$.n && (_p$.n = setProp(_el$14, "w", _v$11, _p$.n));
            _v$12 !== _p$.s && (_p$.s = setProp(_el$14, "h", _v$12, _p$.s));
            _v$13 !== _p$.h && (_p$.h = setProp(_el$14, "child", _v$13, _p$.h));
            _v$14 !== _p$.r && (_p$.r = setProp(_el$15, "text_style", _v$14, _p$.r));
            _v$15 !== _p$.d && (_p$.d = setProp(_el$15, "text", _v$15, _p$.d));
            return _p$;
          }, {
            e: undefined,
            t: undefined,
            a: undefined,
            o: undefined,
            i: undefined,
            n: undefined,
            s: undefined,
            h: undefined,
            r: undefined,
            d: undefined
          });
          return _el$;
        })();
      }, view);
      asuka.refreshSync();

      // setInterval(()=>{

      // }, 2000)
      this.request({
        method: "device.init",
        params: {}
      }).then(res => {
        setTransferingState(Conditions.WATING);
        // setTransferingState((s) => (s + 1) % 4);
      }).catch(e => {
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
      } else if (data.params.data === "TRANSFERING_TO_DEVICE") ; else if (data.params.data === "FAILED") {
        setTransferingState(Conditions.FAILED);
        setExtra(data.params.err);
      }
    } else if (data.method === "download.app_side.progress") {
      if (transferingState() === Conditions.DOWNLOADING) setProgress(data.params.data + "%");
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
    fileObj.on("progress", prog => {
      console.log("file progress => %j", JSON.stringify({
        totalSize: prog.data.fileSize,
        loadedSize: prog.data.loadedSize
      }));
      if (transferingState() === Conditions.TRANSFERING) setProgress("" + ~~(prog.data.loadedSize * 100 / prog.data.fileSize) + "%\n");
      setProgressDetail(`${prog.data.loadedSize} / ${prog.data.fileSize} Bytes`);
      asuka.refreshSync();
    });
    fileObj.on("change", event => {
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
            let {
              info,
              offset
            } = res;
            if (hmFS.readdirSync({
              path: `data://games`
            }) === undefined) {
              hmFS.mkdirSync({
                path: `data://games`
              });
            }
            setProgressDetail("正在解包(" + fileObj.filePath + ")...");
            let target_dir = `data://games/${info.data.uuid}`;
            if (hmFS.readdirSync({
              path: target_dir
            }) != undefined) {
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
                  onProgress: prog => {}
                });
              } catch (e) {
                setProgressDetail("解包失败:" + e);
                return;
              }
              setTransferingState(Conditions.SUCCESS);
              setProgress("100%");
              setProgressDetail(`安装完成\n游戏名:${info.data.name}\n版本号:${info.data.version}\n作者:${info.data.author}\n描述:${info.data.description}\nuuid:${info.data.uuid}`);
              asuka.refreshSync();
              addHzpk({
                uuid: info.data.uuid,
                name: info.data.name,
                version: info.data.version,
                author: info.data.author,
                description: info.data.description,
                install_utc: timeSensor.getTime(),
                install_date: `${timeSensor.getFullYear()}-${timeSensor.getMonth()}-${timeSensor.getDate()}`,
                dir: target_dir
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
  }
}));

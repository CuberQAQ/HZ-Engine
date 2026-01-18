import { c as createSignal, r as render, a as createElement, i as insertNode, b as insert, d as createComponent, S as Switch, M as Match, s as setProp, e as effect, m as memo, f as checkHzpk_v1, h as removeHzpkByUuid, u as unpackHzpk_v1, j as addHzpk } from "../shared/hzpk.chunk.js";
import { p as px$1 } from "../shared/dynamic_px.chunk.js";
import hmUI__default from "@zos/ui";
import hmFS__default from "@zos/fs";
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device";
import { Time } from "@zos/sensor";
import { setPageBrightTime } from "@zos/display";
import { A as AsukaUI, a as asukauiPlatformZeppos, N as NativeBindingsFactory, L as LayoutManagerFactory, E as EdgeInsets, M as MainAxisAlignment, C as CrossAxisAlignment, b as Alignment, S as StackFit, r as reportError } from "../shared/asukaui-platform-zeppos.chunk.js";
import "@zos/utils";
const e = Object.prototype.hasOwnProperty, t = { init() {
  this.plugins = [], this.settings = {}, this.mixins = [];
}, set(e2, t2) {
  if (1 === arguments.length) return this.settings[e2];
  this.settings[e2] = t2;
}, use(e2, ...t2) {
  return "function" == typeof e2 ? this.plugins.push({ handler: e2, args: t2 }) : "object" == typeof e2 && this.mixins.push({ handler: e2, args: t2 }), this;
}, handle(e2) {
  this.plugins.forEach(((t2) => {
    if (t2 && "function" == typeof t2.handler) try {
      const n2 = t2.handler.call(this, e2, ...t2.args);
      "object" == typeof n2 && this.mixins.push({ handler: n2, args: [] });
    } catch (e3) {
    }
  })), this.mixins.forEach((({ handler: { onInit: t2, onPause: n2, build: s2, onResume: o2, onDestroy: i2, onCreate: r2, ...l2 }, args: a2 }) => {
    Object.assign(e2, l2);
  }));
} };
function n() {
  return r() && o();
}
function s() {
  return r() && i();
}
function o() {
  return "undefined" != typeof hmApp;
}
function i() {
  return "undefined" != typeof __$$R$$__;
}
function r() {
  return o() || i();
}
let l = null;
l = "undefined" != typeof __$$R$$__ ? __$$R$$__ : () => ({});
let a = null;
function h({ state: e2 = {}, onInit: t2, onResume: n2, onPause: s2, build: o2, onDestroy: i2, ...r2 } = {}) {
  const l2 = { state: e2, ...r2, globalData: getApp()._options.globalData, onInit(...e3) {
    var _a;
    for (let t3 = 0; t3 <= h.mixins.length - 1; t3++) {
      const n3 = h.mixins[t3];
      n3 && ((_a = n3.handler.onInit) == null ? void 0 : _a.apply(this, e3));
    }
    t2 == null ? void 0 : t2.apply(this, e3);
  }, onResume(...e3) {
    var _a;
    for (let t3 = 0; t3 <= h.mixins.length - 1; t3++) {
      const n3 = h.mixins[t3];
      n3 && ((_a = n3.handler.onResume) == null ? void 0 : _a.apply(this, e3));
    }
    n2 == null ? void 0 : n2.apply(this, e3);
  }, onPause(...e3) {
    var _a;
    s2 == null ? void 0 : s2.apply(this, e3);
    for (let t3 = h.mixins.length - 1; t3 >= 0; t3--) {
      const n3 = h.mixins[t3];
      n3 && ((_a = n3.handler.onPause) == null ? void 0 : _a.apply(this, e3));
    }
  }, build(...e3) {
    var _a;
    for (let t3 = 0; t3 <= h.mixins.length - 1; t3++) {
      const n3 = h.mixins[t3];
      n3 && ((_a = n3.handler.build) == null ? void 0 : _a.apply(this, e3));
    }
    o2 == null ? void 0 : o2.apply(this, e3);
  }, onDestroy(...e3) {
    var _a;
    i2 == null ? void 0 : i2.apply(this, e3);
    for (let t3 = h.mixins.length - 1; t3 >= 0; t3--) {
      const n3 = h.mixins[t3];
      n3 && ((_a = n3.handler.onDestroy) == null ? void 0 : _a.apply(this, e3));
    }
  } };
  return h.handle(l2), l2;
}
var g, u;
n() ? a = DeviceRuntimeCore.HmLogger : s() ? a = l("@zos/utils").log : "undefined" != typeof messaging && "undefined" != typeof Logger && (a = Logger), g = h, u = t, Object.getOwnPropertyNames(u).forEach((function(t2) {
  if (!e.call(g, t2)) {
    var n2 = Object.getOwnPropertyDescriptor(u, t2);
    Object.defineProperty(g, t2, n2);
  }
})), h.init(), h.use((function() {
  return { onInit() {
    this.logger = a.getLogger(this.name || "Page"), this.log = (...e2) => {
      this.logger.log(...e2);
    }, this.error = (...e2) => {
      e2[0] instanceof Error ? this.logger.error(...e2) : this.logger.error({}, ...e2);
    }, this.debug = (...e2) => {
      this.logger.debug(...e2);
    };
  }, onCreate() {
    this.logger = a.getLogger(this.name || "app.js"), this.log = (...e2) => {
      this.logger.log(...e2);
    }, this.error = (...e2) => {
      e2[0] instanceof Error ? this.logger.error(...e2) : this.logger.error({}, ...e2);
    }, this.debug = (...e2) => {
      this.logger.debug(...e2);
    };
  } };
}));
class c {
  constructor(e2) {
    this.global = e2;
  }
  getValue(e2) {
    return this.global[e2];
  }
  setValue(e2, t2) {
    return this.global[e2] = t2;
  }
  deleteKey(e2) {
    delete this.global[e2];
  }
}
class p extends c {
  constructor() {
    super(__$$app$$__.__globals__.__scopedGlobals__);
  }
}
function f(e2, t2 = {}) {
  return this.request({ method: "http.request", params: e2 }, t2);
}
n() ? hmApp.getPackageInfo : s() && l("@zos/app").getPackageInfo, n() ? hmUI : s() && l("@zos/ui"), n() ? hmSetting : s() && l("@zos/settings"), n() ? px : l("@zos/utils").px, n() ? hmSetting.getDeviceInfo : s() && l("@zos/device").getDeviceInfo, n() ? "undefined" != typeof __$$app$$__ && __$$app$$__ : s() && l("@zos/i18n").getText, n() ? hmApp.gotoPage : s() && l("@zos/router").push;
let d = null;
n() ? d = hmApp : s() && (d = l("@zos/app")), l("@zos/timer").setTimeout, l("@zos/timer").clearTimeout;
const _ = globalThis.Promise;
h.use((function() {
  new p().getValue("_$mgr$_")[__$$module$$__.id] = {};
})).use((function(e2) {
  const t2 = (function() {
    const { messaging: e3 } = getApp()._options.globalData;
    return e3;
  })();
  return { onInit() {
    var _a, _b, _c;
    this.messaging = this.state.messaging = t2, this._onCall = (_a = this.onCall) == null ? void 0 : _a.bind(this), this._onRequest = (_b = this.onRequest) == null ? void 0 : _b.bind(this), this._onBleChanged = (_c = this.onBleChanged) == null ? void 0 : _c.bind(this), this.messaging.onCall(this._onCall).onRequest(this._onRequest).onBleChanged(this._onBleChanged);
  }, onDestroy() {
    this._onCall && this.messaging.offOnCall(this._onCall), this._onRequest && this.messaging.offOnRequest(this._onRequest), this._onBleChanged && this.messaging.offOnBleChanged(this._onBleChanged);
  }, request(e3, t3 = {}) {
    const n2 = (function() {
      const e4 = { canceled: false };
      return e4.promise = new _((function(t4, n3) {
        e4.resolve = t4, e4.reject = n3;
      })), e4.cancel = () => {
        e4.canceled = true, e4.reject(new Error("Task canceled"));
      }, e4;
    })(), s2 = (function() {
      let e4 = "";
      for (let t4 = 0; t4 < 12; t4++) e4 += 0 === t4 ? Math.floor(9 * Math.random()) + 1 : Math.floor(10 * Math.random());
      return e4;
    })(), o2 = "response:result:" + s2, i2 = "response:error:" + s2;
    return d.onMessage(o2, (function(e4, ...t4) {
      n2.resolve(...t4);
    })), d.onMessage(i2, (function(e4, ...t4) {
      n2.reject(...t4);
    })), this.messaging.request(e3, t3).then(((e4) => {
      d.postMessage(o2, e4);
    })).catch(((e4) => {
      d.postMessage(i2, e4);
    })).finally((() => {
      d.offMessage(o2), d.offMessage(i2);
    })), n2.promise;
  }, call(e3) {
    return this.messaging.call(e3);
  }, httpRequest: f };
})).use((function(e2) {
  const t2 = (function() {
    const { fileTransferLib: e3 } = getApp()._options.globalData;
    return e3;
  })();
  return { onInit() {
    var _a;
    this._onReceivedFile = (_a = this.onReceivedFile) == null ? void 0 : _a.bind(this), t2.onFile(this._onReceivedFile);
  }, onDestroy() {
    this._onReceivedFile && t2.offFile(this._onReceivedFile);
  }, sendFile: (e3, n2) => t2.sendFile(e3, n2) };
}));
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
let [progress, setProgress] = createSignal("0%");
let [progressDetail, setProgressDetail] = createSignal("");
var [transferingState, setTransferingState] = createSignal(Conditions.CONNECTING);
var [extra, setExtra] = createSignal("");
let asuka = new AsukaUI(asukauiPlatformZeppos);
Page(h({
  onInit() {
    console.log("page transfer init");
    setPageBrightTime({
      brightTime: 11451419
    });
  },
  build() {
    try {
      hmUI__default.setStatusBarVisible(false);
      console.log("page transfer building");
      asuka.registerNodeFactory(NativeBindingsFactory);
      asuka.registerNodeFactory(LayoutManagerFactory);
      let view = asuka.mountView(hmUI__default);
      render(() => {
        const _self$ = this;
        return (() => {
          var _el$ = createElement("padding"), _el$2 = createElement("column"), _el$12 = createElement("spacer"), _el$13 = createElement("row"), _el$14 = createElement("sizedbox"), _el$15 = createElement("text");
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
                    effect((_p$) => {
                      var _v$ = hmUI__default.align.CENTER_H, _v$2 = hmUI__default.text_style.WRAP;
                      _v$ !== _p$.e && (_p$.e = setProp(_el$5, "align_h", _v$, _p$.e));
                      _v$2 !== _p$.t && (_p$.t = setProp(_el$5, "text_style", _v$2, _p$.t));
                      return _p$;
                    }, {
                      e: void 0,
                      t: void 0
                    });
                    return _el$5;
                  })(), (() => {
                    var _el$6 = createElement("button");
                    setProp(_el$6, "text", "重新安装");
                    setProp(_el$6, "nc", 3355443);
                    setProp(_el$6, "pc", 5592405);
                    setProp(_el$6, "onclick", () => {
                      _self$.call("redownload", {});
                    });
                    effect((_p$) => {
                      var _v$3 = px$1(60), _v$4 = px$1(30), _v$5 = px$1(300);
                      _v$3 !== _p$.e && (_p$.e = setProp(_el$6, "h", _v$3, _p$.e));
                      _v$4 !== _p$.t && (_p$.t = setProp(_el$6, "r", _v$4, _p$.t));
                      _v$5 !== _p$.a && (_p$.a = setProp(_el$6, "w", _v$5, _p$.a));
                      return _p$;
                    }, {
                      e: void 0,
                      t: void 0,
                      a: void 0
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
              effect((_p$) => {
                var _v$16 = extra(), _v$17 = hmUI__default.text_style.WRAP;
                _v$16 !== _p$.e && (_p$.e = setProp(_el$17, "text", _v$16, _p$.e));
                _v$17 !== _p$.t && (_p$.t = setProp(_el$17, "text_style", _v$17, _p$.t));
                return _p$;
              }, {
                e: void 0,
                t: void 0
              });
              return _el$17;
            })() : null;
          })(), null);
          effect((_p$) => {
            var _v$6 = EdgeInsets.symmetric({
              horizontal: screenShape === SCREEN_SHAPE_ROUND ? px$1(40) : px$1(0)
            }), _v$7 = MainAxisAlignment.center, _v$8 = px$1(60), _v$9 = MainAxisAlignment.spaceEvenly, _v$10 = CrossAxisAlignment.center, _v$11 = px$1(160), _v$12 = px$1(160), _v$13 = (() => {
              var _el$18 = createElement("zstack"), _el$19 = createElement("arc"), _el$20 = createElement("arc"), _el$21 = createElement("text");
              insertNode(_el$18, _el$19);
              insertNode(_el$18, _el$20);
              insertNode(_el$18, _el$21);
              setProp(_el$19, "start", 0);
              setProp(_el$19, "end", 360);
              setProp(_el$19, "color", 3355443);
              setProp(_el$20, "start", 0);
              effect((_p$2) => {
                var _v$18 = Alignment.center, _v$19 = StackFit.expand, _v$20 = px$1(16), _v$21 = ~~(parseInt(progress()) / 100 * 360), _v$22 = px$1(16), _v$23 = progress();
                _v$18 !== _p$2.e && (_p$2.e = setProp(_el$18, "ali", _v$18, _p$2.e));
                _v$19 !== _p$2.t && (_p$2.t = setProp(_el$18, "fit", _v$19, _p$2.t));
                _v$20 !== _p$2.a && (_p$2.a = setProp(_el$19, "line_width", _v$20, _p$2.a));
                _v$21 !== _p$2.o && (_p$2.o = setProp(_el$20, "end", _v$21, _p$2.o));
                _v$22 !== _p$2.i && (_p$2.i = setProp(_el$20, "line_width", _v$22, _p$2.i));
                _v$23 !== _p$2.n && (_p$2.n = setProp(_el$21, "text", _v$23, _p$2.n));
                return _p$2;
              }, {
                e: void 0,
                t: void 0,
                a: void 0,
                o: void 0,
                i: void 0,
                n: void 0
              });
              return _el$18;
            })(), _v$14 = hmUI__default.text_style.WRAP, _v$15 = progressDetail();
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
            e: void 0,
            t: void 0,
            a: void 0,
            o: void 0,
            i: void 0,
            n: void 0,
            s: void 0,
            h: void 0,
            r: void 0,
            d: void 0
          });
          return _el$;
        })();
      }, view);
      asuka.refreshSync();
      this.request({
        method: "device.init",
        params: {}
      }).then((res) => {
        setTransferingState(Conditions.WATING);
      }).catch((e2) => {
        setTransferingState(Conditions.CONNECT_FAILED);
      });
      console.log("page render done");
    } catch (e2) {
      reportError("page error", e2);
    }
  },
  onDestroy() {
  },
  onRequest(req, res) {
    if (req.method === "download") {
      setUrl(req.params.url);
    }
    res(null, "OK");
  },
  onCall(data) {
    var _a;
    if (data.method === "download") {
      console.log(`Receive download request ${data.params.url}`);
      setUrl(data.params.url);
    } else if (data.method === "download.app_side.condition") {
      if (data.params.data === "DOWNLOADING") {
        setTransferingState(Conditions.DOWNLOADING);
        setProgress("0%");
        setProgressDetail("");
      } else if (data.params.data === "TRANSFERING_TO_DEVICE") ;
      else if (data.params.data === "FAILED") {
        setTransferingState(Conditions.FAILED);
        setExtra(data.params.err);
      }
    } else if (data.method === "download.app_side.progress") {
      if (transferingState() === Conditions.DOWNLOADING) setProgress(data.params.data + "%");
    } else if (data.method === "log") {
      console.log("[SIDE LOG]", ...(_a = data.params.args) != null ? _a : null);
    }
    asuka.refreshSync();
  },
  onReceivedFile(fileObj) {
    console.log("!!! onReceivedFile", JSON.stringify(fileObj));
    setTransferingState(Conditions.TRANSFERING);
    setProgressDetail("0 / 0 Bytes");
    setProgress("0%");
    asuka.refreshSync();
    fileObj.on("progress", (prog) => {
      console.log("file progress => %j", JSON.stringify({
        totalSize: prog.data.fileSize,
        loadedSize: prog.data.loadedSize
      }));
      if (transferingState() === Conditions.TRANSFERING) setProgress("" + ~~(prog.data.loadedSize * 100 / prog.data.fileSize) + "%\n");
      setProgressDetail(`${prog.data.loadedSize} / ${prog.data.fileSize} Bytes`);
      asuka.refreshSync();
    });
    fileObj.on("change", (event) => {
      console.log("file status =>", event.data.readyState);
      if (event.data.readyState === "transferred") {
        setTransferingState(Conditions.INSTALLING);
        setProgress("0%");
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
            if (hmFS__default.readdirSync({
              path: `data://games`
            }) === void 0) {
              hmFS__default.mkdirSync({
                path: `data://games`
              });
            }
            setProgressDetail("正在解包(" + fileObj.filePath + ")...");
            let target_dir = `data://games/${info.data.uuid}`;
            if (hmFS__default.readdirSync({
              path: target_dir
            }) != void 0) {
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
                  onProgress: (prog) => {
                  }
                });
              } catch (e2) {
                setProgressDetail("解包失败:" + e2);
                return;
              }
              setTransferingState(Conditions.SUCCESS);
              setProgress("100%");
              setProgressDetail(`安装完成
游戏名:${info.data.name}
版本号:${info.data.version}
作者:${info.data.author}
描述:${info.data.description}
uuid:${info.data.uuid}`);
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
      }
      asuka.refreshSync();
    });
  }
}));

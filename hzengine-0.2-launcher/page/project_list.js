import { r as render, c as createSignal, g as getHzpkList, a as createElement, i as insertNode, b as insert, d as createComponent, F as For, s as setProp, p as posix, e as effect } from "../shared/hzpk.chunk.js";
import { p as px } from "../shared/dynamic_px.chunk.js";
import hmUI__default from "@zos/ui";
import hmFS__default from "@zos/fs";
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device";
import * as hmRouter from "@zos/router";
import { A as AsukaUI, a as asukauiPlatformZeppos, N as NativeBindingsFactory, L as LayoutManagerFactory, b as Alignment, E as EdgeInsets, r as reportError } from "../shared/asukaui-platform-zeppos.chunk.js";
import "@zos/utils";
const {
  width,
  height,
  screenShape
} = getDeviceInfo();
const asuka = new AsukaUI(asukauiPlatformZeppos);
Page({
  build() {
    try {
      hmUI__default.setStatusBarVisible(false);
      console.log("page transfer building");
      asuka.registerNodeFactory(NativeBindingsFactory);
      asuka.registerNodeFactory(LayoutManagerFactory);
      let view = asuka.mountView(hmUI__default);
      render(() => {
        let [hzpk_list, setHzpk_list] = createSignal(getHzpkList());
        return (() => {
          var _el$ = createElement("padding"), _el$2 = createElement("vstack");
          insertNode(_el$, _el$2);
          insert(_el$2, createComponent(For, {
            get each() {
              return hzpk_list();
            },
            get fallback() {
              return (() => {
                var _el$3 = createElement("text");
                setProp(_el$3, "text", "暂无项目");
                return _el$3;
              })();
            },
            children: (item) => [(() => {
              var _el$4 = createElement("sized-box"), _el$5 = createElement("zstack"), _el$6 = createElement("button");
              insertNode(_el$4, _el$5);
              insertNode(_el$5, _el$6);
              setProp(_el$6, "nc", 3355443);
              setProp(_el$6, "pc", 5592405);
              setProp(_el$6, "onclick", () => {
                if (hmFS__default.readdirSync({
                  path: posix.join(item.dir, "save")
                }) == void 0) {
                  hmFS__default.mkdirSync({
                    path: posix.join(item.dir, "save")
                  });
                }
                if (hmFS__default.readdirSync({
                  path: posix.join(item.dir, "cache")
                }) == void 0) {
                  hmFS__default.mkdirSync({
                    path: posix.join(item.dir, "cache")
                  });
                }
                hmRouter.replace({
                  url: "page/hz",
                  params: JSON.stringify({
                    projectPath: item.dir,
                    cachePath: posix.join(item.dir, "cache"),
                    savePath: posix.join(item.dir, "save")
                  })
                });
              });
              setProp(_el$6, "onlongpress", () => {
              });
              effect((_p$) => {
                var _v$ = px(100), _v$2 = Alignment.center, _v$3 = px(10), _v$4 = item.name;
                _v$ !== _p$.e && (_p$.e = setProp(_el$4, "h", _v$, _p$.e));
                _v$2 !== _p$.t && (_p$.t = setProp(_el$5, "alignment", _v$2, _p$.t));
                _v$3 !== _p$.a && (_p$.a = setProp(_el$6, "radius", _v$3, _p$.a));
                _v$4 !== _p$.o && (_p$.o = setProp(_el$6, "text", _v$4, _p$.o));
                return _p$;
              }, {
                e: void 0,
                t: void 0,
                a: void 0,
                o: void 0
              });
              return _el$4;
            })(), (() => {
              var _el$7 = createElement("space");
              effect((_$p) => setProp(_el$7, "h", px(10), _$p));
              return _el$7;
            })()]
          }));
          effect((_$p) => setProp(_el$, "padding", EdgeInsets.symmetric({
            horizontal: screenShape === SCREEN_SHAPE_ROUND ? px(40) : px(0),
            vertical: screenShape === SCREEN_SHAPE_ROUND ? px(30) : px(0)
          }), _$p));
          return _el$;
        })();
      }, view);
      asuka.refreshSync();
    } catch (e) {
      reportError("page error", e);
    }
  },
  onDestroy() {
  }
});

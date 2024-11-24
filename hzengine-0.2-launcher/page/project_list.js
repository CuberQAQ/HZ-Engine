import { A as AsukaUI, N as NativeBindingsFactory, L as LayoutManagerFactory, r as render, c as createSignal, o as getHzpkList, a as createElement, i as insertNode, b as insert, d as createComponent, F as For, s as setProp, q as posix, e as effect, p as px, g as Alignment, E as EdgeInsets, j as reportError } from './hzpk-DlkgJGRA.js';
import hmUI__default from '@zos/ui';
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from '@zos/device';
import hmFS from '@zos/fs';
import * as hmRouter from '@zos/router';
import '@zos/utils';

const {
  width,
  height,
  screenShape
} = getDeviceInfo();
const asuka = new AsukaUI();
Page({
  build() {
    try {
      // 隐藏方屏设备的顶栏
      // hmUI.setStatusBarVisible(false);

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
        let [hzpk_list, setHzpk_list] = createSignal(getHzpkList());
        // throw new Error(JSON.stringify(hzpk_list()));
        return (() => {
          var _el$ = createElement("padding"),
            _el$2 = createElement("vstack");
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
            children: item => [(() => {
              var _el$4 = createElement("sized-box"),
                _el$5 = createElement("zstack"),
                _el$6 = createElement("button");
              insertNode(_el$4, _el$5);
              insertNode(_el$5, _el$6);
              setProp(_el$6, "nc", 0x333333);
              setProp(_el$6, "pc", 0x555555);
              setProp(_el$6, "onclick", () => {
                if (hmFS.readdirSync({
                  path: posix.join(item.dir, "save")
                }) == undefined) {
                  hmFS.mkdirSync({
                    path: posix.join(item.dir, "save")
                  });
                }
                if (hmFS.readdirSync({
                  path: posix.join(item.dir, "cache")
                }) == undefined) {
                  hmFS.mkdirSync({
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
              setProp(_el$6, "onlongpress", () => {});
              effect(_p$ => {
                var _v$ = px(100),
                  _v$2 = Alignment.center,
                  _v$3 = px(10),
                  _v$4 = item.name;
                _v$ !== _p$.e && (_p$.e = setProp(_el$4, "h", _v$, _p$.e));
                _v$2 !== _p$.t && (_p$.t = setProp(_el$5, "alignment", _v$2, _p$.t));
                _v$3 !== _p$.a && (_p$.a = setProp(_el$6, "radius", _v$3, _p$.a));
                _v$4 !== _p$.o && (_p$.o = setProp(_el$6, "text", _v$4, _p$.o));
                return _p$;
              }, {
                e: undefined,
                t: undefined,
                a: undefined,
                o: undefined
              });
              return _el$4;
            })(), (() => {
              var _el$7 = createElement("space");
              effect(_$p => setProp(_el$7, "h", px(10), _$p));
              return _el$7;
            })()]
          }));
          effect(_$p => setProp(_el$, "padding", EdgeInsets.symmetric({
            horizontal: screenShape === SCREEN_SHAPE_ROUND ? px(40) : px(0)
          }), _$p));
          return _el$;
        })();
      }, view);
      asuka.refreshSync();

      // let data = null;
      // data = hmFS.readFileSync({
      //   path: "data://hzpk_list.json",
      //   options: { encoding: "utf8" },
      // });
      // if (typeof data !== "string") {
      //   hmUI.createWidget(hmUI.widget.TEXT, {
      //     x: 0,
      //     y: 0,
      //     w: width,
      //     h: height,
      //     text: "请先安装视觉小说项目",
      //     color: 0xeeeeee,
      //     align_h: hmUI.align.CENTER_H,
      //     align_v: hmUI.align.CENTER_V,
      //     text_size: px(32),
      //   });
      //   return;
      // }
      // data = JSON.parse(data);

      // hmRouter.replace({
      //   url: "page/hz",
      //   params: JSON.stringify({
      //     projectPath: data.dir,
      //     cachePath: path.join(data.dir, "cache"),
      //     savePath: path.join(data.dir, "save"),
      //   }),
      // });
    } catch (e) {
      reportError("page error", e);
    }
  },
  onDestroy() {}
});

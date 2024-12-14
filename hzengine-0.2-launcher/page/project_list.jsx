import path from "../shared/path.js";
import {
  Alignment,
  AsukaUI,
  EdgeInsets,
  LayoutManagerFactory,
  // NativeBindingsFactory,
  reportError,
} from "@cuberqaq/asuka-ui";
import { NativeBindingsFactory } from "@cuberqaq/asuka-ui/zeppos"
import {
  createSignal,
  For,
  render,

} from '@cuberqaq/asuka-ui/solid'
const { width, height, screenShape } = getDeviceInfo();
import { px } from "../shared/dynamic_px.js";
import hmUI from "@zos/ui";
import hmFS from "@zos/fs";
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device";
import * as hmRouter from "@zos/router";
import {
  addHzpk,
  checkHzpk_v1,
  getHzpkList,
  removeHzpkByUuid,
  unpackHzpk_v1,
} from "../shared/hzpk.js";
import asukauiPlatformZeppos from "../shared/asukaui-platform-zeppos.js";

var designWidth = 480;
const asuka = new AsukaUI(asukauiPlatformZeppos);

Page({
  build() {
    try {
      // 隐藏方屏设备的顶栏
      // hmUI.setStatusBarVisible(false);

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
        let [hzpk_list, setHzpk_list] = createSignal(getHzpkList());
        // throw new Error(JSON.stringify(hzpk_list()));
        return (
          <padding
            padding={EdgeInsets.symmetric({
              horizontal: screenShape === SCREEN_SHAPE_ROUND ? px(40) : px(0),
            })}
          >
            <vstack>
              <For each={hzpk_list()} fallback={<text text="暂无项目" />}>
                {(item) => (
                  <>
                    <sized-box h={px(100)}>
                      <zstack alignment={Alignment.center}>
                        <button
                          // h={px(80)}
                          radius={px(10)}
                          nc={0x333333}
                          pc={0x555555}
                          text={item.name}
                          onclick={() => {
                            if (
                              hmFS.readdirSync({
                                path: path.join(item.dir, "save"),
                              }) == undefined
                            ) {
                              hmFS.mkdirSync({
                                path: path.join(item.dir, "save"),
                              });
                            }
                            if (
                              hmFS.readdirSync({
                                path: path.join(item.dir, "cache"),
                              }) == undefined
                            ) {
                              hmFS.mkdirSync({
                                path: path.join(item.dir, "cache"),
                              });
                            }
                            hmRouter.replace({
                              url: "page/hz",
                              params: JSON.stringify({
                                projectPath: item.dir,
                                cachePath: path.join(item.dir, "cache"),
                                savePath: path.join(item.dir, "save"),
                              }),
                            });
                          }}
                          onlongpress={() => {}}
                        />

                        {/* <fillrect color={0x333333} radius={px(20)} />
                      <padding
                        padding={EdgeInsets.symmetric({
                          horizontal: px(20),
                          vertical: px(10),
                        })}
                      >
                        <column
                          mainAxisAlignment={MainAxisAlignment.spaceBetween}
                          crossAxisAlignment={CrossAxisAlignment.start}
                        >
                          <text
                            text={item.name}
                            text_size={px(36)}
                            text_style={hmUI.text_style.WRAP}
                          />
                          <text
                            text={item.version}
                            text_size={px(32)}
                            color={0x999999}
                            text_style={hmUI.text_style.WRAP}
                          />
                        </column>
                      </padding> */}
                      </zstack>
                    </sized-box>
                    <space h={px(10)} />
                  </>
                )}
              </For>
            </vstack>
          </padding>
        );
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
  onDestroy() {},
});

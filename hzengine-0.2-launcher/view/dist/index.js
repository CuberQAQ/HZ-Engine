import * as hmUI from '@zos/ui';
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from '@zos/device';
import { UI, Async } from 'hzengine-core';
import { getText } from '@zos/i18n';
import { store, render, createComponent, createElement, insertNode, createTextNode, setProp } from '@cuberqaq/asuka-ui/solid';
import { AsukaUI } from '@cuberqaq/asuka-ui';

const {
  width: width$3,
  height: height$3,
  screenShape: screenShape$3
} = getDeviceInfo();
var designWidth = 480;
function px(raw) {
  return Math.ceil(raw / designWidth * width$3);
}

var util = {
  isString: x => typeof x === "string",
  // 检查是否为字符串
  isObject: x => typeof x === "object"
  // 检查是否为对象
};
function isProtocolPath(path) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(path);
}
function extractProtocol(path) {
  const match = path.match(/^([a-zA-Z][a-zA-Z\d+\-.]*):\/\/(.*)$/);
  if (match) {
    return {
      protocol: match[1],
      // 获取协议
      filepath: match[2]
      // 获取文件路径
    };
  }
  return {
    protocol: null,
    filepath: path
  };
}
function normalizeArray(parts, allowAboveRoot) {
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (!p || p === ".") continue;
    if (p === "..") {
      if (res.length && res[res.length - 1] !== "..") {
        res.pop();
      } else if (allowAboveRoot) {
        res.push("..");
      }
    } else {
      res.push(p);
    }
  }
  return res;
}
function trimArray(arr) {
  var lastIndex = arr.length - 1;
  var start = 0;
  for (; start <= lastIndex; start++) {
    if (arr[start]) break;
  }
  var end = lastIndex;
  for (; end >= 0; end--) {
    if (arr[end]) break;
  }
  if (start === 0 && end === lastIndex) return arr;
  if (start > end) return [];
  return arr.slice(start, end + 1);
}
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var posix = {};
function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}
posix.resolve = function () {
  var resolvedPath = "",
    resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : process.cwd();
    if (!util.isString(path)) {
      throw new TypeError("Arguments to path.resolve must be strings");
    } else if (!path) {
      continue;
    }
    if (isProtocolPath(path)) {
      const {
        protocol,
        filepath
      } = extractProtocol(path);
      resolvedPath = filepath + "/" + resolvedPath;
      resolvedAbsolute = true;
    } else {
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path[0] === "/";
    }
  }
  resolvedPath = normalizeArray(resolvedPath.split("/"), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
};
posix.normalize = function (path) {
  if (isProtocolPath(path)) {
    const {
      protocol,
      filepath
    } = extractProtocol(path);
    return protocol + "://" + normalizeArray(filepath.split("/")).join("/");
  }
  var isAbsolute = posix.isAbsolute(path),
    trailingSlash = path && path[path.length - 1] === "/";
  path = normalizeArray(path.split("/"), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
    path = ".";
  }
  if (path && trailingSlash) {
    path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
};
posix.isAbsolute = function (path) {
  return path.charAt(0) === "/";
};
posix.join = function () {
  var path = "";
  for (var i = 0; i < arguments.length; i++) {
    var segment = arguments[i];
    if (!util.isString(segment)) {
      throw new TypeError("Arguments to path.join must be strings");
    }
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += "/" + segment;
      }
    }
  }
  return posix.normalize(path);
};
posix.relative = function (from, to) {
  from = posix.resolve(from).substr(1);
  to = posix.resolve(to).substr(1);
  var fromParts = trimArray(from.split("/"));
  var toParts = trimArray(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
};
posix.dirname = function (path) {
  var result = posixSplitPath(path),
    root = result[0],
    dir = result[1];
  if (!root && !dir) {
    return ".";
  }
  if (dir) {
    dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
};
posix.basename = function (path, ext) {
  var f = posixSplitPath(path)[2];
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};
posix.extname = function (path) {
  return posixSplitPath(path)[3];
};
posix.format = function (pathObject) {
  if (!util.isObject(pathObject)) {
    throw new TypeError("Parameter 'pathObject' must be an object, not " + typeof pathObject);
  }
  var root = pathObject.root || "";
  if (!util.isString(root)) {
    throw new TypeError("'pathObject.root' must be a string or undefined, not " + typeof pathObject.root);
  }
  var dir = pathObject.dir ? pathObject.dir + posix.sep : "";
  var base = pathObject.base || "";
  return dir + base;
};
posix.parse = function (pathString) {
  if (!util.isString(pathString)) {
    throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
  }
  var allParts = posixSplitPath(pathString);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError("Invalid path '" + pathString + "'");
  }
  allParts[1] = allParts[1] || "";
  allParts[2] = allParts[2] || "";
  allParts[3] = allParts[3] || "";
  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  };
};
posix.sep = "/";
posix.delimiter = ":";

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
const {
  width: width$2,
  height: height$2,
  screenShape: screenShape$2
} = getDeviceInfo();
class CustomSayView extends UI.MessageView {
  constructor() {
    super(...arguments);
    // _fx: Fx | null = null;
    __publicField$3(this, "_widgets", null);
    __publicField$3(this, "enableAnim", true);
    __publicField$3(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
    __publicField$3(this, "_what", null);
    __publicField$3(this, "_animationPlugin", this.core.plugins.get("animation") ?? null);
    __publicField$3(this, "_animationId", null);
  }
  onCreate(prop) {
    let w = screenShape$2 === SCREEN_SHAPE_SQUARE ? width$2 : width$2;
    let h = screenShape$2 === SCREEN_SHAPE_SQUARE ? height$2 / 2 : height$2 / 2;
    this._what = prop.what;
    this._widgets = {
      bg: this._widgetFactory.createWidget(hmUI.widget.IMG, {
        x: (width$2 - w) / 2,
        y: height$2 / 2,
        w,
        h,
        src: posix.join(this.core.storage.projectRoot, "gui", "say_bg.png"),
        auto_scale: true
        // alpha: 128, // only 3.0 support
      }),
      who_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width$2 - w) / 2 + px(10),
        y: height$2 / 2,
        w: w - Number(px(20)),
        h: px(50),
        text_size: px(40),
        color: 16777215,
        text: prop.who
      }),
      what_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width$2 - w) / 2 + px(10),
        y: height$2 / 2 + Number(px(50)),
        w: w - Number(px(20)),
        h: height$2 - Number(px(50)),
        text_size: px(36),
        color: 15921906,
        align_v: hmUI.align.TOP,
        align_h: hmUI.align.CENTER_H,
        text: this.enableAnim ? "" : prop.what,
        text_style: hmUI.text_style.WRAP
      })
    };
    this._widgets.bg.setEnable(false);
    this._widgets.who_text.setEnable(false);
    this._widgets.what_text.setEnable(false);
    this.enableAnim && this._buildAnim();
  }
  onCommit(prop) {
    this._clearAnim();
    this._widgets.who_text.setProperty(hmUI.prop.TEXT, prop.who);
    this._widgets.what_text.setProperty(hmUI.prop.TEXT, this.enableAnim ? "" : prop.what);
    this._what = prop.what;
    this.enableAnim && this._buildAnim();
  }
  onDestroy() {
    this._clearAnim();
    hmUI.deleteWidget(this._widgets.bg);
    hmUI.deleteWidget(this._widgets.who_text);
    hmUI.deleteWidget(this._widgets.what_text);
  }
  _buildAnim() {
    this._clearAnim();
    if (!this._animationPlugin) {
      this.core.debug.log("[SayView]", "Animation Plugin not found");
    }
    Async.nextTick(() => {
      this._animationId = this._animationPlugin?.createTempAnimation({
        profile: [{
          frame: {
            len: 0
          }
        }, {
          time: this._what.length * 0.06,
          wrapper: "linear",
          frame: {
            len: this._what.length
          }
        }],
        onFrame: props => {
          this._widgets?.what_text.setProperty(hmUI.prop.TEXT, this._what?.slice(0, ~~props.len));
        },
        onEnd: () => {
          this.core.debug.log("[SayView]", "\u6253\u5B57\u673A\u7ED3\u675F");
        }
      }) ?? null;
    });
  }
  _clearAnim() {
    if (this._animationId) {
      this._animationPlugin?.clearTempAnimation(this._animationId);
      this._animationId = null;
    }
  }
}
class FgImgView extends UI.FgImgView {
  constructor() {
    super(...arguments);
    __publicField$3(this, "_widget", null);
    __publicField$3(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
    __publicField$3(this, "defaultProp", {
      yanchor: -1,
      yalign: -1
    });
  }
  onCreate(prop) {
    let position = this.core.ui.calcPosition({
      ...this.defaultProp,
      ...prop
    }, prop.size).origin;
    this._widget = this._widgetFactory.createWidget(hmUI.widget.IMG, {
      // x: (width - prop.size.width) / 2 + prop.offset.x,
      // y: prop.offset.y,
      ...position,
      src: prop.imgPath,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255)
      }
    });
  }
  onCommit(prop) {
    let position = this.core.ui.calcPosition({
      ...this.defaultProp,
      ...prop
    }, prop.size).origin;
    this._widget.setProperty(hmUI.prop.MORE, {
      // x: (width - prop.size.width) / 2 + prop.offset.x,
      // y: prop.offset.y,
      ...position,
      src: prop.imgPath,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255)
      }
    });
  }
  onDestroy() {
    hmUI.deleteWidget(this._widget);
    this._widget = null;
  }
}
class BgImgView extends UI.BgImgView {
  constructor() {
    super(...arguments);
    __publicField$3(this, "_widget", null);
    __publicField$3(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
  }
  _calSize(size) {
    if (size.height >= size.width) {
      let rate = size.height / size.width;
      return {
        width: Number(px(480)),
        height: Number(px(480)) * rate
      };
    } else {
      let rate = size.width / size.height;
      return {
        width: Number(px(480)) * rate,
        height: Number(px(480))
      };
    }
  }
  onCreate(prop) {
    let size = this._calSize(prop.size);
    let position = this.core.ui.calcPosition(prop, size).origin;
    this._widget = this._widgetFactory.createWidget(hmUI.widget.IMG, {
      // x: (width - size.width) / 2 + prop.offset.x,
      // y: (height - size.height) / 2 + prop.offset.y,
      ...position,
      w: size.width,
      h: size.height,
      src: prop.imgPath,
      auto_scale: true,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255)
      }
    });
  }
  onCommit(prop) {
    let size = this._calSize(prop.size);
    let position = this.core.ui.calcPosition(prop, size).origin;
    this._widget.setProperty(hmUI.prop.MORE, {
      // x: (width - size.width) / 2 + prop.offset.x,
      // y: (height - size.height) / 2 + prop.offset.y,
      ...position,
      w: size.width,
      h: size.height,
      src: prop.imgPath,
      auto_scale: true,
      ...{
        alpha: prop.alpha && ~~(prop.alpha * 255)
      }
    });
  }
  onDestroy() {
    hmUI.deleteWidget(this._widget);
    this._widget = null;
  }
}
class MenuView extends UI.MenuView {
  constructor() {
    super(...arguments);
    __publicField$3(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
    __publicField$3(this, "_buttonWidgetList", null);
  }
  _hideButtons() {
    if (this._buttonWidgetList) {
      for (let i = 0; i < this._buttonWidgetList.length; i++) {
        hmUI.deleteWidget(this._buttonWidgetList[i]);
      }
      this._buttonWidgetList = null;
    }
  }
  _createButtons(prop) {
    this._buttonWidgetList = [];
    let y = Number(px(30));
    const h = Number(px(60));
    const w = Number(px(300));
    const v_space = Number(px(20));
    for (let i = 0; i < prop.itemList.length; i++) {
      let itemProp = prop.itemList[i];
      let display = true;
      if (itemProp.enable_js_expression) {
        let res = this.core.script.evalExpression(itemProp.enable_js_expression);
        if (typeof res !== "boolean") {
          throw `Menu View: enable_js_expression return value must be boolean, but got ${typeof res}`;
        }
        display = res;
      }
      let getClickFunc = (index, jump_position) => {
        return () => {
          this.core.script.jump(jump_position[0], jump_position[1] + 1);
          let router = this.core.ui.getRouter("menu");
          if (!router) {
            throw "menu router not found";
          }
          router.pop();
          this.core.system.unBlock();
        };
      };
      if (display) {
        let button = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
          x: (width$2 - w) / 2,
          y,
          w,
          h,
          text: itemProp.text,
          text_size: px(36),
          normal_color: 4473924,
          press_color: 6710886,
          click_func: getClickFunc(i, [...itemProp.position])
        });
        button.setAlpha(200);
        this._buttonWidgetList.push(button);
        y += h + v_space;
      }
    }
  }
  onCreate(prop) {
    if (this._buttonWidgetList) {
      this._hideButtons();
    }
    this._createButtons(prop);
  }
  onCommit(prop) {
    if (this._buttonWidgetList) {
      this._hideButtons();
    }
    this._createButtons(prop);
  }
  onDestroy() {
    if (this._buttonWidgetList) {
      this._hideButtons();
    }
  }
}

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
const {
  width: width$1,
  height: height$1,
  screenShape: screenShape$1
} = getDeviceInfo();
class TitleView extends UI.View {
  constructor() {
    super(...arguments);
    __publicField$2(this, "_widgets", null);
    __publicField$2(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
    __publicField$2(this, "_animationPlugin", this.core.plugins.get("animation") ?? null);
    __publicField$2(this, "_animation", null);
    __publicField$2(this, "enable_anim", true);
    __publicField$2(this, "enable_opening_anim", true);
    __publicField$2(this, "opening_view_id", null);
  }
  onCreate(prop) {
    {
      let w = width$1;
      let h = Number(px(60));
      let props = {
        x: (width$1 - w) / 2,
        y: Number(px(40)),
        w,
        h,
        text_size: px(40),
        color: 16777215,
        text: prop.title,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V
      };
      this._widgets = {
        title_text: this._widgetFactory.createWidget(hmUI.widget.TEXT, props)
      };
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$1 - w) / 2;
      let y = Number(px(130));
      this._widgets.button_start = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        radius: px(15),
        text: getText("start_game"),
        text_size: px(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          let black_trans_plugin = this.core.plugins.get("black_trans");
          let start = cb => {
            this.core.ui.getRouter("page").clear();
            this.core.system.start();
            cb && Async.nextTick(cb);
          };
          if (!black_trans_plugin) {
            this.core.debug.log("[TitleView]", "black_trans plugin not found");
            start();
          } else {
            black_trans_plugin.show({
              cb: () => start(() => {
                black_trans_plugin.hide({});
              })
            });
          }
        }
      });
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$1 - w) / 2;
      let y = Number(px(210));
      this._widgets.button_load = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        radius: px(15),
        text: getText("continue_game"),
        text_size: px(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          try {
            this.core.storage.loadArchiveData("archive000.json");
          } catch (e) {
            this.core.debug.log("[TitleView]", "\u8ACB\u5148\u958B\u59CB\u904A\u6232");
            throw e;
          }
          this.core.ui.getRouter("page").pop();
        }
      });
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$1 - w) / 2;
      let y = Number(px(290));
      this._widgets.button_gallery = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        radius: px(15),
        text: getText("gallery"),
        text_size: px(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          hmUI.showToast({
            text: "\u65BD\u5DE5\u4E2D..."
          });
          this.core.ui.getRouter("page").push("gallery", {});
        }
      });
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width$1 - w) / 2;
      let y = Number(px(370));
      this._widgets.button_settings = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        radius: px(15),
        text: getText("settings"),
        text_size: px(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          hmUI.showToast({
            text: "\u65BD\u5DE5\u4E2D..."
          });
          this.core.ui.getRouter("page").push("settings", {});
        }
      });
    }
    if (this._animationPlugin) {
      if (this.enable_opening_anim) {
        this.opening_view_id = this.core.ui.createView("info_opening", this.layer, {
          bg_alpha: 1,
          logo_alpha: 0
        }, this.isSave).id;
        let animation = this._animationPlugin.createTempAnimation({
          profile: [{
            frame: {
              bg_alpha: 1,
              logo_alpha: 0
            }
          }, {
            time: 0.5
          }, {
            time: 0.45,
            wrapper: "easein",
            frame: {
              logo_alpha: 1
            }
          }, {
            time: 0.3
          }, {
            time: 1,
            wrapper: "easeout",
            frame: {
              bg_alpha: 0,
              logo_alpha: 0
            }
          }],
          onFrame: prop2 => {
            let view = this.core.ui.getView(this.opening_view_id);
            if (!view) this._animationPlugin?.clearTempAnimation(animation);else view.commit(prop2);
          },
          onEnd: () => {
            let view = this.core.ui.getView(this.opening_view_id);
            if (!view) return;
            this.core.ui.destroyView(view);
          }
        });
      }
    }
    if (this.enable_anim) this._buildAnim();
  }
  onCommit(prop) {
    this._widgets.title_text.setProperty(hmUI.prop.TEXT, prop.title);
  }
  onDestroy() {
    hmUI.deleteWidget(this._widgets.title_text);
    hmUI.deleteWidget(this._widgets.button_start);
    hmUI.deleteWidget(this._widgets.button_load);
    hmUI.deleteWidget(this._widgets.button_gallery);
    hmUI.deleteWidget(this._widgets.button_settings);
    this._widgets = null;
    let view = this.core.ui.getView(this.opening_view_id);
    if (!view) return;
    this.core.ui.destroyView(view);
  }
  _buildAnim() {
    if (!this._animationPlugin) {
      this.core.debug.log("[Title View]", "Animation Plugin not found");
      return;
    }
    if (this._animation != null) return;
    let getFadeinTrack = (delay, key, duration = 0.55) => {
      return [{
        frame: {
          [`${key}_alpha`]: 0,
          [`${key}_xoffset`]: 200
        }
      }, {
        time: delay
      }, {
        time: duration,
        wrapper: "easein",
        frame: {
          [`${key}_alpha`]: 1,
          [`${key}_xoffset`]: 0
        }
      }];
    };
    let delayList = Array(5).fill(0).map((_, i) => i * 0.16 + 1.5);
    this._animation = this._animationPlugin.createTempAnimation({
      profile: [getFadeinTrack(delayList[0], "text"), getFadeinTrack(delayList[1], "button_start"), getFadeinTrack(delayList[2], "button_load"), getFadeinTrack(delayList[3], "button_gallery"), getFadeinTrack(delayList[4], "button_settings")],
      onFrame: props => {
        let w = Number(px(320));
        let x = (width$1 - w) / 2;
        if (!this._widgets) this._clearAnim();
        this._widgets.title_text.setAlpha(~~((props.text_alpha ?? 1) * 255));
        this._widgets.title_text.setProperty(hmUI.prop.X, ~~(props.text_xoffset ?? 0));
        this._widgets.button_start.setAlpha(~~((props.button_start_alpha ?? 1) * 255));
        this._widgets.button_start.setProperty(hmUI.prop.X, ~~(x + (props.button_start_xoffset ?? 0)));
        this._widgets.button_load.setAlpha(~~((props.button_load_alpha ?? 1) * 255));
        this._widgets.button_load.setProperty(hmUI.prop.X, ~~(x + (props.button_load_xoffset ?? 0)));
        this._widgets.button_gallery.setAlpha(~~((props.button_gallery_alpha ?? 1) * 255));
        this._widgets.button_gallery.setProperty(hmUI.prop.X, ~~(x + (props.button_gallery_xoffset ?? 0)));
        this._widgets.button_settings.setAlpha(~~((props.button_settings_alpha ?? 1) * 255));
        this._widgets.button_settings.setProperty(hmUI.prop.X, ~~(x + (props.button_settings_xoffset ?? 0)));
      }
    });
  }
  _clearAnim() {
    if (this._animation != null) {
      this._animationPlugin.clearTempAnimation(this._animation);
      this._animation = null;
    }
  }
}
class InfoOpening extends UI.View {
  constructor() {
    super(...arguments);
    __publicField$2(this, "_widgets", {});
    __publicField$2(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
  }
  onCreate(prop) {
    this._widgets.bg = this._widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width$1,
      h: height$1,
      color: 0
    });
    this._widgets.logo = this._widgetFactory.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 0,
      w: width$1,
      h: height$1,
      text_size: px(42),
      text: "HZ-Engine Demo",
      color: 15658734,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    });
    this._widgets.bg.setAlpha(~~((prop?.bg_alpha ?? 1) * 255));
    this._widgets.logo.setAlpha(~~((prop?.logo_alpha ?? 1) * 255));
  }
  onCommit(prop) {
    this._widgets.bg.setAlpha(~~((prop?.bg_alpha ?? 1) * 255));
    this._widgets.logo.setAlpha(~~((prop?.logo_alpha ?? 1) * 255));
  }
  onDestroy() {
    hmUI.deleteWidget(this._widgets.bg);
    hmUI.deleteWidget(this._widgets.logo);
  }
}

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
const {
  width,
  height,
  screenShape
} = getDeviceInfo();
class QuickMenu extends UI.View {
  constructor() {
    super(...arguments);
    __publicField$1(this, "_widgets", null);
    __publicField$1(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
  }
  onCreate(prop) {
    this._widgets = {};
    {
      this._widgets.mask = this._widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: width,
        h: height,
        color: 0,
        alpha: 192
      });
    }
    {
      let w = width;
      let h = Number(px(60));
      this._widgets.title_text = this._widgetFactory.createWidget(hmUI.widget.TEXT, {
        x: (width - w) / 2,
        y: Number(px(40)),
        w,
        h,
        text_size: px(40),
        color: 16777215,
        text: getText("quick_menu"),
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V
      });
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width - w) / 2;
      let y = Number(px(130));
      this._widgets.button_start = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        text: getText("quick_save"),
        text_size: px(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          if (this.core.storage.projectRoot == null) {
            hmUI.showToast({
              text: "\u8BF7\u5148\u6253\u5F00\u9879\u76EE"
            });
            return;
          }
          try {
            this.core.storage.saveArchiveData("archive_quick.json");
          } catch (e) {
            hmUI.showToast({
              text: "\u5FEB\u901F\u5B58\u6863\u5931\u8D25"
            });
            this.core.debug.log("[QuickMenu]", `quick save failed, error: 
${e}`);
            throw e;
          }
          hmUI.showToast({
            text: "\u5FEB\u901F\u5B58\u6863\u6210\u529F"
          });
        }
      });
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width - w) / 2;
      let y = Number(px(210));
      this._widgets.button_load = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        text: getText("quick_load"),
        text_size: px(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          if (this.core.storage.projectRoot == null) {
            hmUI.showToast({
              text: "\u8BF7\u5148\u6253\u5F00\u9879\u76EE"
            });
            return;
          }
          try {
            this.core.storage.loadArchiveData("archive_quick.json");
          } catch (e) {
            hmUI.showToast({
              text: "\u5FEB\u901F\u8BFB\u6863\u5931\u8D25"
            });
            this.core.debug.log("[QuickMenu]", `quick load failed, error: 
${e}`);
            throw e;
          }
          hmUI.showToast({
            text: "\u5FEB\u901F\u8BFB\u6863\u6210\u529F"
          });
          this.core.ui.getRouter("page").pop();
        }
      });
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width - w) / 2;
      let y = Number(px(290));
      this._widgets.button_gallery = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        text: getText("archive_page"),
        text_size: px(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          hmUI.showToast({
            text: "\u65BD\u5DE5\u4E2D..."
          });
        }
      });
    }
    {
      let w = Number(px(320));
      let h = Number(px(60));
      let x = (width - w) / 2;
      let y = Number(px(370));
      this._widgets.button_settings = this._widgetFactory.createWidget(hmUI.widget.BUTTON, {
        x,
        y,
        w,
        h,
        text: getText("settings"),
        text_size: px(36),
        normal_color: 3355443,
        press_color: 5592405,
        click_func: () => {
          hmUI.showToast({
            text: "\u65BD\u5DE5\u4E2D..."
          });
        }
      });
    }
  }
  onCommit(prop) {}
  onDestroy() {
    hmUI.deleteWidget(this._widgets.mask);
    hmUI.deleteWidget(this._widgets.title_text);
    hmUI.deleteWidget(this._widgets.button_start);
    hmUI.deleteWidget(this._widgets.button_load);
    hmUI.deleteWidget(this._widgets.button_gallery);
    hmUI.deleteWidget(this._widgets.button_settings);
    this._widgets = null;
  }
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
function TestPage(core) {
  registerAsukaPage(core, "asukaTestPage", () => {
    return (() => {
      var _el$ = createElement("button");
      insertNode(_el$, createTextNode(`asukaTestPage`));
      setProp(_el$, "text", "Hello Asuka Page!");
      setProp(_el$, "width", 200);
      setProp(_el$, "height", 100);
      return _el$;
    })();
  });
}
var asuka = null;
function registerAsukaPage(core, name, Component) {
  if (!asuka) {
    asuka = new AsukaUI();
  }
  class AsukaView extends UI.View {
    constructor() {
      super(...arguments);
      __publicField(this, "disposeFunc", null);
      __publicField(this, "_widgetFactory", this.core.ui.getLayer(this.layer).widgetFactory);
      __publicField(this, "rootView", null);
      __publicField(this, "store");
    }
    onCreate(prop) {
      this.rootView = asuka.mountView(this._widgetFactory);
      this.store = store.createStore(prop);
      this.disposeFunc = render(() => createComponent(Component, prop), this.rootView);
    }
    onCommit(prop) {
      throw new Error("Method not implemented.");
    }
    onDestroy() {
      throw new Error("Method not implemented.");
    }
  }
  core.ui.registerView(name, AsukaView);
}

function ViewPlugin(core) {
  core.ui.registerView("say", CustomSayView);
  core.ui.registerView("fg_img", FgImgView);
  core.ui.registerView("bg_img", BgImgView);
  core.ui.registerView("menu", MenuView);
  core.ui.registerView("title", TitleView);
  core.ui.registerView("quick_menu", QuickMenu);
  core.ui.registerView("info_opening", InfoOpening);
  TestPage(core);
}

export { ViewPlugin as default };

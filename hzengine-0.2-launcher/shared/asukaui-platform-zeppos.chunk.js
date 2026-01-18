var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _key;
import * as hmUI from "@zos/ui";
import hmUI__default from "@zos/ui";
import { px } from "@zos/utils";
import { getDeviceInfo } from "@zos/device";
function assert(success) {
  try {
    if (typeof success === "function")
      success = success();
    if (!success) {
      throw Error("Assert Failed");
    }
  } catch (e) {
    reportError("Assert Failed", e);
  }
}
function reportError(extra, err) {
  console.log("Reporting Error...", extra);
  throw err;
}
function min(a, b) {
  return a <= b ? a : b;
}
function max(a, b) {
  return a >= b ? a : b;
}
class Constraints {
  constructor({ minHeight = 0, maxHeight = Number.POSITIVE_INFINITY, minWidth = 0, maxWidth = Number.POSITIVE_INFINITY }) {
    __publicField(this, "minHeight");
    __publicField(this, "maxHeight");
    __publicField(this, "minWidth");
    __publicField(this, "maxWidth");
    if (isNaN(minHeight != null ? minHeight : NaN))
      minHeight = 0;
    if (isNaN(minWidth != null ? minWidth : NaN))
      minWidth = 0;
    if (isNaN(maxHeight != null ? maxHeight : NaN))
      maxHeight = 0;
    if (isNaN(maxWidth != null ? maxWidth : NaN))
      maxWidth = 0;
    if (minHeight < 0)
      minHeight = 0;
    if (minWidth < 0)
      minWidth = 0;
    if (maxHeight < minHeight)
      maxHeight = minHeight;
    if (maxWidth < minWidth)
      maxWidth = minWidth;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
  }
  /**
   * **创建一个严格约束**
   * @description 给定一个`Size`对象，返回一个`Constraints`对象，
   * 使得满足该`Constraints`约束的`Size`仅有给定的`Size`一种
   * @param size
   * @returns
   */
  static createTight(size) {
    return new Constraints({
      minWidth: size.w,
      maxWidth: size.w,
      minHeight: size.h,
      maxHeight: size.h
    });
  }
  static isValid(constraints) {
    var _a, _b, _c, _d;
    return constraints != null && !(isNaN((_a = constraints.minHeight) != null ? _a : NaN) || isNaN((_b = constraints.minWidth) != null ? _b : NaN) || isNaN((_c = constraints.maxHeight) != null ? _c : NaN) || isNaN((_d = constraints.maxWidth) != null ? _d : NaN)) && constraints.minHeight >= 0 && constraints.minWidth >= 0 && constraints.minHeight <= constraints.maxHeight && constraints.minWidth <= constraints.maxWidth;
  }
  static copy(constraints) {
    return new Constraints({
      minWidth: constraints.minWidth,
      maxWidth: constraints.maxWidth,
      minHeight: constraints.minHeight,
      maxHeight: constraints.maxHeight
    });
  }
  copy() {
    return new Constraints({
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight
    });
  }
  /**
   * 返回一个新的约束对象，使其在遵守原约束对象的同时尽可能向指定的长宽缩进
   * @param param0
   */
  tighten({ width, height }) {
    let constraints = this.copy();
    if (width !== void 0) {
      if (width > this.minWidth)
        constraints.minWidth = min(width, this.maxWidth);
      if (width < this.maxWidth)
        constraints.maxWidth = max(width, this.minWidth);
    }
    if (height !== void 0) {
      if (height > this.minHeight)
        constraints.minHeight = min(height, this.maxHeight);
      if (height < this.maxHeight)
        constraints.maxHeight = max(height, this.minHeight);
    }
    return constraints;
  }
  /**
   * **约束操作**
   * @description
   * 将给定的Size对象以最小改动约束至该Constraints
   *
   * **将直接修改源对象**
   * @param size 需要约束的Size对象
   */
  constrain(size) {
    if (size.w < this.minWidth)
      size.w = this.minWidth;
    else if (size.w > this.maxWidth)
      size.w = this.maxWidth;
    if (size.h < this.minHeight)
      size.h = this.minHeight;
    else if (size.h > this.maxHeight)
      size.h = this.maxHeight;
    return size;
  }
  /**
   * **适应操作**
   * @description
   * 将该Constraints通过最小改动符合给定的Constraints
   *
   * **将直接修改源对象**
   * @param size 需要约束的Size对象
   */
  adoptBy(constrain) {
    assert(Constraints.isValid(constrain));
    if (this.minWidth < constrain.minWidth)
      this.minWidth = constrain.minWidth;
    else if (this.minWidth > constrain.maxWidth)
      this.minWidth = constrain.maxWidth;
    if (this.maxWidth > constrain.maxWidth)
      this.maxWidth = constrain.maxWidth;
    else if (this.maxWidth < constrain.minWidth)
      this.maxWidth = constrain.minWidth;
    if (this.minHeight < constrain.minHeight)
      this.minHeight = constrain.minHeight;
    else if (this.minHeight > constrain.maxHeight)
      this.minHeight = constrain.maxHeight;
    if (this.maxHeight > constrain.maxHeight)
      this.maxHeight = constrain.maxHeight;
    else if (this.maxHeight < constrain.minHeight)
      this.maxHeight = constrain.minHeight;
    return this;
  }
  /**
   * **宽松化**
   * @description
   * 将`minHeight`和`minWidth`的限制去除（设为0），返回一个新Constrains对象，不会改变原Constrains对象
   * @returns 宽松化后的Constrains对象
   */
  loose() {
    return new Constraints({
      maxHeight: this.maxHeight,
      maxWidth: this.maxWidth
    });
  }
  /**
   * **返回符合该约束的最大尺寸**
   */
  get biggest() {
    return {
      w: this.maxWidth,
      h: this.maxHeight
    };
  }
  /**
   * **返回符合该约束的最小尺寸**
   */
  get smallest() {
    return {
      w: this.minWidth,
      h: this.minHeight
    };
  }
  /**
   * **是否为严格约束**
   * @description
   * 即`minHeight`与`maxHeight`是否相等，且`minWidth`与`maxWidth`是否相等
   */
  get isTight() {
    return this.minHeight === this.maxHeight && this.minWidth === this.maxWidth;
  }
  /**
   * **判断两个Constrains对象是否相等**
   * @description
   * 当两个Constrains对象的`minHeight`、`maxHeight`、`minWidth`、`maxWidth`均相等时，返回true，否则为false
   * @param other 另一个Constrains对象
   * @returns 两个Constraints是否相等（当other参数为null时始终返回false）
   */
  equals(other) {
    return other != null && other.minHeight === this.minHeight && other.maxHeight === this.maxHeight && other.minWidth === this.minWidth && other.maxWidth === this.maxWidth;
  }
  toString() {
    return JSON.stringify({
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight
    });
  }
  /**
   * **检测一个`Size`对象是否符合本约束要求**
   * @param size 要检测的`Size`对象
   */
  testSize(size) {
    return size.h >= this.minHeight && size.h <= this.maxHeight && size.w >= this.minWidth && size.w <= this.maxWidth;
  }
}
class Size {
  static equals(size1, size2) {
    if (size1 == null && size2 == null)
      return true;
    else if (size1 == null || size2 == null)
      return false;
    return size1.w === size2.w && size1.h === size2.h;
  }
  static isValid(size) {
    return size != null && size.h >= 0 && size.w >= 0 && isFinite(size.h) && isFinite(size.w);
  }
  /**
   * **判断一个`Size`对象是不是有穷的**
   * @param size 要判断的`Size`对象
   * @returns 是否有穷
   */
  static isFinite(size) {
    return Number.isFinite(size.w) && Number.isFinite(size.h);
  }
  static copy(size) {
    assert(size != null);
    return { ...size };
  }
  /**
   * **分别相加两个`Size`对象的长和宽，并返回一个新对象.**
   *
   * 注意
   * - 传递空值会报错，但没判断是否合法.
   * @param size1
   * @param size2
   * @returns 累加后的新对象
   */
  static add(size1, size2) {
    assert(size1 != null && size2 != null);
    return {
      w: size1.w + size2.w,
      h: size1.h + size2.h
    };
  }
  /**
   * **分别相减两个`Size`对象的长和宽，并返回一个新对象.**
   *
   * 注意
   * - 传递空值会报错，但没判断是否合法.
   * @param size1
   * @param size2
   * @returns 累加后的新对象
   */
  static remove(size1, size2) {
    assert(size1 != null && size2 != null);
    return {
      w: size1.w - size2.w,
      h: size1.h - size2.h
    };
  }
  static get infinite() {
    return {
      w: Number.POSITIVE_INFINITY,
      h: Number.POSITIVE_INFINITY
    };
  }
}
class Coordinate {
  static copy(coord) {
    assert(coord != null);
    return { ...coord };
  }
  static isValid(coord) {
    return coord != null && isFinite(coord.x) && isFinite(coord.y);
  }
  static origin() {
    return { x: 0, y: 0 };
  }
  static equals(coord1, coord2) {
    if (coord1 == null && coord2 == null)
      return true;
    else if (coord1 == null || coord2 == null)
      return false;
    return coord1.x === coord2.x && coord1.y === coord2.y;
  }
  /**
   * **分别相加两个`Coordinate`对象的`x`和`y`，并返回一个新对象.**
   *
   * 注意
   * - 传递空值会报错，但没判断是否合法.
   * @param coord1
   * @param coord2
   * @returns 累加后的新对象
   */
  static add(coord1, coord2) {
    assert(coord1 != null && coord2 != null);
    return {
      x: coord1.x + coord2.x,
      y: coord1.y + coord2.y
    };
  }
}
class Alignment {
  /**
   * **创建对齐**
   * @param x [-1.0,1.0] 当-1为最左 0为中 1为最右
   * @param y [-1.0,1.0] 当-1为最上 0为中 1为最下
   */
  constructor(x, y) {
    __publicField(this, "_x", 0);
    __publicField(this, "_y", 0);
    if (x) {
      this._x = min(max(x, -1), 1);
    }
    if (y) {
      this._y = min(max(y, -1), 1);
    }
  }
  /**
   * **创建对齐**
   * @param x [-1.0,1.0] 当-1为最左 0为中 1为最右
   * @param y [-1.0,1.0] 当-1为最上 0为中 1为最下
   */
  static create(x, y) {
    return new Alignment(x, y);
  }
  static get topLeft() {
    return new Alignment(-1, -1);
  }
  static get top() {
    return new Alignment(0, -1);
  }
  static get topRight() {
    return new Alignment(1, -1);
  }
  static get centerLeft() {
    return new Alignment(-1, 0);
  }
  static get center() {
    return new Alignment(0, 0);
  }
  static get centerRight() {
    return new Alignment(1, 0);
  }
  static get bottomLeft() {
    return new Alignment(-1, 1);
  }
  static get bottom() {
    return new Alignment(0, 1);
  }
  static get bottomRight() {
    return new Alignment(1, 1);
  }
  /**
   * **计算子偏移量**
   *
   * 根据两个尺寸（一个父一个子），计算子满足该`Alignment`对象时相对父的坐标坐标
   * @param parentSize 父尺寸
   * @param childSize 子尺寸
   * @returns 子相对父的偏移坐标
   * @todo 加上子大于父的判断
   */
  calcOffset(parentSize, childSize) {
    let emptySize = Size.remove(parentSize, childSize);
    return {
      x: emptySize.w / 2 * (1 + this._x),
      y: emptySize.h / 2 * (1 + this._y)
    };
  }
  static copy(alignment) {
    return new Alignment(alignment._x, alignment._y);
  }
}
var Axis;
(function(Axis2) {
  Axis2[Axis2["horizontal"] = 0] = "horizontal";
  Axis2[Axis2["vertical"] = 1] = "vertical";
})(Axis || (Axis = {}));
function flipAxis(axis) {
  return axis === Axis.horizontal ? Axis.vertical : Axis.horizontal;
}
var MainAxisAlignment;
(function(MainAxisAlignment2) {
  MainAxisAlignment2[MainAxisAlignment2["start"] = 0] = "start";
  MainAxisAlignment2[MainAxisAlignment2["end"] = 1] = "end";
  MainAxisAlignment2[MainAxisAlignment2["center"] = 2] = "center";
  MainAxisAlignment2[MainAxisAlignment2["spaceBetween"] = 3] = "spaceBetween";
  MainAxisAlignment2[MainAxisAlignment2["spaceAround"] = 4] = "spaceAround";
  MainAxisAlignment2[MainAxisAlignment2["spaceEvenly"] = 5] = "spaceEvenly";
})(MainAxisAlignment || (MainAxisAlignment = {}));
var CrossAxisAlignment;
(function(CrossAxisAlignment2) {
  CrossAxisAlignment2[CrossAxisAlignment2["start"] = 0] = "start";
  CrossAxisAlignment2[CrossAxisAlignment2["end"] = 1] = "end";
  CrossAxisAlignment2[CrossAxisAlignment2["center"] = 2] = "center";
  CrossAxisAlignment2[CrossAxisAlignment2["stretch"] = 3] = "stretch";
  CrossAxisAlignment2[CrossAxisAlignment2["baseline"] = 4] = "baseline";
})(CrossAxisAlignment || (CrossAxisAlignment = {}));
var MainAxisSize;
(function(MainAxisSize2) {
  MainAxisSize2[MainAxisSize2["min"] = 0] = "min";
  MainAxisSize2[MainAxisSize2["max"] = 1] = "max";
})(MainAxisSize || (MainAxisSize = {}));
var HorizontalDirection;
(function(HorizontalDirection2) {
  HorizontalDirection2[HorizontalDirection2["ltr"] = 0] = "ltr";
  HorizontalDirection2[HorizontalDirection2["rtl"] = 1] = "rtl";
})(HorizontalDirection || (HorizontalDirection = {}));
var VerticalDirection;
(function(VerticalDirection2) {
  VerticalDirection2[VerticalDirection2["up"] = 0] = "up";
  VerticalDirection2[VerticalDirection2["down"] = 1] = "down";
})(VerticalDirection || (VerticalDirection = {}));
var TextBaseline;
(function(TextBaseline2) {
  TextBaseline2[TextBaseline2["alphabetic"] = 0] = "alphabetic";
  TextBaseline2[TextBaseline2["ideographic"] = 1] = "ideographic";
})(TextBaseline || (TextBaseline = {}));
var FlexFit;
(function(FlexFit2) {
  FlexFit2[FlexFit2["tight"] = 0] = "tight";
  FlexFit2[FlexFit2["loose"] = 1] = "loose";
})(FlexFit || (FlexFit = {}));
class EdgeInsets {
  constructor({ left, up, right, down }) {
    __publicField(this, "_left");
    __publicField(this, "_up");
    __publicField(this, "_right");
    __publicField(this, "_down");
    this._left = left;
    this._up = up;
    this._right = right;
    this._down = down;
  }
  static all(value) {
    return new EdgeInsets({
      left: value,
      up: value,
      right: value,
      down: value
    });
  }
  static only(value) {
    var _a, _b, _c, _d;
    return new EdgeInsets({
      left: (_a = value == null ? void 0 : value.left) != null ? _a : 0,
      up: (_b = value == null ? void 0 : value.up) != null ? _b : 0,
      right: (_c = value == null ? void 0 : value.right) != null ? _c : 0,
      down: (_d = value == null ? void 0 : value.down) != null ? _d : 0
    });
  }
  static symmetric({ vertical, horizontal }) {
    return new EdgeInsets({
      left: horizontal != null ? horizontal : 0,
      up: vertical != null ? vertical : 0,
      right: horizontal != null ? horizontal : 0,
      down: vertical != null ? vertical : 0
    });
  }
  static get zero() {
    return EdgeInsets.only();
  }
  equals(e) {
    if (e == null)
      return false;
    return this._left === e._left && this._down === e._down && this._right === e._right && this._up === e._up;
  }
  get horizontalTotal() {
    return this._left + this._right;
  }
  get verticalTotal() {
    return this._up + this._down;
  }
  getInnerConstraints(outterConstraints) {
    return new Constraints({
      minWidth: outterConstraints.minWidth - this.horizontalTotal,
      maxWidth: outterConstraints.maxWidth - this.horizontalTotal,
      minHeight: outterConstraints.minHeight - this.verticalTotal,
      maxHeight: outterConstraints.maxHeight - this.verticalTotal
    });
  }
  /**
   * **获取仅包含padding占用空间的`Size`对象**
   */
  get totalSizeWithoutInner() {
    return {
      w: this.horizontalTotal,
      h: this.verticalTotal
    };
  }
  getOutterSize(innerSize) {
    return {
      w: innerSize.w + this.horizontalTotal,
      h: innerSize.h + this.verticalTotal
    };
  }
  get innerOffset() {
    return {
      x: this._left,
      y: this._up
    };
  }
}
var StackFit;
(function(StackFit2) {
  StackFit2[StackFit2["loose"] = 0] = "loose";
  StackFit2[StackFit2["expand"] = 1] = "expand";
  StackFit2[StackFit2["passthrough"] = 2] = "passthrough";
})(StackFit || (StackFit = {}));
const NodeType = {
  TEXT_NODE: 1,
  RENDER_NODE: 2,
  UNKNOWN_NODE: 4
};
function isRenderNode(node) {
  return node === null ? false : node.nodeType === NodeType.RENDER_NODE;
}
function isTextNode(node) {
  return node === null ? false : node.nodeType === NodeType.TEXT_NODE;
}
function splice(arr, ref, add, byValueOnly) {
  let i = arr ? findWhere(arr, ref, true, byValueOnly) : -1;
  if (~i)
    arr.splice(i, 1);
  return i;
}
function findWhere(arr, ref, returnIndex, byValueOnly) {
  let i = arr.length;
  while (i--)
    if (typeof ref !== "function" || byValueOnly ? arr[i] === ref : ref(arr[i]))
      break;
  return i;
}
class AsukaNode {
  // /** 直接前继节点 */
  // public previousSibling: AsukaNode | null = null;
  // /** 直接后继节点 */
  // public nextSibling: AsukaNode | null = null;
  constructor(nodeType, nodeName) {
    __publicField(this, "nodeType");
    __publicField(this, "nodeName");
    /** 父节点 */
    __publicField(this, "parentNode", null);
    /**
     * **父节点数据插槽**
     * @description
     * 用于存储父节点希望子节点存储的信息。
     *
     * 由于子模型无关、布局算法高度自定义等特点，出现父节点需要子节点存储数据的情况十分常见，故提供本插槽属性。
     * 将在`mountChild`时调用的`_setupMountingChild`中赋值为`{}`(空对象)进行初始化，并在`unmountChild`时调用的`_setupUnmounting`中赋值为`null`进行清除。
     * 其他任何时候，框架不会访问或改变它。
     *
     * 举例：多个采用双向链表存储子节点时诸如`nextSibling`，`previousSibling`等。
     */
    __publicField(this, "parentData");
    this.nodeType = nodeType;
    this.nodeName = nodeName;
  }
  get nextSibling() {
    if (this.parentNode === null)
      return null;
    return this.parentNode.getChildNextSibling(this);
  }
  /**------------------属性设置------------------- */
  /**
   * **设置元素属性**
   * @param key 属性键
   * @param value 属性值
   */
  setProperty(key, value) {
  }
  setProperties(props) {
    for (const key in props) {
      this.setProperty(key, props[key]);
    }
  }
}
class AsukaTextNode extends AsukaNode {
  constructor(text) {
    super(NodeType.TEXT_NODE, "#text");
    __publicField(this, "_text");
    this._text = text;
  }
  /**
   * 该文字节点保存的字符串
   */
  set data(text) {
    this._text = text;
  }
  get data() {
    return this._text;
  }
  get firstChild() {
    return null;
  }
  getChildNextSibling(child) {
    return null;
  }
  mountChild(child, ref) {
    return false;
  }
  unmountChild(child) {
    return false;
  }
}
class AsukaUnknownNode extends AsukaNode {
  constructor() {
    super(NodeType.UNKNOWN_NODE, "#unknown");
  }
  get firstChild() {
    return null;
  }
  getChildNextSibling(child) {
    return null;
  }
  mountChild(child, ref) {
    return false;
  }
  unmountChild(child) {
    return false;
  }
}
class RenderNode extends AsukaNode {
  // protected _attributes: {};
  constructor(nodeTyle, nodeName) {
    super(nodeTyle || NodeType.RENDER_NODE, nodeName);
    __publicField(this, "_handlers", {});
    // {
    //   if (ref) splice(this.childNodes, ref, child);
    //   else this.childNodes.push(child);
    //   this._setupChild(child)
    //   return child;
    // }
    /**------------------布局相关------------------- */
    /**
     * **需要布局(布局脏标记)**
     *
     * 框架应保证执行布局操作时，所有非孤立且拥有布局脏标记的节点的`layout`都被调用，并将脏标记清除，并且应迅速(在下一个JS事件循环时)
     * 若为孤立且拥有脏标记的节点，在转为非孤立状态后应立即请求布局，并在下一个JS事件循环时调用其`layout`，并清除脏标记。
     *
     * 框架保证，拥有脏标记的节点在`layout`过程中，其`performLayout`被调用（如果`sizedByParent`为`true`，还保证其`performResize`被调用）。
     * 通常，所有可能使布局发生变化的操作，都应当做布局脏标记(调用`markNeedsLayout`)
     */
    __publicField(this, "_needsLayout", false);
    /**
     * **需要确认最终位置(放置脏标记)**
     *
     * 框架应保证执行确认最终位置操作(简称放置操作)时，所有非孤立且拥有放置脏标记的节点的`place`都被调用，并将脏标记清除，并且应迅速(在下一个JS事件循环时)
     * 若为孤立且拥有脏标记的节点，在转为非孤立状态后应立即请求放置，并在下一个JS事件循环时调用其`place`，并清除脏标记。
     *
     * 框架保证，拥有脏标记的节点在`place`过程中，其`position`会得到更新，并根据情况执行`performCommit`操作.
     *
     * @see markNeedsPlace 更多有关`放置脏标记`的原理，请参见该方法
     */
    __publicField(this, "_needsPlace", false);
    /**
     * **必须执行推送操作(强制更新标记)**
     *
     * 框架应保证所有非孤立且拥有强制更新标记的节点的`performCommit`和`onCommit`都被调用，并将该标记清除，并且应迅速(在下一个JS事件循环时，`place`过程中)
     * 若为孤立且拥有脏标记的节点，在转为非孤立状态后应立即请求放置，并在下一个JS事件循环时的`place`时执行推送操作，并清除脏标记。
     */
    __publicField(this, "_mustCommit", false);
    /**
     * **本节点的深度**
     *
     * 定义`AsukaUI`的深度为`0`.
     *
     * 仅当`_attached`为`true`，即不为孤立节点时有效
     *
     * 主要用于在`AsukaUI`执行`layout`和`place`操作时确定先后顺序（深度小的节点先，深度大的节点后），保证不重复计算并正确.
     *
     * 在`attach`时更新
     */
    __publicField(this, "_depth", 0);
    /**
     * **本节点尺寸**
     *
     * 请勿直接修改本属性，而是通过`size`(getter/setter)修改或访问
     */
    __publicField(this, "_size", null);
    /**
     * **本节点尺寸是否已改变**
     *
     * 用途：
     * - 在`size`setter中判断并标记为`true`.
     * - 在`place`方法中用于判断是否需要执行`performCommit`操作，并将其标记为`false`
     */
    __publicField(this, "_sizeChanged", false);
    /**
     * **相对父节点的坐标偏移**
     *
     * 请勿直接修改本属性，而是通过`offset`(getter/setter)修改或访问
     */
    __publicField(this, "_offset", null);
    /**
     * **该节点在当前坐标系的位置**
     *
     * 请勿直接修改本属性，而是通过`position`(getter/setter)修改或访问
     */
    __publicField(this, "_position", null);
    /**
     * **局部重布局边界**
     * @description
     * 当子树添加脏标记时，重布局边界节点不会调用`markParentNeedsLayout`将脏标记传递给父节点；
     * 而是阻止向上传递，（非孤立时）向框架中心请求布局，并将自身加入待布局列表。
     *
     * 无论是否孤立，若`_relayoutBoundary`不为`null`，就应保证该属性指向的节点与本节点连通。
     *
     * 局部重布局边界需要保证其子树的布局发生变化时(不考虑挂载等非布局操作)，不会影响其父节点的布局结果，即父节点不需要重新布局。
     *
     * 具体而言，满足以下四种条件其一的节点，可作为为局部重布局边界。
     * 1. `sizedByParent == true` 由于布局过程从子节点传递到父节点的信息仅有子节点尺寸，且该节点的尺寸仅由父节点提供的布局约束有关，
     * 因此，该节点的子树的布局发生变化时，父节点的布局结果不变，可作为为局部重布局边界。
     * 2. `parentUsesSize == false` 父节点布局过程不计算和使用子节点尺寸，也就是子节点子树发生的任何布局变化即使令该子节点的尺寸发生变化，
     * 也不影响父节点的布局结果。
     * 3. `constraints.isTight` 父节点传递的布局约束为严格约束（最大和最小宽度相等且最大和最小高度相等，符合该约束的尺寸仅有一种），
     * 4. `!isRenderNode(this.parentNode)` 父节点不是可渲染节点，故布局只能从本节点开始。
     *
     */
    __publicField(this, "_relayoutBoundary", null);
    /**
     * **为子节点提供新的坐标系**
     * @description
     * 若为`false`, 子节点的`position`将等于其`offset`加上本节点的`position`；
     * 若为`true`，子节点的`position`将直接等于其`offset`（相当于本节点为子节点的坐标系原点）
     *
     * 用于如`ViewContainer`这样的为子节点提供了新的坐标参考系的组件中
     *
     * **请务必在对象初始化完成前确定，后续不应再修改**，若为`true`，
     *
     * 请考虑在`performLayout`中调用子节点的`layout`时传递为子节点提供的控件工厂(可能是`hmUI.widget.GROUP`或`VIEW_CONTAINER`之类的实例).
     */
    __publicField(this, "isNewCoordOrigin", false);
    /**
     * **上一次`layout`时获得的控件工厂**
     * @description
     * 所谓控件工厂，是指`hmUI`、`GROUP`实例或`VIEW_CONTAINER`实例等，拥有符合接口要求的`createWidget`和`deleteWidget`的方法的对象。
     * 请注意区分`hmUI`中的其他方法，控件工厂不一定都实现了这些方法。
     *
     * 在下一次`layout`或取消挂载或转为孤立树等发生前有效。
     */
    __publicField(this, "_widgetFactory", null);
    /**
     * **上一次`layout()`时获得的布局约束**
     * @description 布局约束，是指该节点的尺寸的允许范围。
     * 布局约束由`minHeight`，`maxHeight`，`minWidth`和`maxWidth`四个属性构成，详见`Constraints`
     *
     * 应仅当从未布局过时为`null`，其它任何时候都不得将该变量设置为空.
     */
    __publicField(this, "_constraints", null);
    /**
     * **渲染就绪状态**
     *
     * 即子节点是否被挂载在可渲染的树上（即根节点是否连接了AsukaUI）
     *
     * 仅当该属性为`true`时，才注册重新布局请求(即调用 `AsukaUI#addRelayoutNode` 或 `AsukaUI#requestRelayout` 方法)
     */
    __publicField(this, "_attached", false);
    /**
     * **框架中心**
     * @description
     * 提供处理布局、放置请求，处理基本默认事件，管理活动视图等核心任务。
     *
     * 仅当`this._attach`为`true`时，才允许调用其`AsukaUI#addRelayoutNode` 或 `AsukaUI#requestRelayout` 等方法
     *
     * 目前由AsukaUI创建节点时设置，不应自行修改)
     *
     */
    __publicField(this, "_core", null);
    /**
     * **布局尺寸仅由父节点传递的约束决定**
     * @description
     * 该节点的Size是否只与父节点传递的Constrains有关，而不与其它任何因素（如子节点的布局）有关。
     *
     * 换句话说，当父节点传递的布局约束不变时，本节点的子树无论发生产生何种布局变化，本节点的布局尺寸都不变，
     * 父节点就不需要重新布局（布局尺寸是父节点在布局时会参考子节点的唯一因素）
     *
     * 设置为`true`时，该节点将被标记为重布局边界(RelayoutBoundary)，其及其子节点产生的任何布局脏标记都不会传递给父节点，从而实现优化。
     * **如果为`true`，请在`performResize`中计算本节点的布局尺寸，不要在`performLayout`里做出任何计算或改变布局尺寸的操作。**
     *
     * 该属性由子类自行按需设置。
     * 除了对象初始化完成前，**请在改变本属性后调用`markSizedByParentChanged`，**保证布局结果得到正确更新。
     */
    __publicField(this, "sizedByParent", false);
  }
  /**------------------事件处理------------------- */
  /**
   * **添加事件处理器**
   * @param type 事件类型，不区分大小写
   * @param handler 事件处理函数
   */
  addEventListener(type, handler) {
    type = type.toLowerCase();
    (this._handlers[type] || (this._handlers[type] = [])).push(handler);
  }
  /**
   * **删除事件处理器**
   * @param type 事件类型，不区分大小写
   * @param handler 事件处理函数
   */
  removeEventListener(type, handler) {
    type = type.toLowerCase();
    splice(this._handlers[type], handler, void 0, true);
  }
  /**
   * **触发事件**
   * @description 如果要添加默认操作，请在调用本方法后判断`event.defaultPrevented`并决定是否执行默认操作
   * @param event 事件对象
   * @returns
   */
  dispatchEvent(event) {
    let target = event.target || (event.target = this), cancelable = event.cancelable, handlers, i;
    do {
      event.currentTarget = target;
      handlers = target._handlers && target._handlers[event.type];
      if (handlers)
        for (i = handlers.length; i--; ) {
          handlers[i].call(target, event);
          if (cancelable && event._end)
            break;
        }
    } while (event.bubbles && !(cancelable && event._stop) && (target = target.parentNode));
    return handlers != null;
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    if (key.startsWith("on")) {
      this.addEventListener(key.slice(2), value);
    }
  }
  /**------------------挂载操作------------------- */
  /**
   *  **当元素被挂载到Element树上**
   * @description
   * 即当被作为`mountChild()`的参数并成为子节点时调用。调用时parentNode已为新父元素。
   */
  onMount() {
  }
  /**
   *  **当元素被从Element树上取消挂载**
   * @description
   * 即当被作为`unmountChild()`的参数时调用。调用时parentNode已为null。
   */
  onUnmount() {
  }
  /**
   *  **当元素与`AsukaUI`连接（不再孤立）**
   * @description
   * 通常被`attach`调用
   */
  onAttach() {
  }
  /**
   *  **当元素不再与`AsukaUI`连接（变为孤立）**
   * @description
   * 通常被`detach`调用
   */
  onDetach() {
  }
  /**
   * **当元素所在树由孤立变为可渲染(即渲染树不与AsukaUI连接)**
   * @description
   * 该方法会通过`visitChildren`遍历所有的子`RenderNode`，并调用它们的`attach`方法、更新节点深度.
   *
   * 本方法需要传递attach调用给子节点以保证子节点`_attached`的正确性。
   *
   * 本方法还需要检测部分边界情况，并作处理。
   * - 当`_attached`为`false`时，也就是该节点未连接到一个可以允许子节点绘制的根节点上（也就是处于“孤立状态”），
   * 在此期间，若该节点的布局因为某些原因（比如回调事件或者布局相关的属性的变化）需要更新布局，由于处于孤立状态，本节点无法进行布局，
   * 更新布局的需求产生了对`markNeedsLayout`的调用，使`_needsLayout`为`true`，若该子节点的`_relayoutBoundary`不为`null`，
   * 则会一直调用`markParentNeedsLayout`直到到达重布局节点，但由于`_attached`为`false`，该节点无法向`AsukaUI`发出重布局请求。
   * 倘若该重布局节点并不是此孤立树的根节点，重新挂载后，由于`mountChild`仅调用挂载父节点的`markNeedsLayout`，
   * 而该重布局节点上方的节点不一定有重布局的需要(可能在其`layout`过程中因为`_needsLayout`为`false`且新传递的约束与之前相同而直接剪枝优化，
   * 而不向下传递`layout`调用)，因此可能导致该节点`_needsLayout`为`true`，却无法得到重新布局。
   * 所以当这种子节点被重新`attach`时，需要使其向`AsukaUI`发送布局请求。
   * - 当`_attached`为`false`时，由于某种原因产生对`markNeedsPlace`的调用类似. 不过`markNeedsPlace`不向上传递脏标记，因此思路较为简单
   */
  attach() {
    assert(!this._attached);
    assert(this.parentNode != null && this.parentNode._depth !== void 0);
    this._attached = true;
    this._depth = this.parentNode._depth + 1;
    assert(() => {
      if (this._relayoutBoundary === null && this._needsLayout && this.parentNode !== null && isRenderNode(this.parentNode)) {
        assert(this.parentNode._needsLayout);
      }
      return true;
    });
    if (this._needsLayout && this._relayoutBoundary !== null) {
      this._needsLayout = false;
      this.markNeedsLayout();
    }
    if (this._needsPlace) {
      this._needsPlace = false;
      this.markNeedsPlace();
    }
    this.onAttach();
    this.visitChildren((child) => child.attach());
  }
  /**
   * **当元素所在树由可渲染变为孤立(即渲染树与AsukaUI连接)**
   * @description
   */
  detach() {
    assert(this._attached);
    this._attached = false;
    this.visitChildren((child) => child.detach());
    this.onDetach();
  }
  /**
   * **初始化挂载的子节点**
   * @description
   * 用于挂载节点时设置子节点的插槽属性(parentNode和parentData)等，并将本节点布局标记为脏.
   *
   * **请在使用parentData和parentNode前调用**
   *
   * 通常被`mountChild`调用.
   *
   * @param child 要设置的子节点
   */
  _setupMountingChild(child) {
    child.parentNode = this;
    child.parentData = {};
    this.markNeedsLayout();
    if (isRenderNode(child)) {
      if (this._attached)
        child.attach();
      child.onMount();
    }
  }
  /**
   * **设置取消挂载的子节点**
   * @description
   * 用于取消挂载节点时设置子节点的插槽属性(parentNode和parentData)，并清除子树上即将失效(也就是指向本节点或者本节点的祖先)的`_relayoutBoundary`。
   *
   * **请在不使用parentData和parentNode时调用**
   *
   * 通常被`unmountChild`调用.
   *
   * @param child 要设置的子节点
   */
  _setupUnmountingChild(child) {
    child.parentNode = null;
    child.parentData = null;
    if (isRenderNode(child)) {
      child.onUnmount();
      if (this._attached)
        child.detach();
      child._cleanRelayoutBoundary();
    }
    this.markNeedsLayout();
  }
  /**
   * **设置本节点尺寸**
   *
   * 会检查是否发生变化，如果变化了将自动调用`markNeedsPlace`，使位置得到更新，并自动按需调用`performCommit`.
   *
   * **请按照要求仅在`performResize`或`performLayout`中设置本属性，**其他情况，不应修改该属性，否则可能导致布局错误.
   *
   * 传递不合法的尺寸（负/无穷/NaN）或者`null`将导致错误
   *
   * 会拷贝一个新对象，不会直接使用传参的对象，调用者可以继续修改使用传递的`Size`对象
   */
  set size(size) {
    assert(() => {
      if (!Size.isValid(size)) {
        throw new Error(`Invalid size: ${JSON.stringify(size)}, at ${this.nodeName}, constraint: ${JSON.stringify(this._constraints)}`);
      }
      return true;
    });
    assert(size != null);
    if (!Size.equals(size, this._size)) {
      this.markNeedsPlace();
      this._sizeChanged = true;
      this._size = Size.copy(size);
    }
  }
  /**
   * **获取本节点的尺寸**
   *
   * 返回`Size`类型的实例，或`null`
   */
  get size() {
    return this._size;
  }
  /**
   * **设置本节点相对父坐标的偏移**
   *
   * 会检查是否发生变化，如果变化了将自动调用`markNeedsPlace`，使位置得到更新，并自动按需调用`performCommit`.
   *
   * **请按照要求仅在`performLayout`中设置本属性，**其他情况，不应修改该属性，否则可能导致布局错误.
   *
   * 传递不合法的坐标或者`null`将导致错误
   *
   * 会拷贝一个新对象，不会直接使用传参的对象，调用者可以继续修改使用传递的`Coordinate`对象
   */
  set offset(offset) {
    assert(Coordinate.isValid(offset));
    if (offset == null)
      return;
    if (!Coordinate.equals(this._offset, offset)) {
      this._offset = Coordinate.copy(offset);
      this.markNeedsPlace();
    }
  }
  /**
   * **获取本节点相对相对父坐标的偏移**
   *
   * 返回`Coordinate`类型的实例，或`null`
   */
  get offset() {
    return this._offset;
  }
  /**
   * **获取本节点在当前坐标系的位置**
   *
   * 返回`Coordinate`类型的实例，或`null`
   *
   * 所谓`当前坐标系`，是指像`hmUI`，`VIEW_CONTAINER`控件，`GROUP`控件上绘制本节点时，
   * 应当设置的坐标是相对于屏幕原点或者容器控件的位置而言的；`position`就是指正确布局时，在当前容器上绘制时应当设置的正确坐标
   *
   * 确认一个节点的位置，需要先在`layout`过程中确定其`offset`，
   * 并在`place`过程中，通过父节点的`position`(当然父节点为容器时不算这个)+该节点的`offset`，最终得出`position`
   */
  get position() {
    return this._position;
  }
  /**
   * **设置本节点相对父坐标的偏移**
   *
   * 仅应被`place`方法设置，请勿自行调用，**否则可能导致布局错误**，
   *
   * 传递不合法的坐标或者`null`将导致错误
   *
   * 会拷贝一个新对象，不会直接使用传参的对象，调用者可以继续修改使用传递的`Coordinate`对象.
   *
   * 内部不进行任何脏标记或`commit`操作，需要`place`方法实现.
   */
  set position(position) {
    assert(Coordinate.isValid(position));
    if (position == null)
      return;
    if (!Coordinate.equals(this._position, position)) {
      this._position = Coordinate.copy(position);
    }
  }
  /**
   * **有条件地更新子树重布局边界**
   * @description
   * 当节点的_relayoutBoundary不是自己，且父节点的_relayoutBoundary与自己的不相等时，更新并传递给子节点
   */
  _propagateRelayoutBoundary() {
    if (this._relayoutBoundary === this)
      return;
    const parentRelayoutBoundary = this.parentNode._relayoutBoundary;
    if (parentRelayoutBoundary !== this._relayoutBoundary) {
      this._relayoutBoundary = parentRelayoutBoundary;
      this.visitChildren((child) => {
        child._propagateRelayoutBoundary();
      });
    }
  }
  /**
   * **有条件地清空子树重布局边界**
   * @description
   * 若节点的_relayoutBoundary不是自己，则设为null，并传递给子节点
   */
  _cleanRelayoutBoundary() {
    if (this._relayoutBoundary !== this) {
      this._relayoutBoundary = null;
      this.visitChildren((child) => child._cleanRelayoutBoundary());
    }
  }
  /**
   * **布局算法**
   * @param constraints 布局约束，要求该RenderNode的尺寸应符合该约束
   * @param parentUsesSize 父节点在 layout 时会不会使用当前节点的 size 信息(也就是当前节点的排版信息对父节点有无影响)；
   */
  layout(constraints, { parentUsesSize = false, widgetFactory }) {
    assert(widgetFactory != null && typeof widgetFactory.createWidget === "function" && typeof widgetFactory.deleteWidget === "function");
    assert((() => {
      if (!Constraints.isValid(constraints)) {
        throw new Error(`Invalid constraints: ${JSON.stringify(constraints)} 
From: [${this.nodeName}]${this.toString()}`);
      }
      return true;
    })());
    this._widgetFactory = widgetFactory;
    let isRelayoutBoundary = !parentUsesSize || // 父节点不使用该节点的Size，也就是该节点的Size是固定的(到下次布局前)，所以该节点子树的布局变化不需要父节点重新布局
    this.sizedByParent || // 该节点的Size只与父节点的Size有关，也就是该节点的子树布局变化不会影响该节点的Size，故不需要父节点重新布局
    constraints.isTight || // 父节点传递了严格布局约束，也就是该节点的Size是固定的(到下次布局前)，那么该节点的子树布局变化不会使该节点的Size变化，故不需要父节点重新布局
    !isRenderNode(this.parentNode);
    let relayoutBoundary = isRelayoutBoundary ? this : this.parentNode._relayoutBoundary;
    if (!this._needsLayout && constraints.equals(this._constraints)) {
      if (relayoutBoundary !== this._relayoutBoundary) {
        this._relayoutBoundary = relayoutBoundary;
        this.visitChildren((child) => child._propagateRelayoutBoundary());
      }
      return;
    }
    this._constraints = constraints;
    if (this._relayoutBoundary !== null && relayoutBoundary !== this._relayoutBoundary) {
      this.visitChildren((child) => child._cleanRelayoutBoundary());
    }
    this._relayoutBoundary = relayoutBoundary;
    if (this.sizedByParent) {
      this.performResize();
    }
    this.performLayout();
    this._needsLayout = false;
  }
  /**
   * **在不重新确定尺寸的情况下重新布局**
   *
   * 不会检查`_needsLayout`，请调用前检查并决定是否剪枝
   */
  _layoutWithoutResize() {
    assert(this._relayoutBoundary === this);
    assert(this.size != null);
    this.performLayout();
    this._needsLayout = false;
  }
  /**
   * **计算节点位置（放置操作）**
   * @description
   * 根据本节点的`offset`和父节点传递的`parentNewPosition`，计算本节点的`position`，并在需要时调用`performCommit`
   * @param parentNewPosition 父节点的新位置(未发生改变或者父节点`isNewCoordOrigin`就无需传参)
   */
  place(parentNewPosition) {
    assert(isRenderNode(this.parentNode));
    let parentNode = this.parentNode;
    assert(this._offset != null);
    assert(parentNode._position != null);
    if (!this._needsPlace && !parentNewPosition)
      return;
    this._needsPlace = false;
    let position = parentNewPosition ? Coordinate.add(parentNewPosition, this.offset) : parentNode.isNewCoordOrigin ? Coordinate.copy(this.offset) : Coordinate.add(this.offset, parentNode._position);
    let positionChanged = !Coordinate.equals(position, this._position);
    if (positionChanged) {
      this.position = position;
    }
    if (positionChanged || this._sizeChanged || this._mustCommit) {
      this._sizeChanged = this._mustCommit = false;
      this.performCommit();
    }
    if (positionChanged && !this.isNewCoordOrigin) {
      this.visitChildren((child) => child.place(position));
    }
  }
  /**
   * **将该RenderNode标记为需要重新布局**
   */
  markNeedsLayout() {
    if (this._needsLayout)
      return;
    if (this._relayoutBoundary === null) {
      this._needsLayout = true;
      if (this.parentNode !== null)
        this.markParentNeedsLayout();
      return;
    }
    if (this._relayoutBoundary !== this) {
      this.markParentNeedsLayout();
    } else {
      this._needsLayout = true;
      if (this._attached) {
        this._core.addRelayoutNode(this);
        this._core.requestRelayout();
      }
    }
  }
  /**
   * **将父节点标记为需要重新布局**
   */
  markParentNeedsLayout() {
    assert(this.parentNode !== null);
    this._needsLayout = true;
    this.parentNode.markNeedsLayout();
  }
  /**
   * **标记`sizedByParent`的修改**
   * @description
   * 当在初始化对象以后修改`sizedByParent`时，请调用本方法以确保布局正确更新.
   *
   * 该方法将本节点和父节点标记为脏布局，确保这两个节点的布局都能得到更新.
   */
  markSizedByParentChanged() {
    this.markNeedsLayout();
    this.markParentNeedsLayout();
  }
  /**
   * **标记需要重新计算节点位置（放置脏标记）**
   *
   * 通常不需要手动调用`markNeedsPlace`，因为通常只有当`offset`或父节点的位置可能发生变化时，本节点才需要重新确定位置，而前者只能由`layout`过程中计算，
   * 并在`performLayout`中赋值新的`offset`给子节点时，由子节点的`offset`setter 自动判断是否应调用`markNeedsPlace`;后者会在父节点的`place`方法中调用
   * 子节点的`place`，并不需要用到本脏标记. 另外一个调用来源是`markMustCommit`，因为其需要保证该节点的`place`得到调用，并在其中调用`performCommit`.
   *
   * @see markMustCommit 如果你想让框架保证`performCommit`或`onCommit`得到调用，请另见`markMustCommit`
   */
  markNeedsPlace() {
    if (this._needsPlace)
      return;
    this._needsPlace = true;
    if (this._attached) {
      assert(this._core != null);
      this._core.addPlaceNode(this);
      this._core.requestPlace();
    }
  }
  markMustCommit() {
    if (this._mustCommit)
      return;
    this.markNeedsPlace();
  }
}
class RenderNodeWithNoChild extends RenderNode {
  get firstChild() {
    return null;
  }
  visitChildren(handler) {
    return;
  }
  unmountChild(child) {
    return false;
  }
  mountChild(child, ref) {
    return false;
  }
  getChildNextSibling(child) {
    return null;
  }
}
class RenderNodeWithSingleChild extends RenderNode {
  constructor() {
    super(...arguments);
    __publicField(this, "_child", null);
  }
  set child(child) {
    if (this._child) {
      this.unmountChild(this._child);
      this._child = null;
    }
    if (child != null)
      this.mountChild(child);
  }
  get child() {
    return this._child;
  }
  get firstChild() {
    return this._child;
  }
  visitChildren(handler) {
    if (isRenderNode(this._child)) {
      handler(this._child);
    }
  }
  unmountChild(child) {
    if (this._child !== null && child === this._child) {
      this._setupUnmountingChild(child);
      this._child = null;
      return true;
    }
    return false;
  }
  mountChild(child) {
    if (this._child !== null)
      return false;
    this._child = child;
    this._setupMountingChild(child);
    return true;
  }
  getChildNextSibling(child) {
    return null;
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    if (key === "child" && value instanceof AsukaNode) {
      this.child = value;
    }
  }
}
class RenderNodeWithMultiChildren extends RenderNode {
  constructor() {
    super(...arguments);
    __publicField(this, "_firstChild", null);
    __publicField(this, "_lastChild", null);
    __publicField(this, "_childRenderNodeCount", 0);
  }
  get firstChild() {
    return this._firstChild;
  }
  get childRenderNodeCount() {
    return this._childRenderNodeCount;
  }
  visitChildren(handler) {
    let nowChild = this._firstChild;
    while (nowChild) {
      if (isRenderNode(nowChild))
        handler(nowChild);
      assert(nowChild.parentData.nextSibling !== void 0);
      nowChild = nowChild.parentData.nextSibling;
    }
  }
  unmountChild(child) {
    if (child.parentNode !== this)
      return false;
    let previousSibling = child.parentData.previousSibling;
    let nextSibling = child.parentData.nextSibling;
    if (previousSibling)
      previousSibling.parentData.nextSibling = nextSibling;
    if (nextSibling)
      nextSibling.parentData.previousSibling = previousSibling;
    if (child === this._firstChild) {
      this._firstChild = child.parentData.nextSibling;
    }
    if (child === this._lastChild) {
      this._lastChild = child.parentData.previousSibling;
    }
    this._setupUnmountingChild(child);
    if (isRenderNode(child))
      --this._childRenderNodeCount;
    return true;
  }
  mountChild(child, ref) {
    assert(!child.parentNode);
    if (ref) {
      if (ref.parentNode !== this)
        return false;
      this._setupMountingChild(child);
      let previousSibling = ref.parentData.previousSibling;
      child.parentData.previousSibling = previousSibling;
      ref.parentData.previousSibling = child;
      if (previousSibling)
        previousSibling.parentData.nextSibling = child;
      child.parentData.nextSibling = ref;
      if (ref === this._firstChild)
        this._firstChild = child;
      if (isRenderNode(child))
        ++this._childRenderNodeCount;
      return true;
    } else {
      this._setupMountingChild(child);
      let lastChild = this._lastChild;
      this._lastChild = child;
      child.parentData.previousSibling = lastChild;
      if (lastChild)
        lastChild.parentData.nextSibling = child;
      else
        this._firstChild = child;
      child.parentData.nextSibling = null;
      if (isRenderNode(child))
        ++this._childRenderNodeCount;
      return true;
    }
  }
  getChildNextSibling(child) {
    return child.parentData.nextSibling;
  }
}
class RenderNodeProxy extends RenderNodeWithSingleChild {
  constructor() {
    super(...arguments);
    __publicField(this, "sizedByParent", false);
  }
  performResize() {
  }
  performLayout() {
    assert(this._constraints != null);
    if (isRenderNode(this.child)) {
      assert(this._widgetFactory != null);
      let child = this.child;
      child.layout(this._constraints, {
        parentUsesSize: true,
        widgetFactory: this._widgetFactory
      });
      this.size = child.size;
      child.offset = { x: 0, y: 0 };
    } else {
      this.size = this._constraints.smallest;
    }
  }
  performCommit() {
  }
}
class AsukaEvent {
  // TODO is false should be the default value?
  /**
   * **创建事件对象**
   * @param type 事件类型，不区分大小写
   * @param opts 事件属性
   * @property `opts.bubbles` 是否为冒泡类型
   * @property `opts.cancelable` 是否为可以取消
   */
  constructor(type, opts) {
    __publicField(this, "type");
    __publicField(this, "bubbles");
    /** 触发事件的元素, 默认为调用`depatchEvent()`的元素 */
    __publicField(this, "target");
    /** 正在响应该事件的元素 */
    __publicField(this, "currentTarget");
    /** 该事件是否可取消 */
    __publicField(this, "cancelable");
    /** 该事件是否已被取消继续冒泡传播(当`cancelable`为`true`时有效) */
    __publicField(this, "_stop", false);
    /** 该事件是否已被立即取消继续传播(当`cancelable`为`true`时有效) */
    __publicField(this, "_end", false);
    /** 一个布尔值，表示 `preventDefault()` 方法是否取消了事件的默认行为。 */
    __publicField(this, "defaultPrevented", false);
    this.type = type;
    this.type = type.toLowerCase();
    this.bubbles = !!(opts && opts.bubbles);
    this.cancelable = !!(opts && opts.cancelable);
  }
  /**
   * **阻止冒泡事件向上传播**
   * @description
   * 它不能阻止附加到相同元素的相同事件类型的其他事件处理器。如果要阻止这些处理器的运行，请参见 `stopImmediatePropagation()` 方法。
   * （当`cancelable`为`true`时有效）
   */
  stopPropagation() {
    this._stop = true;
  }
  /**
   * **立即阻止事件传播**
   * @description
   * 如果多个事件监听器被附加到相同元素的相同事件类型上，当此事件触发时，它们会按其被添加的顺序被调用。
   * 如果在其中一个事件监听器中执行 `stopImmediatePropagation()` ，那么剩下的事件监听器都不会被调用。
   * 如果想只取消冒泡传播而继续执行相同元素剩下的事件监听器，请参见`stopPropagation()`方法。
   * （当`cancelable`为`true`时有效）
   */
  stopImmediatePropagation() {
    this._end = this._stop = true;
  }
  /** 阻止事件的默认行为 */
  preventDefault() {
    this.defaultPrevented = true;
  }
}
class RenderView extends RenderNodeWithSingleChild {
  constructor({ core, widgetFactory, size, key, offset = { x: 0, y: 0 } }) {
    super(NodeType.RENDER_NODE, "#frame");
    __privateAdd(this, _key);
    this._widgetFactory = widgetFactory;
    this._depth = 1;
    this._size = Size.copy(size);
    this._offset = Coordinate.copy(offset);
    this._position = Coordinate.copy(offset);
    this._core = core;
    __privateSet(this, _key, key);
    this._attached = true;
    this._relayoutBoundary = this;
  }
  get key() {
    return __privateGet(this, _key);
  }
  /**
   * @override
   */
  set size(size) {
    assert(Size.isValid(size));
    if (size == null)
      return;
    if (!Size.equals(size, this._size)) {
      this._size = Size.copy(size);
      this.markNeedsLayout();
    }
  }
  get size() {
    return this._size;
  }
  setSize(size) {
    this.size = size;
    return this;
  }
  set offset(offset) {
    assert(Coordinate.isValid(offset));
    if (offset == null)
      return;
    if (!Coordinate.equals(this._offset, offset)) {
      this._offset = Coordinate.copy(offset);
      this._position = Coordinate.copy(offset);
      this.markNeedsPlace();
    }
  }
  setOffset(offset) {
    this.offset = offset;
    return this;
  }
  set position(position) {
    assert(Coordinate.isValid(position));
    if (position == null)
      return;
    if (!Coordinate.equals(this._position, position)) {
      this._offset = Coordinate.copy(position);
      this._position = Coordinate.copy(position);
      this.markNeedsPlace();
    }
  }
  setPosition(position) {
    this.position = position;
    return this;
  }
  place() {
    assert(this._offset != null);
    assert(this._position != null);
    if (!this._needsPlace)
      return;
    this._needsPlace = false;
    if (!this.isNewCoordOrigin) {
      this.visitChildren((child) => child.place(this._position));
    }
  }
  performLayout() {
    assert(this._size != null);
    assert(this._widgetFactory != null);
    if (isRenderNode(this.child)) {
      let child = this.child;
      child.layout(Constraints.createTight(this._size), {
        parentUsesSize: false,
        widgetFactory: this._widgetFactory
      });
      child.offset = Coordinate.origin();
    }
  }
  performResize() {
  }
  performCommit() {
  }
}
_key = new WeakMap();
class RenderWidget extends RenderNodeWithNoChild {
  constructor() {
    super(...arguments);
    __publicField(this, "_displaying", false);
  }
  onAttach() {
    this.markMustCommit();
  }
  onDetach() {
    this._displaying = false;
    assert(this._widgetFactory !== null);
    this.onDestroy(this._widgetFactory);
  }
  performCommit() {
    assert(this.size !== null && this.position !== null && this._widgetFactory !== null);
    this.onCommit({
      size: this.size,
      position: this.position,
      initial: !this._displaying,
      widgetFactory: this._widgetFactory
    });
    this._displaying = true;
  }
}
class RenderWidgetFactoryProvider extends RenderNodeWithSingleChild {
  constructor() {
    super(...arguments);
    __publicField(this, "_displaying", false);
    __publicField(this, "sizedByParent", false);
    __publicField(this, "childWidgetFactory", null);
  }
  onAttach() {
    this.markMustCommit();
  }
  onDetach() {
    this._displaying = false;
    assert(this._widgetFactory !== null);
    this.onDestroy(this._widgetFactory);
  }
  performResize() {
  }
  /// 行为类似`RenderNodeProxy`，只不过替换了传给子控件的`widgetFactory`
  performLayout() {
    assert(this._constraints != null);
    if (isRenderNode(this.child)) {
      assert(this._widgetFactory != null);
      assert(this.childWidgetFactory != null);
      let child = this.child;
      child.layout(this._constraints, {
        parentUsesSize: true,
        widgetFactory: this.childWidgetFactory
      });
      this.size = child.size;
      child.offset = { x: 0, y: 0 };
    } else {
      this.size = this._constraints.smallest;
    }
  }
  performCommit() {
    assert(this.size !== null && this.position !== null && this._widgetFactory !== null);
    this.onCommit({
      size: this.size,
      position: this.position,
      initial: !this._displaying,
      widgetFactory: this._widgetFactory
    });
    this._displaying = true;
  }
}
const _AsukaUI = class _AsukaUI {
  constructor(platform) {
    __publicField(this, "platform");
    __publicField(this, "viewRecord", {});
    __publicField(this, "_activeFrame", null);
    __publicField(this, "_nodeFactories", []);
    /** 需要重新布局的起始节点 */
    __publicField(this, "_nodesNeedsLayout", []);
    /** 需要重新放置的节点 */
    __publicField(this, "_nodesNeedsPlace", []);
    /** 在布局和放置任务完成后调用的任务 */
    __publicField(this, "_runAfterTasks", []);
    /** 异步管理器句柄(可能是setTimeout或者Promise之类的) */
    __publicField(this, "_asyncHandler", null);
    this.platform = platform;
    assert(_AsukaUI.instance === null);
    _AsukaUI.instance = this;
  }
  get activeFrame() {
    return this._activeFrame;
  }
  set activeFrame(frame) {
    this._activeFrame = frame;
  }
  mountView(mount, options) {
    let size = options && options.size;
    let offset = options && options.offset || { x: 0, y: 0 };
    if (!size) {
      size = this.platform.getWidgetFactorySize(mount);
    }
    if (!size)
      throw Error("Get View size failed");
    let view = new RenderView({
      widgetFactory: mount,
      core: this,
      size,
      key: /* @__PURE__ */ Symbol("Asuka View"),
      offset
    });
    this.viewRecord[view.key] = view;
    return view;
  }
  unmountView(view) {
    if (!view._attached || !this.viewRecord[view.key])
      return false;
    view.detach();
    this.viewRecord[view.key] = null;
    return true;
  }
  registerNodeFactory(nodeFactory) {
    this._nodeFactories.push(nodeFactory);
  }
  createNode(type) {
    let element = null;
    for (let nodeFactory of this._nodeFactories) {
      element = nodeFactory.createNode(type);
      if (element)
        break;
    }
    if (element !== null && isRenderNode(element)) {
      element._core = this;
    }
    return element;
  }
  createTextNode(text) {
    return new AsukaTextNode(text);
  }
  /**
   * **添加需要重新布局的节点**
   */
  addRelayoutNode(node) {
    assert(findWhere(this._nodesNeedsLayout, node, true) === -1);
    this._nodesNeedsLayout.push(node);
  }
  /**
   * **移除需要重新布局的节点**
   */
  removeRelayoutNode(node) {
    return splice(this._nodesNeedsLayout, node) !== -1;
  }
  /**
   * **请求重新布局**
   */
  requestRelayout() {
    if (this._asyncHandler === null) {
      this._asyncHandler = setTimeout(() => this._layoutAndPlace());
    }
  }
  /**
   * **添加需要重新布局的节点**
   */
  addPlaceNode(node) {
    assert(findWhere(this._nodesNeedsPlace, node, true) === -1);
    this._nodesNeedsPlace.push(node);
  }
  /**
   * **移除需要重新布局的节点**
   */
  removePlaceNode(node) {
    return splice(this._nodesNeedsPlace, node) !== -1;
  }
  /**
   * **请求重新布局**
   */
  requestPlace() {
    if (this._asyncHandler === null) {
      this._asyncHandler = setTimeout(() => this._layoutAndPlace());
    }
  }
  /**
   * **取消重新布局**
   */
  cancelRelayout() {
    if (this._asyncHandler !== null)
      clearTimeout(this._asyncHandler);
  }
  refreshSync() {
    if (this._asyncHandler !== null) {
      clearTimeout(this._asyncHandler);
      this._layoutAndPlace();
    }
  }
  /**
   * **添加布局与放置后的任务**
   *
   * 将在`layout`和`place`完成后调用，并清空任务队列
   * @param task 要执行的任务
   */
  addRunAfterAsync(task) {
    this._runAfterTasks.push(task);
  }
  /**
   * 重新布局时调用的
   */
  _layoutAndPlace() {
    this._asyncHandler = null;
    this._layout();
    this._place();
    this._runAfter();
  }
  _layout() {
    this._nodesNeedsLayout.sort((node1, node2) => node1._depth - node2._depth);
    for (let node of this._nodesNeedsLayout) {
      if (node._needsLayout && node._attached)
        node._layoutWithoutResize();
    }
    this._nodesNeedsLayout = [];
  }
  _place() {
    this._nodesNeedsPlace.sort((node1, node2) => node1._depth - node2._depth);
    for (let node of this._nodesNeedsPlace) {
      if (node._needsPlace && node._attached)
        node.place();
    }
    this._nodesNeedsPlace = [];
  }
  _runAfter() {
    for (let task of this._runAfterTasks) {
      task();
    }
    this._runAfterTasks = [];
  }
};
__publicField(_AsukaUI, "instance", null);
let AsukaUI = _AsukaUI;
class LayoutWidgetAlign extends RenderNodeWithSingleChild {
  constructor() {
    super(...arguments);
    __publicField(this, "sizedByParent", true);
    __publicField(this, "_align", Alignment.center);
  }
  performResize() {
    assert(this._constraints != null);
    this.size = this._constraints.biggest;
  }
  performLayout() {
    assert(this.size != null);
    assert(this._widgetFactory != null);
    assert(this._constraints != null);
    if (isRenderNode(this.child)) {
      let child = this.child;
      child.layout(this._constraints.loose(), {
        parentUsesSize: true,
        widgetFactory: this._widgetFactory
      });
      assert(child.size != null);
      child.offset = this._align.calcOffset(this.size, child.size);
    }
  }
  performCommit() {
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case "x":
        {
          let x = Number(value);
          if (x !== this._align._x) {
            this._align._x = x;
            this.markNeedsLayout();
          }
        }
        break;
      case "y":
        {
          let y = Number(value);
          if (y !== this._align._y) {
            this._align._y = y;
            this.markNeedsLayout();
          }
        }
        break;
      case "alignment":
        {
          if (!(value instanceof Alignment))
            break;
          if (value._x !== this._align._x || value._y !== this._align._y) {
            this._align = Alignment.copy(value);
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}
class LayoutWidgetCenter extends RenderNodeWithSingleChild {
  constructor() {
    super(...arguments);
    __publicField(this, "sizedByParent", true);
  }
  performResize() {
    assert(this._constraints != null);
    this.size = this._constraints.biggest;
  }
  performLayout() {
    assert(this.size != null);
    assert(this._widgetFactory != null);
    assert(this._constraints != null);
    if (isRenderNode(this.child)) {
      let child = this.child;
      child.layout(this._constraints.loose(), {
        parentUsesSize: true,
        widgetFactory: this._widgetFactory
      });
      assert(child.size != null);
      child.offset = {
        x: (this.size.w - child.size.w) / 2,
        y: (this.size.h - child.size.h) / 2
      };
    }
  }
  performCommit() {
  }
}
class LayoutWidgetFlex extends RenderNodeWithMultiChildren {
  constructor() {
    super(...arguments);
    __publicField(this, "_direction", Axis.vertical);
    __publicField(this, "_mainAxisAlignment", MainAxisAlignment.start);
    __publicField(this, "_mainAxisSize", MainAxisSize.max);
    __publicField(this, "_crossAxisAlignment", CrossAxisAlignment.center);
    __publicField(this, "_horizonDirection", HorizontalDirection.ltr);
    __publicField(this, "_verticalDirection", VerticalDirection.down);
    __publicField(this, "_textBaseline", null);
    // not support now
    __publicField(this, "_overflow", 0);
    __publicField(this, "sizedByParent", false);
  }
  setProperty(key, value) {
    switch (key) {
      case "d":
      case "direction":
        {
          if (value !== this._direction) {
            this._direction = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "maa":
      case "mainAxisAlignment":
        {
          if (value !== this._mainAxisAlignment) {
            this._mainAxisAlignment = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "mas":
      case "mainAxisSize":
        {
          if (value !== this._mainAxisSize) {
            this._mainAxisSize = value;
            if (this._mainAxisSize === MainAxisSize.max) {
              this.sizedByParent = true;
              this.markSizedByParentChanged();
            } else {
              this.sizedByParent = false;
              this.markSizedByParentChanged();
            }
            this.markNeedsLayout();
          }
        }
        break;
      case "caa":
      case "crossAxisAlignment":
        {
          if (value !== this._crossAxisAlignment) {
            this._crossAxisAlignment = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "hd":
      case "horizonDirection":
        {
          if (value !== this._horizonDirection) {
            this._horizonDirection = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "vd":
      case "verticalDirection":
        {
          if (value !== this._verticalDirection) {
            this._verticalDirection = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "tb":
      case "textBaseline":
        {
          if (value !== this._textBaseline) {
            this._textBaseline = value;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
  /**
   * sizedByParent == true，即_mainAxisSize == MainAxisSize.max时的布局
   *
   * 直接maxSize就完事儿了
   */
  performResize() {
    assert(this._constraints != null);
    this.size = this._constraints.biggest;
  }
  _getFlex(child) {
    return child instanceof LayoutWidgetFlexible ? child._flex : 0;
  }
  _getFit(child) {
    return child instanceof LayoutWidgetFlexible ? child._fit : FlexFit.tight;
  }
  _getMainSize(size) {
    return this._direction === Axis.horizontal ? size.w : size.h;
  }
  _getCrossSize(size) {
    return this._direction === Axis.horizontal ? size.h : size.w;
  }
  _startIsTopLeft(direction) {
    switch (direction) {
      case Axis.horizontal:
        switch (this._horizonDirection) {
          case HorizontalDirection.ltr:
            return true;
          case HorizontalDirection.rtl:
            return false;
          case null:
            return null;
        }
      case Axis.vertical:
        switch (this._verticalDirection) {
          case VerticalDirection.down:
            return true;
          case VerticalDirection.up:
            return false;
          case null:
            return null;
        }
    }
  }
  _computeSizes() {
    const constraints = this._constraints;
    let totalFlex = 0;
    const maxMainSize = this._direction === Axis.horizontal ? constraints.maxWidth : constraints.maxHeight;
    const canFlex = maxMainSize < Number.POSITIVE_INFINITY;
    let crossSize = 0;
    let allocatedSize = 0;
    let lastFlexChild = null;
    this.visitChildren((child) => {
      let flex = this._getFlex(child);
      if (flex > 0) {
        totalFlex += flex;
        lastFlexChild = child;
      } else {
        let innerConstraints;
        if (this._crossAxisAlignment === CrossAxisAlignment.stretch) {
          switch (this._direction) {
            case Axis.horizontal:
              innerConstraints = Constraints.createTight({
                h: constraints.maxHeight
              });
              break;
            case Axis.vertical:
              innerConstraints = Constraints.createTight({
                w: constraints.maxWidth
              });
              break;
          }
        } else {
          switch (this._direction) {
            case Axis.horizontal:
              innerConstraints = new Constraints({
                maxHeight: constraints.maxHeight
              });
              break;
            case Axis.vertical:
              innerConstraints = new Constraints({
                maxWidth: constraints.maxWidth
              });
              break;
          }
        }
        child.layout(innerConstraints, {
          parentUsesSize: true,
          widgetFactory: this._widgetFactory
        });
        assert(child.size != null);
        let childSize = child.size;
        allocatedSize += this._getMainSize(childSize);
        crossSize += max(crossSize, this._getCrossSize(childSize));
      }
    });
    let freeSpace = max(0, (canFlex ? maxMainSize : 0) - allocatedSize);
    let allocatedFlexSpace = 0;
    if (totalFlex > 0) {
      let spacePerFlex = canFlex ? freeSpace / totalFlex : NaN;
      this.visitChildren((child) => {
        let flex = this._getFlex(child);
        if (flex > 0) {
          let maxChildExtent = canFlex ? child == lastFlexChild ? freeSpace - allocatedFlexSpace : spacePerFlex * flex : Number.POSITIVE_INFINITY;
          let minChildExtent;
          switch (this._getFit(child)) {
            case FlexFit.tight:
              assert(maxChildExtent < Number.POSITIVE_INFINITY);
              minChildExtent = maxChildExtent;
              break;
            case FlexFit.loose:
              minChildExtent = 0;
              break;
          }
          let innerConstraints;
          if (this._crossAxisAlignment === CrossAxisAlignment.stretch) {
            switch (this._direction) {
              case Axis.horizontal:
                innerConstraints = new Constraints({
                  minWidth: minChildExtent,
                  maxWidth: maxChildExtent,
                  minHeight: constraints.maxHeight,
                  maxHeight: constraints.maxHeight
                });
                break;
              case Axis.vertical:
                innerConstraints = new Constraints({
                  minWidth: constraints.maxWidth,
                  maxWidth: constraints.maxWidth,
                  minHeight: minChildExtent,
                  maxHeight: maxChildExtent
                });
                break;
            }
          } else {
            switch (this._direction) {
              case Axis.horizontal:
                innerConstraints = new Constraints({
                  minWidth: minChildExtent,
                  maxWidth: maxChildExtent,
                  maxHeight: constraints.maxHeight
                });
                break;
              case Axis.vertical:
                innerConstraints = new Constraints({
                  maxWidth: constraints.maxWidth,
                  minHeight: minChildExtent,
                  maxHeight: maxChildExtent
                });
                break;
            }
          }
          child.layout(innerConstraints, {
            parentUsesSize: true,
            widgetFactory: this._widgetFactory
          });
          assert(child.size != null);
          const childSize = child.size;
          const childMainSize = this._getMainSize(childSize);
          assert(childMainSize <= maxChildExtent);
          allocatedSize += childMainSize;
          allocatedFlexSpace += maxChildExtent;
          crossSize = max(crossSize, this._getCrossSize(childSize));
        }
      });
    }
    const idealSize = canFlex && this._mainAxisSize == MainAxisSize.max ? maxMainSize : allocatedSize;
    return {
      mainSize: idealSize,
      crossSize,
      allocatedSize
    };
  }
  performLayout() {
    var _a;
    assert(this._widgetFactory != null);
    assert(this._constraints != null);
    const constraints = this._constraints;
    let { mainSize: actualSize, crossSize, allocatedSize } = this._computeSizes();
    switch (this._direction) {
      case Axis.horizontal:
        this.size = constraints.constrain({ w: actualSize, h: crossSize });
        actualSize = this.size.w;
        crossSize = this.size.h;
        break;
      case Axis.vertical:
        this.size = constraints.constrain({ w: crossSize, h: actualSize });
        actualSize = this.size.h;
        crossSize = this.size.w;
        break;
    }
    const actualSizeDelta = actualSize - allocatedSize;
    this._overflow = max(0, -actualSizeDelta);
    const remainingSpace = max(0, actualSizeDelta);
    let leadingSpace;
    let betweenSpace;
    const flipMainAxis = !((_a = this._startIsTopLeft(this._direction)) != null ? _a : true);
    switch (this._mainAxisAlignment) {
      case MainAxisAlignment.start:
        leadingSpace = 0;
        betweenSpace = 0;
        break;
      case MainAxisAlignment.end:
        leadingSpace = remainingSpace;
        betweenSpace = 0;
        break;
      case MainAxisAlignment.center:
        leadingSpace = remainingSpace / 2;
        betweenSpace = 0;
        break;
      case MainAxisAlignment.spaceBetween:
        leadingSpace = 0;
        betweenSpace = this.childRenderNodeCount > 1 ? remainingSpace / (this.childRenderNodeCount - 1) : 0;
        break;
      case MainAxisAlignment.spaceAround:
        betweenSpace = this.childRenderNodeCount > 0 ? remainingSpace / this.childRenderNodeCount : 0;
        leadingSpace = betweenSpace / 2;
        break;
      case MainAxisAlignment.spaceEvenly:
        betweenSpace = this.childRenderNodeCount > 0 ? remainingSpace / (this.childRenderNodeCount + 1) : 0;
        leadingSpace = betweenSpace;
        break;
    }
    let childMainPosition = flipMainAxis ? actualSize - leadingSpace : leadingSpace;
    this.visitChildren((child) => {
      assert(child.size != null);
      let childCrossPosition = 0;
      switch (this._crossAxisAlignment) {
        case CrossAxisAlignment.start:
        case CrossAxisAlignment.end:
          childCrossPosition = this._startIsTopLeft(flipAxis(this._direction)) === (this._crossAxisAlignment === CrossAxisAlignment.start) ? 0 : crossSize - this._getCrossSize(child.size);
          break;
        case CrossAxisAlignment.center:
          childCrossPosition = (crossSize - this._getCrossSize(child.size)) / 2;
          break;
        case CrossAxisAlignment.stretch:
          childCrossPosition = 0;
          break;
        // case CrossAxisAlignment.baseline:
        //   if (_direction == Axis.horizontal) {
        //     assert(textBaseline != null);
        //     final double? distance = child.getDistanceToBaseline(textBaseline!, onlyReal: true);
        //     if (distance != null) {
        //       childCrossPosition = maxBaselineDistance - distance;
        //     } else {
        //       childCrossPosition = 0.0;
        //     }
        //   } else {
        //     childCrossPosition = 0.0;
        //   }
        // break;
        default:
          assert(() => {
            throw Error("Unknown CrossAxisAlignment in Flex performLayout");
          });
      }
      if (flipMainAxis) {
        childMainPosition -= this._getMainSize(child.size);
      }
      switch (this._direction) {
        case Axis.horizontal:
          child.offset = { x: childMainPosition, y: childCrossPosition };
          break;
        case Axis.vertical:
          child.offset = { x: childCrossPosition, y: childMainPosition };
          break;
      }
      if (flipMainAxis) {
        childMainPosition -= betweenSpace;
      } else {
        childMainPosition += this._getMainSize(child.size) + betweenSpace;
      }
    });
  }
  performCommit() {
  }
}
class LayoutWidgetFlexible extends RenderNodeProxy {
  constructor() {
    super(...arguments);
    __publicField(this, "_fit", FlexFit.loose);
    __publicField(this, "_flex", 1);
  }
  onMount() {
    assert(() => {
      if (!(this.parentNode instanceof LayoutWidgetFlex)) {
        throw Error("The Parent Node of a LayoutWidgetFlexible widget must be instance of LayoutWidgetFlex");
      }
      return true;
    });
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case "flex":
        {
          if (value !== this._flex) {
            this._flex = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "fit":
        {
          if (value !== this._fit) {
            this._fit = value;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}
class LayoutWidgetExpanded extends LayoutWidgetFlexible {
  constructor() {
    super(...arguments);
    __publicField(this, "_fit", FlexFit.tight);
  }
}
class LayoutWidgetColumn extends LayoutWidgetFlex {
  constructor() {
    super(...arguments);
    __publicField(this, "_direction", Axis.vertical);
  }
}
class LayoutWidgetHStack extends RenderNodeWithMultiChildren {
  constructor() {
    super(...arguments);
    __publicField(this, "sizedByParent", true);
  }
  performResize() {
    assert(this._constraints != null);
    this.size = this._constraints.biggest;
  }
  performLayout() {
    assert(this.size != null);
    assert(this._widgetFactory != null);
    let leftedWidth = this.size.w;
    this.visitChildren((child) => {
      child.layout(new Constraints({
        maxWidth: leftedWidth,
        maxHeight: this.size.h
      }), { parentUsesSize: true, widgetFactory: this._widgetFactory });
      assert(child.size != null);
      leftedWidth -= child.size.w;
    });
    let offsetX = 0;
    this.visitChildren((child) => {
      let offsetY = (this.size.h - child.size.h) / 2;
      child.offset = { x: offsetX, y: offsetY };
      offsetX += child.size.w;
    });
  }
  performCommit() {
  }
}
class LayoutWidgetPadding extends RenderNodeWithSingleChild {
  constructor() {
    super(...arguments);
    __publicField(this, "sizedByParent", false);
    __publicField(this, "_padding", EdgeInsets.zero);
  }
  performResize() {
  }
  performLayout() {
    assert(this._constraints != null);
    assert(this._widgetFactory != null);
    if (isRenderNode(this.child)) {
      let child = this.child;
      let innerConstraints = this._padding.getInnerConstraints(this._constraints);
      child.layout(innerConstraints, {
        parentUsesSize: true,
        widgetFactory: this._widgetFactory
      });
      assert(child.size != null);
      let size = this._padding.getOutterSize(child.size);
      assert(() => {
        var _a;
        if (!this._constraints.testSize(size)) {
          throw new Error(`Padding out of bounds, size=${JSON.stringify(size)} constraints=${(_a = this._constraints) == null ? void 0 : _a.toString()}`);
        }
        return true;
      });
      this.size = size;
      child.offset = this._padding.innerOffset;
    } else {
      this.size = this._constraints.constrain(this._padding.totalSizeWithoutInner);
    }
  }
  performCommit() {
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case "p":
      case "padding":
        {
          if ((value === null || value instanceof EdgeInsets) && !this._padding.equals(value)) {
            assert(value != null);
            this._padding = value;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}
class LayoutWidgetRow extends LayoutWidgetFlex {
  constructor() {
    super(...arguments);
    __publicField(this, "_direction", Axis.horizontal);
  }
}
class LayoutWidgetSizedBox extends RenderNodeWithSingleChild {
  constructor() {
    super(...arguments);
    __publicField(this, "_width", null);
    __publicField(this, "_height", null);
  }
  _generateChildConstraints() {
    var _a, _b;
    assert(this._constraints != null);
    return Constraints.createTight({
      w: (_a = this._width) != null ? _a : Number.POSITIVE_INFINITY,
      h: (_b = this._height) != null ? _b : Number.POSITIVE_INFINITY
    }).adoptBy(this._constraints);
  }
  performResize() {
  }
  performLayout() {
    assert(this._widgetFactory != null);
    assert(this._constraints != null);
    let constraints = this._generateChildConstraints();
    if (isRenderNode(this.child)) {
      let child = this.child;
      assert(() => {
        if (!constraints.isTight) {
          throw Error(`constraints.isTight == false constraints=${constraints.toString()}`);
        }
        return true;
      });
      child.layout(constraints, {
        parentUsesSize: false,
        widgetFactory: this._widgetFactory
      });
      child.offset = {
        x: 0,
        y: 0
      };
    }
    this.size = constraints.biggest;
  }
  performCommit() {
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case "width":
      case "w":
        {
          let w = Number(value);
          if (w !== this._width) {
            this._width = w;
            this.markNeedsLayout();
          }
        }
        break;
      case "height":
      case "h":
        {
          let h = Number(value);
          if (h !== this._height) {
            this._height = h;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}
class LayoutWidgetVStack extends RenderNodeWithMultiChildren {
  constructor() {
    super(...arguments);
    __publicField(this, "sizedByParent", true);
  }
  performResize() {
    assert(this._constraints != null);
    this.size = this._constraints.biggest;
  }
  performLayout() {
    assert(this.size != null);
    assert(this._widgetFactory != null);
    let leftedHeight = this.size.h;
    this.visitChildren((child) => {
      child.layout(new Constraints({
        maxWidth: this.size.w,
        maxHeight: leftedHeight
      }), { parentUsesSize: true, widgetFactory: this._widgetFactory });
      assert(child.size != null);
      leftedHeight -= child.size.h;
    });
    let offsetY = 0;
    this.visitChildren((child) => {
      let offsetX = (this.size.w - child.size.w) / 2;
      child.offset = { x: offsetX, y: offsetY };
      offsetY += child.size.h;
    });
  }
  performCommit() {
  }
}
class LayoutWidgetZStack extends RenderNodeWithMultiChildren {
  constructor() {
    super(...arguments);
    __publicField(this, "_align", Alignment.topLeft);
    __publicField(this, "_fit", StackFit.loose);
  }
  _computeSize(constraints) {
    let hasNonPositionedChild = false;
    if (this._childRenderNodeCount === 0) {
      return Size.isFinite(constraints.biggest) ? constraints.biggest : constraints.smallest;
    }
    let width = constraints.minWidth;
    let height = constraints.minHeight;
    let nonPositionedConstraints;
    switch (this._fit) {
      case StackFit.loose:
        nonPositionedConstraints = constraints.loose();
        break;
      case StackFit.expand:
        nonPositionedConstraints = Constraints.createTight(constraints.biggest);
        break;
      case StackFit.passthrough:
        nonPositionedConstraints = constraints;
        break;
    }
    this.visitChildren((child) => {
      if (!(child instanceof LayoutWidgetPositioned)) {
        hasNonPositionedChild = true;
        child.layout(nonPositionedConstraints, {
          parentUsesSize: true,
          widgetFactory: this._widgetFactory
        });
        assert(child.size != null);
        width = max(child.size.w, width);
        height = max(child.size.h, height);
      }
    });
    let size;
    if (hasNonPositionedChild) {
      size = { w: width, h: height };
      assert(Size.equals(size, constraints.constrain(size)));
    } else {
      size = constraints.biggest;
    }
    assert(Size.isFinite(size));
    return size;
  }
  _layoutPositionedChild(child) {
    assert(this.size != null);
    assert(this._widgetFactory != null);
    let childConstraints = new Constraints({});
    if (child._left !== null && child._right !== null) {
      childConstraints = childConstraints.tighten({
        width: this.size.w - child._left - child._right
      });
    } else if (child._width !== null) {
      childConstraints = childConstraints.tighten({ width: child._width });
    }
    if (child._top !== null && child._bottom !== null) {
      childConstraints = childConstraints.tighten({
        height: this.size.h - child._top - child._bottom
      });
    } else if (child._height !== null) {
      childConstraints = childConstraints.tighten({ height: child._height });
    }
    child.layout(childConstraints, {
      parentUsesSize: true,
      widgetFactory: this._widgetFactory
    });
    assert(child.size != null);
    let x;
    if (child._left !== null) {
      x = child._left;
    } else if (child._right !== null) {
      x = this.size.w - child._right - child.size.w;
    } else {
      x = this._align.calcOffset(this.size, child.size).x;
    }
    let y;
    if (child._top !== null) {
      y = child._top;
    } else if (child._bottom !== null) {
      y = this.size.h - child._bottom - child.size.h;
    } else {
      y = this._align.calcOffset(this.size, child.size).y;
    }
    child.offset = { x, y };
  }
  performResize() {
  }
  performLayout() {
    assert(this._constraints != null);
    assert(this._widgetFactory != null);
    const constraints = this._constraints;
    this.size = this._computeSize(constraints);
    this.visitChildren((child) => {
      if (child instanceof LayoutWidgetPositioned) {
        assert(child._left === null || child._right === null || child._width === null);
        assert(child._top === null || child._bottom === null || child._height === null);
        this._layoutPositionedChild(child);
      } else {
        assert(child.size != null);
        child.offset = this._align.calcOffset(this.size, child.size);
      }
    });
  }
  performCommit() {
  }
  setProperty(key, value) {
    switch (key) {
      case "ali":
      case "align":
      case "alignment":
        {
          if (!(value instanceof Alignment))
            break;
          if (value._x !== this._align._x || value._y !== this._align._y) {
            this._align = Alignment.copy(value);
            this.markNeedsLayout();
          }
        }
        break;
      case "fit":
        {
          if (value !== this._fit) {
            this._fit = value;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}
class LayoutWidgetPositioned extends RenderNodeProxy {
  constructor() {
    super(...arguments);
    __publicField(this, "_left", null);
    __publicField(this, "_right", null);
    __publicField(this, "_top", null);
    __publicField(this, "_bottom", null);
    __publicField(this, "_width", null);
    __publicField(this, "_height", null);
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case "l":
      case "x":
      case "left":
        {
          if (value !== this._left) {
            this._left = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "r":
      case "right":
        {
          if (value !== this._left) {
            this._right = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "t":
      case "y":
      case "top":
      case "up":
        {
          if (value !== this._top) {
            this._top = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "b":
      case "bottom":
      case "down":
        {
          if (value !== this._bottom) {
            this._bottom = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "w":
      case "width":
        {
          if (value !== this._width) {
            this._width = value;
            this.markNeedsLayout();
          }
        }
        break;
      case "h":
      case "height":
        {
          if (value !== this._height) {
            this._height = value;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}
const LayoutManagerFactory = {
  createNode(type) {
    switch (type) {
      case "hstack":
        return new LayoutWidgetHStack(null, type);
      case "vstack":
        return new LayoutWidgetVStack(null, type);
      case "center":
        return new LayoutWidgetCenter(null, type);
      case "sizedbox":
      case "sized-box":
      case "space":
      case "spacer":
        return new LayoutWidgetSizedBox(null, type);
      case "align":
        return new LayoutWidgetAlign(null, type);
      case "flex":
        return new LayoutWidgetFlex(null, type);
      case "flexible":
        return new LayoutWidgetFlexible(null, type);
      case "expanded":
        return new LayoutWidgetExpanded(null, type);
      // case 'spacer':
      // return new LayoutWidgetSpacer(null, type);
      case "row":
        return new LayoutWidgetRow(null, type);
      case "column":
        return new LayoutWidgetColumn(null, type);
      case "padding":
        return new LayoutWidgetPadding(null, type);
      case "stack":
      case "zstack":
        return new LayoutWidgetZStack(null, type);
      case "positioned":
        return new LayoutWidgetPositioned(null, type);
      default:
        return null;
    }
  }
};
class PreferSizeManager {
  constructor(_node) {
    __publicField(this, "_node");
    __publicField(this, "_preferredSize", null);
    __publicField(this, "_defaultSize", null);
    __publicField(this, "_mixedSize", null);
    this._node = _node;
  }
  setDefaultSize(size) {
    this._defaultSize = size == null ? null : { ...size };
    let mixedSize = this._getMixedSize();
    if (!Size.equals(mixedSize, this._mixedSize)) {
      this._node.markNeedsLayout();
    }
    return this;
  }
  getDefaultSize() {
    return this._defaultSize;
  }
  _getMixedSize() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
      w: (_d = (_c = (_a = this._preferredSize) == null ? void 0 : _a.w) != null ? _c : (_b = this._defaultSize) == null ? void 0 : _b.w) != null ? _d : Number.POSITIVE_INFINITY,
      h: (_h = (_g = (_e = this._preferredSize) == null ? void 0 : _e.h) != null ? _g : (_f = this._defaultSize) == null ? void 0 : _f.h) != null ? _h : Number.POSITIVE_INFINITY
    };
  }
  /**
   * **根据已有属性选择最合适的尺寸**
   *
   * 请在`performLayout`中调用，本方法会将变化后的结果修改至宿主的`size`
   */
  chooseSize() {
    assert(this._node._constraints != null);
    assert(Constraints.isValid(this._node._constraints));
    this._mixedSize = this._getMixedSize();
    this._node.size = this._node._constraints.constrain(this._mixedSize);
  }
  setProperty(key, value) {
    switch (key) {
      case "w":
      case "width":
        {
          let val = Number(value);
          if (!isNaN(val)) {
            val = max(val, 0);
            if (this._preferredSize === null || this._preferredSize.w !== val) {
              if (this._preferredSize === null) {
                this._preferredSize = { w: null, h: null };
              }
              this._preferredSize.w = val;
              this._node.markNeedsLayout();
            }
          }
        }
        break;
      case "h":
      case "height":
        {
          let val = Number(value);
          if (!isNaN(val)) {
            val = max(val, 0);
            if (this._preferredSize === null || this._preferredSize.h !== val) {
              if (this._preferredSize === null) {
                this._preferredSize = { w: null, h: null };
              }
              this._preferredSize.h = val;
              this._node.markNeedsLayout();
            }
          }
        }
        break;
    }
  }
}
const defaultProps$a = {
  color: 13369344,
  line_width: 5
};
class NativeWidgetArc extends RenderWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    __publicField(this, "_preferredSizeManager", new PreferSizeManager(this));
    __publicField(this, "_props", { ...defaultProps$a });
    __publicField(this, "sizedByParent", false);
  }
  onCommit({ size, position, widgetFactory, initial }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.ARC, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
  }
  setProperty(key, value) {
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case "color":
        {
          this._props.color = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      case "s":
      case "sa":
      case "start":
      case "start_angle":
        {
          this._props.start_angle = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.START_ANGLE, value);
        }
        break;
      case "e":
      case "ea":
      case "end":
      case "end_angle":
        {
          this._props.end_angle = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.END_ANGLE, value);
        }
        break;
      case "lw":
      case "line_width":
        {
          this._props.line_width = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.LINE_WIDTH, value);
        }
        break;
    }
  }
}
const defaultProps$9 = {
  text_size: px(36)
};
class NativeWidgetButton extends RenderWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    __publicField(this, "_preferredSizeManager", new PreferSizeManager(this).setDefaultSize(Size.infinite));
    __publicField(this, "_props", { ...defaultProps$9 });
  }
  onCommit({ size, position, widgetFactory, initial }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.BUTTON, {
        ...this._props,
        ...position,
        ...size,
        click_func: () => {
          this.dispatchEvent(new AsukaEvent("click", {
            bubbles: true,
            cancelable: true
          }));
        },
        longpress_func: () => {
          this.dispatchEvent(new AsukaEvent("longpress", {
            bubbles: true,
            cancelable: true
          }));
        }
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
  }
  _updateDefaultSize() {
    if (this._props.normal_src) {
      let { width, height } = hmUI.getImageInfo(this._props.normal_src);
      this._preferredSizeManager.setDefaultSize({ w: width, h: height });
    }
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    console.log(`set ${key} to ${value}`);
    switch (key) {
      case "text":
        {
          if (this._props.text !== value) {
            this._props.text = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.MORE, {
                ...this.size,
                ...this.position,
                text: value
              });
          }
        }
        break;
      case "color":
        {
          if (this._props.color !== value) {
            this._props.color = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.MORE, {
                ...this.size,
                ...this.position,
                color: value
              });
          }
        }
        break;
      case "size":
      case "ts":
      case "text_size":
        {
          if (this._props.text_size !== value) {
            this._props.text_size = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.MORE, {
                ...this.size,
                ...this.position,
                text_size: value
              });
          }
        }
        break;
      case "nc":
      case "ncolor":
      case "normal_color":
        {
          if (this._props.normal_color !== value) {
            this._props.normal_color = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.MORE, {
                ...this.size,
                ...this.position,
                normal_color: value
              });
          }
        }
        break;
      case "pc":
      case "pcolor":
      case "press_color":
        {
          if (this._props.press_color !== value) {
            this._props.press_color = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.MORE, {
                ...this.size,
                ...this.position,
                press_color: value
              });
          }
        }
        break;
      case "r":
      case "radius":
        {
          if (this._props.radius !== value) {
            this._props.radius = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.MORE, {
                ...this.size,
                ...this.position,
                radius: value
              });
          }
        }
        break;
      case "ns":
      case "nsrc":
      case "normal_src":
        {
          if (this._props.normal_src !== value) {
            this._props.normal_src = value;
            this._updateDefaultSize();
            if (this._widget)
              this._widget.setProperty(hmUI.prop.MORE, {
                ...this.size,
                ...this.position,
                normal_src: value
              });
          }
        }
        break;
      case "ps":
      case "psrc":
      case "press_src":
        {
          if (this._props.press_src !== value) {
            this._props.press_src = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.MORE, {
                ...this.size,
                ...this.position,
                press_src: value
              });
          }
        }
        break;
    }
  }
}
const defaultProps$8 = {};
class NativeWidgetCanvas extends RenderWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    // _preferredSizeManager = new PreferSizeManager(this);
    __publicField(this, "_props", { ...defaultProps$8 });
    __publicField(this, "sizedByParent", true);
  }
  onCommit({ size, position, widgetFactory, initial }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.CANVAS, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
  }
  setProperty(key, value) {
    super.setProperty(key, value);
  }
}
const defaultProps$7 = {
  color: 16746632
};
class NativeWidgetCircle extends RenderWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    __publicField(this, "_preferredSizeManager", new PreferSizeManager(this));
    __publicField(this, "_props", { ...defaultProps$7 });
    __publicField(this, "sizedByParent", false);
  }
  _fromSizeAndPositionToProp(size, position) {
    let radius = min(size.h, size.w) / 2;
    return {
      radius,
      center_x: position.x + size.w / 2 - radius,
      center_y: position.y + size.h / 2 - radius
    };
  }
  onCommit({ size, position, widgetFactory, initial }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        ...this._props,
        ...this._fromSizeAndPositionToProp(size, position)
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...this._fromSizeAndPositionToProp(size, position)
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case "r":
      case "radius":
        {
          this._preferredSizeManager.setDefaultSize({ w: value, h: value });
        }
        break;
      case "color":
        {
          this._props.color = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      case "alpha":
        {
          this._props.alpha = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              ...this._props
            });
        }
        break;
    }
  }
}
const defaultProps$6 = {
  color: 13369344
};
class NativeWidgetFillRect extends RenderWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    __publicField(this, "_preferredSizeManager", new PreferSizeManager(this));
    __publicField(this, "_props", { ...defaultProps$6 });
    __publicField(this, "sizedByParent", false);
  }
  onCommit({ size, position, widgetFactory, initial }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case "r":
      case "radius":
        {
          this._props.radius = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              ...this._props
            });
        }
        break;
      case "color":
        {
          this._props.color = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      case "alpha":
        {
          this._props.alpha = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              ...this._props
            });
        }
        break;
    }
  }
}
const defaultProps$5 = {};
class NativeWidgetImage extends RenderWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    __publicField(this, "_props", { ...defaultProps$5 });
    __publicField(this, "_preferredSizeManager", new PreferSizeManager(this));
    __publicField(this, "sizedByParent", false);
  }
  onCommit({ size, position, widgetFactory, initial }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
  }
  performLayout() {
  }
  _updateDefaultSize() {
    if (this._props.src) {
      let { width, height } = hmUI.getImageInfo(this._props.src);
      this._preferredSizeManager.setDefaultSize({ w: width, h: height });
    }
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case "color":
        if (value !== this._props.color) {
          this._props.color = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      // case 'alpha':
      //   {
      //     if (value !== this._props.alpha) {
      //       this._props.alpha = value;
      //       if (this._widget)
      //         this._widget.setProperty(hmUI.prop.MORE, { ...this._props });
      //     }
      //   }
      //   break;
      case "pos_x":
        {
          if (value !== this._props.pos_x) {
            this._props.pos_x = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.POS_X, value);
          }
        }
        break;
      case "pos_y":
        {
          if (value !== this._props.pos_y) {
            this._props.pos_y = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.POS_Y, value);
          }
        }
        break;
      case "angle":
        {
          if (value !== this._props.angle) {
            this._props.angle = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.ANGLE, value);
          }
        }
        break;
      case "center_x":
        {
          if (value !== this._props.center_x) {
            this._props.center_x = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.CENTER_X, value);
          }
        }
        break;
      case "center_y":
        {
          if (value !== this._props.center_y) {
            this._props.center_y = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.CENTER_Y, value);
          }
        }
        break;
      case "alpha":
        {
          if (value !== this._props.alpha) {
            this._props.alpha = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.ALPHA, value);
          }
        }
        break;
      case "auto_scale":
        {
          if (value !== this._props.auto_scale) {
            this._props.auto_scale = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.MORE, {
                ...this._props
              });
          }
        }
        break;
      case "auto_scale_obj_fit":
        {
          if (value !== this._props.auto_scale_obj_fit) {
            this._props.auto_scale_obj_fit = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.MORE, {
                ...this._props
              });
          }
        }
        break;
      case "src":
        {
          if (value !== this._props.src) {
            this._props.src = value;
            if (this._widget)
              this._widget.setProperty(hmUI.prop.SRC, value);
          }
        }
        break;
    }
  }
}
const defaultProps$4 = {};
class NativeWidgetPolyline extends RenderWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    __publicField(this, "_preferredSizeManager", new PreferSizeManager(this));
    __publicField(this, "_props", { ...defaultProps$4 });
    __publicField(this, "sizedByParent", false);
  }
  onCommit({ size, position, widgetFactory, initial }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.GRADKIENT_POLYLINE, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case "color":
      case "line_color":
        {
          this._props.line_color = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.LINE_COLOR, value);
        }
        break;
      case "lw":
      case "line_width":
        {
          this._props.line_width = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.LINE_WIDTH, value);
        }
        break;
    }
  }
}
const defaultProps$3 = {
  content: "null"
};
class NativeWidgetQRCode extends RenderWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    __publicField(this, "_preferredSizeManager", new PreferSizeManager(this));
    __publicField(this, "_props", { ...defaultProps$3 });
    __publicField(this, "sizedByParent", false);
  }
  onCommit({ size, position, widgetFactory, initial }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.QRCODE, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case "content":
        {
          this._props.content = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.MORE, {
              ...this.position,
              ...this.size,
              content: value
            });
        }
        break;
    }
  }
}
const defaultProps$2 = {
  color: 13369344
};
class NativeWidgetRadioGroup extends RenderWidgetFactoryProvider {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    __publicField(this, "_props", { ...defaultProps$2 });
    __publicField(this, "_defaultChecked", 0);
    __publicField(this, "_registeredTask", null);
    __publicField(this, "_stateButtonWidget", []);
  }
  _registerAfterAsyncTask() {
    assert(this._attached);
    assert(this._core != null);
    if (this._registeredTask !== null) {
      this._registeredTask = () => {
        this._registeredTask = null;
        assert(this._widget != null);
        if (this._stateButtonWidget.length > 0) {
          assert(this._defaultChecked < this._stateButtonWidget.length);
          this._widget.setProperty(hmUI.prop.INIT, this._stateButtonWidget[this._defaultChecked]);
        }
      };
      this._core.addRunAfterAsync(this._registeredTask);
    }
  }
  _initChildWidgetFactory() {
    this.childWidgetFactory = {
      createWidget: (widgetType, option) => {
        assert(this._widget != null);
        let widget = this._widget.createWidget(widgetType, option);
        if (widgetType === hmUI.widget.STATE_BUTTON) {
          this._stateButtonWidget.push(widget);
        }
      },
      deleteWidget: (widget) => {
        if (widget.getType() === hmUI.widget.STATE_BUTTON) {
          splice(this._stateButtonWidget, widget);
        }
        assert(this._widget != null);
        this._widget.deleteWidget(widget);
      }
    };
  }
  onCommit({ size, position, widgetFactory, initial }) {
    assert(this._props.select_src != null);
    assert(this._props.unselect_src != null);
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        ...this._props,
        ...position,
        ...size
      });
      this._initChildWidgetFactory();
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  setProperty(key, value) {
    switch (key) {
      case "select_src":
        {
          this._props.select_src = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              ...this._props
            });
        }
        break;
      case "unselect_src":
        {
          this._props.unselect_src = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              ...this._props
            });
        }
        break;
    }
  }
}
const defaultProps$1 = {
  color: 13386752
};
class NativeWidgetStrokeRect extends RenderWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    __publicField(this, "_preferredSizeManager", new PreferSizeManager(this));
    __publicField(this, "_props", { ...defaultProps$1 });
    __publicField(this, "sizedByParent", false);
  }
  onCommit({ size, position, widgetFactory, initial }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.STROKE_RECT, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case "r":
      case "radius":
        {
          this._props.radius = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              ...this._props
            });
        }
        break;
      case "color":
        {
          this._props.color = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      case "angle":
        {
          this._props.angle = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              ...this._props
            });
        }
        break;
      case "lw":
      case "line_width":
        {
          this._props.line_width = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.LINE_WIDTH, value);
        }
        break;
    }
  }
}
const defaultProps = {
  text: "text",
  color: 16777215,
  text_size: Number(px(36)),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V
};
class NativeWidgetText extends RenderWidget {
  constructor() {
    super(...arguments);
    __publicField(this, "_widget", null);
    __publicField(this, "_props", { ...defaultProps });
    __publicField(this, "sizedByParent", false);
  }
  onCommit({ size, position, widgetFactory, initial }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.TEXT, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
  }
  performLayout() {
    assert(Constraints.isValid(this._constraints));
    let { width: singleLineWidth, height: singleLineHeight } = hmUI.getTextLayout(this._props.text, {
      text_size: this._props.text_size,
      text_width: 0,
      wrapped: 0
    });
    if (this._props.text_style !== void 0 && this._props.text_style === hmUI.text_style.WRAP) {
      if (singleLineWidth > this._constraints.maxWidth) {
        let { width, height } = hmUI.getTextLayout(this._props.text, {
          text_size: this._props.text_size,
          text_width: this._constraints.maxWidth,
          wrapped: 1
        });
        this.size = this._constraints.constrain({ w: width, h: height });
      } else {
        this.size = this._constraints.constrain({
          w: singleLineWidth,
          h: singleLineHeight
        });
      }
    } else {
      this.size = this._constraints.constrain({
        w: singleLineWidth,
        h: singleLineHeight
      });
    }
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case "text":
        {
          this._props.text = "" + value;
          if (this._widget) {
            this._widget.setProperty(hmUI.prop.TEXT, "" + value);
          }
          this.markNeedsLayout();
        }
        break;
      case "color":
        {
          this._props.color = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      case "text_size":
        {
          this._props.text_size = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.TEXT_SIZE, value);
        }
        break;
      case "text_style":
        {
          this._props.text_style = value;
          if (this._widget)
            this._widget.setProperty(hmUI.prop.TEXT_STYLE, value);
        }
        break;
    }
  }
}
const NativeBindingsFactory = {
  createNode(type) {
    switch (type) {
      case "text":
        return new NativeWidgetText(null, type);
      case "fill-rect":
      case "fill_rect":
      case "fillrect":
        return new NativeWidgetFillRect(null, type);
      case "stroke-rect":
      case "stroke_rect":
      case "strokerect":
      case "stroke":
        return new NativeWidgetStrokeRect(null, type);
      case "image":
      case "img":
        return new NativeWidgetImage(null, type);
      case "button":
        return new NativeWidgetButton(null, type);
      case "circle":
        return new NativeWidgetCircle(null, type);
      case "arc":
        return new NativeWidgetArc(null, type);
      case "qrcode":
        return new NativeWidgetQRCode(null, type);
      case "polyline":
        return new NativeWidgetPolyline(null, type);
      case "canvas":
        return new NativeWidgetCanvas(null, type);
      case "radio":
      case "radio_group":
      case "radiogroup":
        return new NativeWidgetRadioGroup(null, type);
      default:
        return null;
    }
  }
};
const asukauiPlatformZeppos = AsukaUIPlatformZeppOS = {
  getWidgetFactorySize(mount) {
    let size;
    if (mount === hmUI__default) {
      let { width, height } = getDeviceInfo();
      size = { w: width, h: height };
    } else {
      try {
        size = {
          w: mount.getProperty(hmUI__default.prop.W),
          h: mount.getProperty(hmUI__default.prop.H)
        };
      } catch (e) {
        reportError("createFrame", e);
      }
    }
    return size;
  }
};
export {
  AsukaUI as A,
  CrossAxisAlignment as C,
  EdgeInsets as E,
  LayoutManagerFactory as L,
  MainAxisAlignment as M,
  NativeBindingsFactory as N,
  StackFit as S,
  asukauiPlatformZeppos as a,
  Alignment as b,
  assert as c,
  AsukaUnknownNode as d,
  isTextNode as i,
  reportError as r
};

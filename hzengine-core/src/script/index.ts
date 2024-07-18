import { HZEngineCore } from "..";

import * as hmFS from "@zos/fs";
import * as hmApp from "@zos/app";
import path from "@cuberqaq/path-polyfill";
export class Script {
  constructor(private _core: HZEngineCore) {}

  // Route Stack
  private _routeStack: ([path: string, index: number] | null)[] = [];

  private _nextRunPosition: [path: string, index: number] | null = null;


  // Label Point Control

  /**
   * 跳转到目标标签
   * @param targetLabel
   */
  jump(targetLabel: string) {
    let labelData = this._locateLabel(targetLabel)
    this._nextRunPosition = labelData;
  }

  /**
   * 调用目标标签
   * 保存当前执行位置至调用栈，跳转到目标位置，直到return返回
   * @param targetLabel
   */
  call(targetLabel: string) {
    let labelData = this._locateLabel(targetLabel);
    this._routeStack.push(this._nextRunPosition)
    this._nextRunPosition = labelData;
  }

  return() {
    this._nextRunPosition = this._routeStack.pop() ?? null
  }

  private _locateLabel(labelName: string) {
    if (this._core.storage.preloadedData == null)
      throw "Preloaded Data is Null";
    let labelData: [name: string, index: number] | undefined =
      this._core.storage.preloadedData.script.labelMap[labelName];
    if (!labelData) throw `Label "${labelName} not found"`;
    return labelData;
  }

  // Middleware
  private _middlewares: Script.Middleware[] = [];
  use(middleware: Script.Middleware, add_front: boolean = false) {
    if (add_front) {
      this._middlewares.unshift(middleware);
    } else {
      this._middlewares.push(middleware);
    }
  }

  private _processCmd(cmd: string) {
    let ctx = this._buildContext(cmd);
    if (this._middlewares.length === 0) return;
    let i = 0,
      len = this._middlewares.length;
    let nextFunc = () => {
      i++;
      if (i >= len) return;
      this._middlewares[i](ctx, nextFunc);
    };
    this._middlewares[0](ctx, nextFunc);
  }

  private _buildContext(cmd: string): Script.Context {
    return {
      rawtext: cmd,
    };
  }
}

declare namespace Script {
  type Middleware = (ctx: Context, next: () => void) => void;
  interface Context {
    rawtext: string;
  }
}

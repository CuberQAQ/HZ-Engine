import { HZEngineCore, Storage } from "../index.js";
import { Save } from "../storage/decorator.js";
import { ZeppTimer } from "./zeppos_timer.js";
// import { Time } from "@zos/sensor";

export class Async {
  static _nextTickCallbacks: (() => void)[] = [];
  static _nextTickTimerId: number | null = null;
  static nextTick(callback: () => void) {
    this._nextTickCallbacks.push(callback);
    if (this._nextTickTimerId == null) {
      this._nextTickTimerId = setTimeout(() => {
        this._nextTickTimerCallback();
      }, 30) as unknown as number;
    }
  }

  static _nextTickTimerCallback() {
    this._nextTickTimerId = null;
    const callbacks = this._nextTickCallbacks;
    this._nextTickCallbacks = [];
    callbacks.forEach((cb) => {
      cb();
    });
  }

  // private _fps = 45;
  // private _hmTime = new Time();
  private _lastTime: number;
  constructor(public _core: HZEngineCore) {
    // console.log("async init");
    // let timer = new ZeppTimer(() => {
    // //   console.log(`async timer cb`);
    //   this._scheduleTask();
    // }, ~~(1000 / this._fps));
    // timer.start();
    this._lastTime = this._core.platform.getTime();
    // setInterval(() => {
    //   this._scheduleTask();
    // }, ~~(1000 / this._fps));
    _core.platform.setFrameInterval(() => {
      this._scheduleTask();
    });
  }

  _scheduleTask() {
    // TODO 沒有充分考慮存檔時產生的問題（this._delayTasks引用變化），及其它問題
    let now = this._core.platform.getTime();
    let deltaTime = now - this._lastTime;
    this._lastTime = now;

    // console.log(`async timer cb d=${deltaTime}`);

    for (let id in this._delayTasks) {
      let task = this._delayTasks[id];
      task.next -= deltaTime;
      if (task.next <= 0) {
        this._core.emit(task.event, ...task.args);
        if (task.repeat >= 0) {
          // interval
          task.next += task.repeat;
        } else {
          delete this._delayTasks[id];
        }
      }
    }
  }

  @Save("async.nextTimerId")
  private accessor _nextTimerId: number = 50;

  // tasks
  @Save("async.delayTasks")
  private accessor _delayTasks: Record<number, Async.Task> = {};

  // 注意在task執行中立即創建一個新的task，會在同一個js task中執行
  // 注意周期實際為1個frame的時間的整數倍
  addDelayTask(
    event: string,
    args: Storage.Saveable<unknown>[],
    delayMs: number
  ): number {
    let task: Async.Task = {
      event,
      args,
      next: delayMs,
      repeat: -1,
    };
    let id = this._nextTimerId++;
    this._delayTasks[id] = task;
    return id;
  }

  addRepeatTask(
    event: string,
    args: Storage.Saveable<unknown>[],
    intervalMs: number,
    delayMs?: number
  ): number {
    intervalMs = intervalMs >= 0 ? intervalMs : 0;
    let task: Async.Task = {
      event,
      args,
      next: delayMs ?? intervalMs,
      repeat: intervalMs,
    };
    let id = this._nextTimerId++;
    this._delayTasks[id] = task;
    return id;
  }

  removeTask(id: number) {
    delete this._delayTasks[id];
  }
}

export namespace Async {
  export interface Task {
    event: string;
    args: Storage.Saveable<unknown>[];
    next: number; // remaining time in ms
    repeat: number; // -1 for once ; >=0 for repeat circle
  }
}

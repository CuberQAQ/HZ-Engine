import { HZEngineCore } from "../index.js";
import { Save } from "../storage/decorator.js";

export class System {
  constructor(public _core: HZEngineCore) {
    _core.on("system.continue", () => {
      this._pauseTimer = null;
      this.continue();
    });
  }

  @Save("system.condition")
  accessor condition: System.Condition = System.Condition.Free;

  _pauseTimer: number | null = null;

  /**
   * 暂停(可指定一段时间)
   * 后调用的会覆盖之前pause的设定时间
   * @param delayMs
   */
  pause(delayMs?: number) {
    this._core.debug.log(`Pause`);

    if (this.condition === System.Condition.Gaming) {
      this.condition = System.Condition.Pause;
    } else throw `pause but condition error (todo)`; // TODO

    if (this._pauseTimer) {
      this._core.async.removeTask(this._pauseTimer);
      this._pauseTimer = null;
    }

    if (delayMs !== undefined) {
      this._pauseTimer = this._core.async.addDelayTask(
        "system.continue",
        [],
        delayMs
      );
    }
  }

  /**
   * 继续由于pause中断的游戏
   */
  continue() {
    if (this.condition !== System.Condition.Pause) return;
    this.condition = System.Condition.Gaming;
    this.run();
  }

  /**
   * 阻塞
   */
  block() {
    if (this.condition !== System.Condition.Gaming)
      throw `block but condition error (todo)`;
    this.condition = System.Condition.Blocked;
  }
  /**
   * 取消阻塞
   */
  unBlock() {
    if (this.condition !== System.Condition.Blocked) return;
    this.condition = System.Condition.Gaming;
    this.run();
  }

  run() {
    this.condition = System.Condition.Gaming;
    while (this.condition === System.Condition.Gaming) {
      // console.log("Run Single Line");
      this._core.script.runSingleLine();
    }
  }

  start(initLabel: string = "start") {
    // 初始化存档
    this._core.storage.archiveData;
    this._core.debug.log("Game Start");

    this._core.script.clear();
    this._core.script.jumpLabel(initLabel);
    this.run();
  }
}

export namespace System {
  export enum Condition {
    Free,
    Pause,
    Blocked,
    Gaming,
  }
}

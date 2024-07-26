import { HZEngineCore } from "..";
import { ArchiveStateAccessor } from "../storage/decorator";

export class System {
  constructor(public _core: HZEngineCore) {}

  @ArchiveStateAccessor("system.condition")
  accessor condition: System.Condition = System.Condition.Free;

  pause(delayMs?: number) {
    console.log(`[HZEngine] Pause`);

    if (delayMs) throw `delayMs not implemented`;
    if (this.condition === System.Condition.Gaming) {
      this.condition = System.Condition.Pause;
    } else throw `pause but condition error (todo)`; // TODO
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
    let isRunnable = true;
    while (isRunnable && this.condition === System.Condition.Gaming) {
      // console.log("Run Single Line");
      isRunnable = this._core.script.runSingleLine();
    }
  }

  start(initLabel: string = "start") {
    // 初始化存档
    this._core.storage.archiveData
    console.log("ciallo");
    
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

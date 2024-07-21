"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
class System {
    constructor(_core) {
        this._core = _core;
        this.condition = System.Condition.Free;
    }
    pause(delayMs) {
        console.log(`[HZEngine] Pause`);
        if (delayMs)
            throw `delayMs not implemented`;
        if (this.condition === System.Condition.Gaming) {
            this.condition = System.Condition.Pause;
        }
        else
            throw `pause but condition error (todo)`; // TODO
    }
    /**
     * 继续由于pause中断的游戏
     */
    continue() {
        if (this.condition !== System.Condition.Pause)
            return;
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
        if (this.condition !== System.Condition.Blocked)
            return;
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
    start(initLabel = "start") {
        this._core.script.clear();
        this._core.script.jumpLabel(initLabel);
        this.run();
    }
}
exports.System = System;
(function (System) {
    let Condition;
    (function (Condition) {
        Condition[Condition["Free"] = 0] = "Free";
        Condition[Condition["Pause"] = 1] = "Pause";
        Condition[Condition["Blocked"] = 2] = "Blocked";
        Condition[Condition["Gaming"] = 3] = "Gaming";
    })(Condition = System.Condition || (System.Condition = {}));
})(System || (exports.System = System = {}));

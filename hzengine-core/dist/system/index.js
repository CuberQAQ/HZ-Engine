"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
class System {
    constructor(_core) {
        this._core = _core;
        this.Condition = System.Condition.Free;
    }
    pause(delayMs) {
    }
    start(initLabel = "start") {
    }
}
exports.System = System;
(function (System) {
    let Condition;
    (function (Condition) {
        Condition[Condition["Free"] = 0] = "Free";
        Condition[Condition["Pause"] = 1] = "Pause";
        Condition[Condition["Gaming"] = 2] = "Gaming";
    })(Condition = System.Condition || (System.Condition = {}));
})(System || (exports.System = System = {}));

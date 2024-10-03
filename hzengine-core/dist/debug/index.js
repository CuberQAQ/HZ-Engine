"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debug = void 0;
class Debug {
    constructor(_core) {
        this._core = _core;
    }
    log(...args) {
        console.log(...args);
    }
}
exports.Debug = Debug;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Async = void 0;
class Async {
    static nextTick(callback) {
        this._nextTickCallbacks.push(callback);
        if (this._nextTickTimerId == null) {
            this._nextTickTimerId = setTimeout(() => {
                this._nextTickTimerCallback();
            }, 0);
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
}
exports.Async = Async;
Async._nextTickCallbacks = [];
Async._nextTickTimerId = null;

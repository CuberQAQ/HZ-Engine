import { HZEngineCore } from "..";

export class Async {
    static _nextTickCallbacks: (() => void)[] = [];
    static _nextTickTimerId: number | null = null;
    static nextTick(callback: () => void) {
        this._nextTickCallbacks.push(callback);
        if(this._nextTickTimerId == null) {
            this._nextTickTimerId = setTimeout(() => {
                this._nextTickTimerCallback()
            }, 0)
        }
    }

    static _nextTickTimerCallback() {
        this._nextTickTimerId = null;
        const callbacks = this._nextTickCallbacks;
        this._nextTickCallbacks = [];
        callbacks.forEach((cb) => {
            cb();
        })
    }
    
}
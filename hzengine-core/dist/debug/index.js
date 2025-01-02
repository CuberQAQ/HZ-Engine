export class Debug {
    constructor(_core) {
        this._core = _core;
    }
    log(...args) {
        console.log("[HZEngine]", ...args);
    }
}

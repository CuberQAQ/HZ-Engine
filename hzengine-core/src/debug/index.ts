import { HZEngineCore } from "..";

export class Debug {
    constructor(private _core: HZEngineCore) {

    }

    log(...args: any[]) {
        console.log("[HZEngine]", ...args);
    }
}
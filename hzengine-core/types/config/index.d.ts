import { HZEngineCore } from "../index.js";
export declare class Config {
    private _core;
    constructor(_core: HZEngineCore);
    getConfig(key: string): NonNullable<import("../index.js").Storage.JSONValue> | undefined;
    setConfig(key: string, value: any): void;
    private normalizeKey;
    resetConfig(): void;
}

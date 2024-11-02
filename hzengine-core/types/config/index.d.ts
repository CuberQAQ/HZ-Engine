import { HZEngineCore } from "..";
export declare class Config {
    private _core;
    constructor(_core: HZEngineCore);
    getConfig(key: string): NonNullable<import("..").Storage.JSONValue> | undefined;
    setConfig(key: string, value: any): void;
    private normalizeKey;
    resetConfig(): void;
}

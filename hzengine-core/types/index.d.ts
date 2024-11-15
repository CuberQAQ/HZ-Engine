/**
 * HZEngineCore
 * @copyright Copyright (c) 2024 CuberQAQ. All rights reserved.
 */
import { Async } from "./async/index.js";
import { Audio } from "./audio/index.js";
import { Config } from "./config/index.js";
import { Debug } from "./debug/index.js";
import { Script } from "./script/index.js";
import { Storage } from "./storage/index.js";
import { System } from "./system/index.js";
import { UI } from "./ui/index.js";
declare class HZEngineCore {
    private _eventCallbacks;
    storage: Storage;
    async: Async;
    ui: UI;
    script: Script;
    system: System;
    config: Config;
    audio: Audio;
    debug: Debug;
    constructor();
    loadProject(options: {
        projectPath: string;
        cachePath: string;
        savePath: string;
    }): void;
    start(callback?: () => unknown): void;
    end(): void;
    plugins: Map<string, unknown>;
    loadPlugin(name: string, plugin: Plugin): void;
    on(event: string, cb: Function): void;
    off(event: string, cb: Function): boolean;
    emit(event: string, ...args: any[]): void;
}
type Plugin = (core: HZEngineCore) => any;
export { HZEngineCore, UI, Storage, Script, System, Async };
export * as TransformPlugin from "./plugins/transform/index.js";

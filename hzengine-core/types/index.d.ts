/**
 * HZEngineCore
 * @copyright Copyright (c) 2024 CuberQAQ. All rights reserved.
 */
import { Async } from "./async/index.js";
import { Audio } from "./audio/index.js";
import { Config } from "./config/index.js";
import { Debug } from "./debug/index.js";
import Platform from "./platform/index.js";
import { Script } from "./script/index.js";
import { Storage } from "./storage/index.js";
import { System } from "./system/index.js";
import { UI } from "./ui/index.js";
declare class HZEngineCore<PlatformType extends Platform = any> {
    platform: PlatformType;
    private _eventCallbacks;
    storage: Storage;
    async: Async;
    ui: UI<PlatformType>;
    script: Script;
    system: System<PlatformType>;
    config: Config;
    audio: Audio;
    debug: Debug;
    constructor(platform: PlatformType);
    loadProject(options: {
        projectPath: string;
        cachePath: string;
        savePath: string;
    }): void;
    start(callback?: () => unknown): void;
    end(): void;
    plugins: Map<string, unknown>;
    loadPlugin(name: string, plugin: Plugin<PlatformType>): void;
    on(event: string, cb: Function): void;
    off(event: string, cb: Function): boolean;
    emit(event: string, ...args: any[]): void;
}
type Plugin<PlatformType extends Platform> = (core: HZEngineCore<PlatformType>) => any;
export { HZEngineCore, UI, Storage, Script, System, Async, type Platform };
export * as TransformPlugin from "./plugins/transform/index.js";

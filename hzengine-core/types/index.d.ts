/**
 * HZEngineCore
 * @copyright Copyright (c) 2024 CuberQAQ. All rights reserved.
 */
import { Script } from "./script";
import { Storage } from "./storage";
import { System } from "./system";
import { UI } from "./ui";
declare class HZEngineCore {
    private _eventCallbacks;
    storage: Storage;
    ui: UI;
    script: Script;
    system: System;
    constructor();
    loadProject(projectPath: string): void;
    start(callback?: () => unknown): void;
    loadPlugin(name: string, plugin: Plugin): void;
    on(event: string, cb: Function): void;
    off(event: string, cb: Function): boolean;
    emit(event: string, ...args: any[]): void;
}
type Plugin = (core: HZEngineCore) => void;
export { HZEngineCore, UI, Storage, Script, System };

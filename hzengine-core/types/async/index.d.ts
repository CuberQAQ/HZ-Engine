import { HZEngineCore, Storage } from "../index.js";
export declare class Async {
    _core: HZEngineCore;
    static _nextTickCallbacks: (() => void)[];
    static _nextTickTimerId: number | null;
    static nextTick(callback: () => void): void;
    static _nextTickTimerCallback(): void;
    private _fps;
    private _hmTime;
    private _lastTime;
    constructor(_core: HZEngineCore);
    _scheduleTask(): void;
    private accessor _nextTimerId;
    private accessor _delayTasks;
    addDelayTask(event: string, args: Storage.Saveable<unknown>[], delayMs: number): number;
    addRepeatTask(event: string, args: Storage.Saveable<unknown>[], intervalMs: number, delayMs?: number): number;
    removeTask(id: number): void;
}
export declare namespace Async {
    interface Task {
        event: string;
        args: Storage.Saveable<unknown>[];
        next: number;
        repeat: number;
    }
}

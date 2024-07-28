export declare class Async {
    static _nextTickCallbacks: (() => void)[];
    static _nextTickTimerId: number | null;
    static nextTick(callback: () => void): void;
    static _nextTickTimerCallback(): void;
}

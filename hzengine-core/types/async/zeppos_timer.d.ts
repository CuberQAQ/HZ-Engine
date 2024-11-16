export class ZeppTimer {
    constructor(callback: any, interval: any);
    callback: any;
    interval: any;
    timerId: any;
    startTime: any;
    nextTick: any;
    time: any;
    stopped: boolean;
    start(delay?: number): void;
    stop(): void;
    scheduleTick(): void;
    tick(): void;
}

export class ZeppTimer {
    constructor(callback: any, interval: any);
    callback: any;
    interval: any;
    timerId: any;
    startTime: number | null;
    nextTick: any;
    time: Time;
    stopped: boolean;
    start(delay?: number): void;
    stop(): void;
    scheduleTick(): void;
    tick(): void;
}
import { Time } from "@zos/sensor";

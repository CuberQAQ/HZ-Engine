import { HZEngineCore } from "..";
export declare class System {
    _core: HZEngineCore;
    constructor(_core: HZEngineCore);
    accessor condition: System.Condition;
    pause(delayMs?: number): void;
    /**
     * 继续由于pause中断的游戏
     */
    continue(): void;
    /**
     * 阻塞
     */
    block(): void;
    /**
     * 取消阻塞
     */
    unBlock(): void;
    run(): void;
    start(initLabel?: string): void;
}
export declare namespace System {
    enum Condition {
        Free = 0,
        Pause = 1,
        Blocked = 2,
        Gaming = 3
    }
}

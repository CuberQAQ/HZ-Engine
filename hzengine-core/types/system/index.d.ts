import { HZEngineCore, Platform } from "../index.js";
export declare class System<PlatformType extends Platform> {
    _core: HZEngineCore<PlatformType>;
    constructor(_core: HZEngineCore<PlatformType>);
    accessor condition: System.Condition;
    _pauseTimer: number | null;
    /**
     * 暂停(可指定一段时间)
     * 后调用的会覆盖之前pause的设定时间
     * @param delayMs
     */
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

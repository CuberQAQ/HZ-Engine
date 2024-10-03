/**
 * animation.js
 * @description A library for providing multi-track animations in ZeppOS. 一个用于在ZeppOS中提供简单动画的库
 * @date 2024/10/2
 * @author CuberQAQ
 */
export declare class Animation {
    profile: AnimationProfile;
    timer: Timer<any>;
    protected options?: Animation.Options | undefined;
    constructor(profile: AnimationProfile, timer: Timer<any>, options?: Animation.Options | undefined);
    onStop: ((animation: Animation) => void) | null;
    serialize(): string;
    static unserialize(data: string): Animation;
    timerCb(): void;
    start(): void;
    reverse(): void;
    stop(): void;
}
export declare namespace Animation {
    interface Options {
    }
    interface Serialized {
        profile: AnimationProfile.Serialized;
    }
}
export declare class AnimationProfile {
    trackList: AnimationProfile.TrackList;
    constructor(trackList: AnimationProfile.TrackList);
    static intersect(profile1: AnimationProfile, profile2: AnimationProfile): AnimationProfile;
}
export declare namespace AnimationProfile {
    interface Serialized {
    }
    type TrackList = Track[];
    type Track = Frame[];
    type Frame = {
        duration?: number;
        delay?: number;
        wrapper?: keyof typeof buildInWrappers | Wrapper;
        frame: Record<string, FrameItem>;
    };
    type FrameItem = number | boolean | string;
}
export interface Timer<TimerIdType> {
    init(animation: Animation): void;
    setTimeout(timeout?: number): TimerIdType;
    clearTimeout(timerId: TimerIdType): void;
    setInterval(interval?: number): TimerIdType;
    clearInterval(timerId: TimerIdType): void;
    getTime(): number;
    setOption?(option: Timer.Options): void;
}
export declare namespace Timer {
    interface Options {
        fps?: number;
    }
}
export type Wrapper = (delta: number) => number;
declare const buildInWrappers: {
    linear: (delta: number) => number;
    easein: (delta: number) => number;
    easeout: (delta: number) => number;
    easeinout: (delta: number) => number;
};
export {};

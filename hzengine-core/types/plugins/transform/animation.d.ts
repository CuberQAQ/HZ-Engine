/**
 * animation.js
 * @description A library for providing multi-track animations in ZeppOS. 一个用于在ZeppOS中提供简单动画的库
 * @date 2024/10/2
 * @author CuberQAQ
 */
export declare class Animation<P extends Profile.PropsType = unknown> {
    normalizedProfile: Profile.Track<P>;
    initProps: Partial<P>;
    activeRootTrack: ActiveTrackNode<P> | null;
    lastTime: number;
    onFrame: ((props: Partial<P>) => void) | null;
    onEnd: (() => void) | null;
    customWrappers: Record<string, Wrapper>;
    constructor(profile: Profile<P>, options?: Animation.Options<P>);
    onStop: ((animation: Animation<P>) => void) | null;
    serialize(): Animation.Serialized;
    static unserialize(serialized: Animation.Serialized, wrappers?: Record<string, Wrapper>): Animation<unknown>;
    timerCb(): void;
    init(): void;
    goto(time: number): void;
    step(delta_time: number): void;
    calcProps(): Partial<P>;
    reverse(): void;
    stop(): void;
    _accessProfile(accessKeys: string[]): unknown;
    _getWrapper(wrapper: string | Wrapper | undefined): Wrapper;
    _calcWrappedProps<P extends Profile.PropsType>(former_props: Partial<P>, props: Partial<P>, wrapper: Wrapper | string | undefined, progress: number): Partial<P>;
}
export declare namespace Animation {
    interface Options<P extends Profile.PropsType> {
        initProps?: Partial<P>;
        wrappers?: Record<string, Wrapper>;
    }
    interface Serialized {
        normalizedProfile: Profile.Serialized;
        initProps?: Partial<unknown>;
        activeRootTrack?: ActiveTrackNode.Serialized;
        lastTime: number;
    }
}
export type Profile<P extends Profile.PropsType = unknown> = Profile.Section<P> | Profile.Track<P> | Profile.TrackList<P>;
export declare namespace Profile {
    type Serialized = Profile;
    type TrackList<P extends PropsType> = Track<P>[];
    type Track<P extends PropsType> = Section<P>[];
    type Section<P extends PropsType> = {
        time?: number;
        repeat?: number;
        wrapper?: keyof typeof buildInWrappers | string | Wrapper;
        frame?: Partial<P>;
        syncs?: Profile<P>[];
        asyncs?: Profile<P>[];
    };
    type FrameItem = number | boolean | string;
    type PropsType = Record<string, FrameItem> | unknown;
    function normalize<P extends PropsType>(profile: Profile<P>): Track<P>;
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
export declare class ActiveTrackNode<P extends Profile.PropsType> {
    #private;
    animation: Animation;
    accessKeys: string[];
    currentIndex: number | null;
    repeated: number;
    status: ActiveTrackNode.Status;
    now_time: number;
    get currentSection(): Profile.Section<P>;
    get currentTrack(): Profile.Track<P> | null;
    lastProps: Partial<P>;
    nowProps: Partial<P>;
    constructor(animation: Animation, { accessKeys, index, initProps, }: {
        accessKeys: string[];
        index: number | null;
        initProps: Partial<P>;
    });
    serialize(): ActiveTrackNode.Serialized;
    static unserialize<P>(animation: Animation, serialized: ActiveTrackNode.Serialized): ActiveTrackNode<P>;
    /**
     *
     * @param delta_time
     * @returns 剩餘的時間
     */
    step(delta_time: number): number;
    calcProps(): Partial<P>;
    _switchNextSection(): boolean;
    activeSyncs: ActiveTrackNode<P>[];
    initSyncs(): void;
    stepSyncs(delta_time: number): number;
    checkSyncsFinished(): boolean;
    getSyncsProps(): Partial<P>;
}
export declare namespace ActiveTrackNode {
    enum Status {
        Playing = 0,
        WaitingSyncs = 1,
        Pause = 2
    }
    interface Serialized {
        accessKeys: string[];
        currentIndex: number | null;
        repeated: number;
        status: ActiveTrackNode.Status;
        now_time: number;
        lastProps: Partial<unknown>;
        nowProps: Partial<unknown>;
        activeSyncs: ActiveTrackNode.Serialized[];
    }
}
export type Wrapper = (x: number) => number;
declare const buildInWrappers: {
    none: (x: number) => 0 | 1;
    linear: (x: number) => number;
    easeout: (x: number) => number;
    easein: (x: number) => number;
    easeinout: (x: number) => number;
};
export {};

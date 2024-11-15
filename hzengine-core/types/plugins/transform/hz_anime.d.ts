import { HZEngineCore, Storage, UI } from "../../index.js";
import { Animation, Profile, Wrapper } from "./animation.js";
export declare class AnimationPlugin {
    _core: HZEngineCore;
    constructor(_core: HZEngineCore);
    private accessor _nextAnimationId;
    private accessor _animationMap;
    private _timeSensor;
    private _lastCbUtc;
    applyAnimation<P extends Profile.PropsType>({ profile, targetView, options, }: {
        profile: Profile<P>;
        targetView: UI.View<Storage.Saveable<unknown>>;
        options?: AnimationPlugin.Options;
    }): number;
    stopAnimation(id: number): void;
    private _nextTempAnimationId;
    _tempAnimationMap: Record<string, Animation>;
    createTempAnimation<P extends Profile.PropsType = unknown>({ profile, onFrame, onEnd, initProps, wrappers, }: {
        profile: Profile<P>;
        onFrame?: (props: Partial<P>) => void;
        onEnd?: () => void;
        initProps?: Partial<P>;
        wrappers?: Record<string, Wrapper>;
    }): number;
    clearTempAnimation(id: number): void;
    private _timerCb;
    private _frameCb;
    private _linkAnimationCb;
    private _endCb;
}
declare namespace AnimationPlugin {
    interface Options {
        destroyOnEnd?: boolean;
        isSave?: boolean;
        customWrappers?: Record<string, Wrapper>;
    }
    interface AnimationItem {
        destroyOnEnd: boolean;
        isSave: boolean;
        targetViewId: number;
        instance: Animation;
    }
    namespace AnimationItem {
        interface Serialized {
            destroyOnEnd: boolean;
            isSave: boolean;
            targetViewId: number;
            serializedInstance: Animation.Serialized;
        }
    }
}
export {};

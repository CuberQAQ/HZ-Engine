import { HZEngineCore, Storage, UI } from "../..";
import { AnimationPlugin } from "./hz_anime";
import { Animation, Profile } from "./animation";
import { TransitionData } from "./commands";
export declare function registerPlugin(core: HZEngineCore): InstanceType;
export interface InstanceType {
    applyTransform(names: string[], target: UI.View<Storage.Saveable<unknown>>, isSave?: boolean, destroyOnEnd?: boolean): void;
    getProfile(name: string): Profile | null;
    createStrategy(outTransforms: string[] | null, inTransforms: string[] | null): UI.Router.RouteStrategy;
    animationPlugin: AnimationPlugin;
    getTransition(name: string): TransitionData | null;
}
export { Animation, Profile, AnimationPlugin };

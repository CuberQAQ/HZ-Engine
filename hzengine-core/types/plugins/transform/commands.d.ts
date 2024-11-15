import { HZEngineCore } from "../../index.js";
export declare function registerHzscriptCommands(core: HZEngineCore): void;
export declare function getTransitionMap(core: HZEngineCore): Record<string, TransitionData>;
export type TransitionData = {
    inTransforms: string[];
    outTransforms: string[];
};

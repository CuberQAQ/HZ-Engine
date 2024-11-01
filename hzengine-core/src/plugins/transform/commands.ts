import { HZEngineCore, Script } from "../..";

export function registerHzscriptCommands(core: HZEngineCore) {
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0] !== "transition") return next();
    if (ctx.rawtext.includes(`"`))
      throw `Transition Command: cannot have quotes in transition command`;
    if (ctx.slicedArgs.length !== 4)
      throw `Transition Command: incorrect amount of args`;
    if (ctx.slicedArgs[1].isQuoted || ctx.slicedArgs[1].isSquared)
      throw `Transition Command: invalid transition name type`;
    let transitionName = ctx.slicedArgs[1].str;
    if (
      ctx.slicedArgs[2].isQuoted ||
      ctx.slicedArgs[2].isSquared ||
      ctx.slicedArgs[2].str !== "="
    ) {
      throw `the third arg of transition command should be "="`;
    }
    let tuple_str = Script.Utils.joinSlicedArgs(ctx.slicedArgs.slice(3));
    let tuple = Script.Utils.parseTuple(tuple_str);
    if (tuple.length !== 2) {
      throw `thransition tuple must have 2 args`;
    }

    let inTransforms: string[] = (tuple[0] as string).startsWith("[")
      ? Script.Utils.parseArray((tuple[0] as string)) as string[]
      : [(tuple[0] as string)];
    let outTransforms: string[] = (tuple[1] as string).startsWith("[")
      ? Script.Utils.parseArray((tuple[1] as string)) as string[]
      : [(tuple[1] as string)];

    let transitionMap = getTransitionMap(core);
    transitionMap[transitionName] = {
      inTransforms,
      outTransforms,
    };
  });
}

export function getTransitionMap(core: HZEngineCore) {
  return core.storage.getSaveableData(
    core.storage.archiveData,
    true,
    "script",
    "transitionMap"
  ) as unknown as Record<string, TransitionData>;
}

export type TransitionData = {
  inTransforms: string[];
  outTransforms: string[];
};

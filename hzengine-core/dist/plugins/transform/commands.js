"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHzscriptCommands = registerHzscriptCommands;
exports.getTransitionMap = getTransitionMap;
const __1 = require("../..");
function registerHzscriptCommands(core) {
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(" ")[0] !== "transition")
            return next();
        if (ctx.rawtext.includes(`"`))
            throw `Transition Command: cannot have quotes in transition command`;
        if (ctx.slicedArgs.length !== 4)
            throw `Transition Command: incorrect amount of args`;
        if (ctx.slicedArgs[1].isQuoted || ctx.slicedArgs[1].isSquared)
            throw `Transition Command: invalid transition name type`;
        let transitionName = ctx.slicedArgs[1].str;
        if (ctx.slicedArgs[2].isQuoted ||
            ctx.slicedArgs[2].isSquared ||
            ctx.slicedArgs[2].str !== "=") {
            throw `the third arg of transition command should be "="`;
        }
        let tuple_str = __1.Script.Utils.joinSlicedArgs(ctx.slicedArgs.slice(3));
        let tuple = __1.Script.Utils.parseTuple(tuple_str);
        if (tuple.length !== 2) {
            throw `thransition tuple must have 2 args`;
        }
        let inTransforms = tuple[0].startsWith("[")
            ? __1.Script.Utils.parseArray(tuple[0])
            : [tuple[0]];
        let outTransforms = tuple[1].startsWith("[")
            ? __1.Script.Utils.parseArray(tuple[1])
            : [tuple[1]];
        let transitionMap = getTransitionMap(core);
        transitionMap[transitionName] = {
            inTransforms,
            outTransforms,
        };
    });
}
function getTransitionMap(core) {
    return core.storage.getSaveableData(core.storage.archiveData, true, "script", "transitionMap");
}

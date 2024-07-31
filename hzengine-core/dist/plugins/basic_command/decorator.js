"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorator_module = decorator_module;
const strtools_1 = require("../../script/strtools");
function decorator_module(core) {
    core.script.use((ctx, next) => {
        if (!ctx.slicedArgs[0].isSquared)
            return next();
        let decorator = ctx.slicedArgs[0].str.toLowerCase();
        switch ((0, strtools_1.splitStr2Strs)(decorator).join("").toLowerCase()) {
            case "real=true":
                core.storage.globalData.realEnv = true;
                break;
            case "real":
                if (!core.storage.globalData.realEnv) {
                    return;
                }
                break;
            default:
                console.log(`Decorator: Unknown decorator [${decorator}]`);
        }
        ctx.rawtext = ctx.rawtext.trim().slice(ctx.slicedArgs[0].str.length + 2).trim();
        if (!ctx.rawtext.length)
            return;
        return next();
    }, true);
}

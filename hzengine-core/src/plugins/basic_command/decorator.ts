import { HZEngineCore } from "../..";
import { splitStr2Objs, splitStr2Strs } from "../../script/strtools";

export function decorator_module(core: HZEngineCore) {
  core.script.use((ctx, next) => {
    if (
      !ctx.slicedArgs[0].isSquared
    )
      return next();

    let decorator = ctx.slicedArgs[0].str.toLowerCase();

    switch (splitStr2Strs(decorator).join("").toLowerCase()) {
      case "real=true":
        (core.storage.globalData as any).realEnv = true;
        break;
      case "real":
        if (!(core.storage.globalData as any).realEnv) {
          return;
        }
        break;
      default:
        core.debug.log(`Decorator: Unknown decorator [${decorator}]`);
    }
    ctx.rawtext = ctx.rawtext.trim().slice(ctx.slicedArgs[0].str.length + 2).trim();
    if(!ctx.rawtext.length) return
    return next();
  }, true);
}

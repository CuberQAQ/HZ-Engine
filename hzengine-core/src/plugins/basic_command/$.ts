import { HZEngineCore } from "../..";

export function $_command(core: HZEngineCore) {

    core.script.use((ctx, next) => {
        if(ctx.rawtext.trim().startsWith("$")) {
            ctx.rawtext = "eval " + ctx.rawtext.trim().slice(1).trim()
        }
        return next()
    })
}
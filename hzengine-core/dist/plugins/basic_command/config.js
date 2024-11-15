export function config_command(core) {
    // set command: set <key> <value>
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "set")
            return next();
        if (ctx.slicedArgs.length !== 3)
            throw `Set Command: incorrect amount of args`;
        let key = ctx.slicedArgs[1].str;
        let val = ctx.slicedArgs[2].str;
        if (!ctx.slicedArgs[2].isQuoted) {
            if (val === "true" || val === "false") {
                val = val === "true";
            }
            else if (!isNaN(val)) {
                val = Number(val);
            }
            else
                throw `Set Command: value type not supported`;
        }
        core.config.setConfig(key, val);
    });
}

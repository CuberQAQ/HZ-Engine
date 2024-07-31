"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$_command = $_command;
function $_command(core) {
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().startsWith("$")) {
            ctx.rawtext = "eval " + ctx.rawtext.trim().slice(1).trim();
        }
        return next();
    });
}

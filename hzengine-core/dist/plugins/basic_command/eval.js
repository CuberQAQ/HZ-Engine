"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eval_module = void 0;
function eval_module(core) {
    // single line eval command
    // syntax: eval <code>
    core.script.use((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted ||
            ctx.slicedArgs[0].str.toLowerCase() !== "eval") {
            return next();
        }
        if (ctx.slicedArgs.length === 1) {
            throw `Eval Command: no code specified`;
        }
        if (ctx.slicedArgs.length === 2) {
            core.script.evalScope(ctx.slicedArgs[1].str);
        }
        else {
            // delete "eval" prefix
            core.script.evalScope(ctx.rawtext.trim().slice(4).trim());
        }
    });
    // multi line eval statement (script ... end script)
    // syntax:
    // script
    // <code>
    // end script
    // script statement start
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(" ")[0] !== "script") {
            return next();
        }
        let data = ctx.startStatement("script");
        core.script.evalScope(data.js_code_scope);
        core.script.jump(data.end_position[0], data.end_position[1]);
    });
    // script statement end
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(/ +/).join(" ") !== "end script")
            return next();
        ctx.endStatement("script");
    });
    // analyze script statement start
    core.script.useAnalyseStatement((ctx, next) => {
        if (ctx.rawtext.trim().split(" ")[0] !== "script") {
            return next();
        }
        let data = ctx.startStatement("script");
        data.start_position = [ctx.currentPath, ctx.currentLineIndex];
        data.js_code_scope = "";
    });
    // analyze script code scope/statement end
    core.script.useAnalyseStatement((ctx, next) => {
        if (ctx.statementStack.length &&
            ctx.statementStack[ctx.statementStack.length - 1][0] === "script") {
            if (ctx.rawtext.trim().split(/ +/).join(" ") === "end script") {
                // end script
                let data = ctx.endStatement("script");
                data.end_position = [ctx.currentPath, ctx.currentLineIndex];
                ctx.setStatementData(data, [...data.start_position]);
            }
            else {
                // add code line to code scope
                ctx.statementStack[ctx.statementStack.length - 1][2].js_code_scope += ctx.rawtext.trim() + '\n';
            }
        }
        else
            return next();
    }, true);
}
exports.eval_module = eval_module;

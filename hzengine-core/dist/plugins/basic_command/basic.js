"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basic_commands = basic_commands;
exports.sayAction = sayAction;
function basic_commands(core) {
    // jump command
    core.script.use((ctx, next) => {
        let strArr = ctx.rawtext.trim().split(/ +/);
        if (strArr.length === 0 || strArr[0].toLowerCase() !== "jump")
            return next();
        if (strArr.length !== 2)
            throw "Jump Command: incorrect amount of args";
        console.log(`Jump Command: jump to label [${strArr[1]}]`);
        core.script.jumpLabel(strArr[1]);
    });
    // call command
    core.script.use((ctx, next) => {
        let strArr = ctx.rawtext.trim().split(/ +/);
        if (strArr.length === 0 || strArr[0].toLowerCase() !== "call")
            return next();
        if (strArr.length !== 2)
            throw "Call Command: incorrect amount of args";
        console.log(`Call Command: call label [${strArr[1]}]`);
        core.script.callLabel(strArr[1]);
    });
    // return command
    core.script.use((ctx, next) => {
        let strArr = ctx.rawtext.trim().split(/ +/);
        if (strArr.length === 0 || strArr[0].toLowerCase() !== "return")
            return next();
        if (strArr.length !== 1)
            throw "Return Command: this command can not have args";
        console.log(`Return Command: return`);
        core.script.return();
    });
    // (debug) echo command
    core.script.use((ctx, next) => {
        let str = ctx.rawtext.trim();
        if (!str.startsWith("echo"))
            return next();
        console.log(`[ECHO] ${core.script.parseString(str.slice(4).trim())}`);
    });
    // say command
    core.script.use((ctx, next) => {
        if (!ctx.rawtext.trim().startsWith('"'))
            return next();
        function parseSayCommandArgs() {
            if (ctx.slicedArgs.length > 0 &&
                ctx.slicedArgs[ctx.slicedArgs.length - 1].str === "nowait") {
                ctx.slicedArgs = ctx.slicedArgs.slice(0, ctx.slicedArgs.length - 1);
                return {
                    wait: false,
                };
            }
            else {
                return {
                    wait: true,
                };
            }
        }
        let parsed = parseSayCommandArgs();
        if (ctx.slicedArgs.length > 2 || ctx.slicedArgs.length < 1) {
            throw `Say Command: incorrect amount of args`;
        }
        if (ctx.slicedArgs.length === 1) {
            console.log(`[SAY] ${ctx.slicedArgs[0].str}`);
            sayAction(core, "", ctx.slicedArgs[0].str);
        }
        else {
            if (!ctx.slicedArgs[1].isQuoted)
                throw `Say Command: second arg should be quoted`;
            console.log(`[SAY] ${ctx.slicedArgs[0].str}: ${ctx.slicedArgs[1].str}`);
            sayAction(core, ctx.slicedArgs[0].str, ctx.slicedArgs[1].str);
        }
        if (parsed === null || parsed === void 0 ? void 0 : parsed.wait)
            core.system.pause();
    });
    // pause command
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "pause")
            return next();
        if (ctx.slicedArgs.length > 2)
            throw `Pause Command: incorrect amount of args`;
        if (ctx.slicedArgs.length === 2) {
            if (ctx.slicedArgs[1].isQuoted ||
                !isFinite(Number(ctx.slicedArgs[1].str)))
                throw `Pause Command: the second arg must be a number`;
            core.system.pause(Number(ctx.slicedArgs[1].str) * 1000);
        }
        else
            core.system.pause();
    });
}
function sayAction(core, who, what) {
    const say_view_tag = "hzengine.say";
    const say_view_name = "say";
    what = core.script.parseString(what);
    let message = {
        who,
        what,
    };
    let router = core.ui.getRouter(say_view_tag);
    if (!router) {
        core.ui.addRouter(say_view_tag, "ct");
        router = core.ui.getRouter(say_view_tag);
    }
    if (!router.length) {
        router.push(say_view_name, message);
    }
    else {
        router.update(message);
    }
}

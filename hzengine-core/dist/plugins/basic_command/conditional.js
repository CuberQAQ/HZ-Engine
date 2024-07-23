"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conditional = void 0;
function conditional(core) {
    // if ... [elif] ... [else] ... end if
    // syntax:
    // if <expression>
    // <code>
    // [elif <expression>]
    // <code>
    // [else]
    // <code>
    // end if
    // if statement start
    core.script.use((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted ||
            ctx.slicedArgs[0].str.toLowerCase() !== "if") {
            return next();
        }
        let data = ctx.startStatement("if");
        console.log(`if data=${JSON.stringify(data)}`);
        let if_expression_res = core.script.evalExpression(data.if_expression);
        if (typeof if_expression_res !== "boolean") {
            throw `If statement: if expression must return boolean, at file [${data.start_position[0]}] line [${data.start_position[1]}]`;
        }
        if (if_expression_res) {
            // continue to execute next line
            return;
        }
        // analyse elif
        for (let i = 0; i < data.elif_list.length; i++) {
            let item = data.elif_list[i];
            let elif_expression_res = core.script.evalExpression(item.expression);
            if (typeof elif_expression_res !== "boolean") {
                throw `If statement: elif expression must return boolean, at file [${item.position[0]}] line [${item.position[1]}]`;
            }
            if (elif_expression_res) {
                // jump to next line of elif statement
                core.script.jump(item.position[0], item.position[1] + 1);
                return;
            }
        }
        // analyse else
        if (data.else_position) {
            core.script.jump(data.else_position[0], data.else_position[1] + 1);
            return;
        }
        // the expressions are all false
        // jump to the end of if statement
        core.script.jump(data.end_position[0], data.end_position[1]);
    });
    // elif statement
    // when come across next elif statement, jump to "end if" statement to stop execute.
    core.script.use((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted ||
            ctx.slicedArgs[0].str.toLowerCase() !== "elif") {
            return next();
        }
        if (ctx.statementStack.length === 0 ||
            ctx.statementStack[ctx.statementStack.length - 1][0] !== "if") {
            throw `If statement: elif statement must come after if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
        }
        let data = ctx.statementStack[ctx.statementStack.length - 1][2];
        // check if this elif statement belong to the closest if statement
        for (let i = 0; i < data.elif_list.length; i++) {
            let item = data.elif_list[i];
            if (item.position[0] === ctx.currentPath &&
                item.position[1] === ctx.currentLineIndex) {
                // jump to the "end if" statement
                core.script.jump(data.end_position[0], data.end_position[1]);
                return;
            }
        }
        // the elif statement is not belong to the closest if statement, so throw error
        throw `If statement: elif statement not belong to the closest if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    });
    // else statement
    core.script.use((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted ||
            ctx.slicedArgs[0].str.toLowerCase() !== "else") {
            return next();
        }
        if (ctx.statementStack.length === 0 ||
            ctx.statementStack[ctx.statementStack.length - 1][0] !== "if") {
            throw `If statement: else statement must come after if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
        }
        let data = ctx.statementStack[ctx.statementStack.length - 1][2];
        // check if this else statement belong to the closest if statement
        if (data.else_position) {
            if (data.else_position[0] === ctx.currentPath &&
                data.else_position[1] === ctx.currentLineIndex) {
                // jump to the "end if" statement
                core.script.jump(data.end_position[0], data.end_position[1]);
                return;
            }
        }
        // the else statement is not belong to the closest if statement, so throw error
        throw `If statement: else statement not belong to the closest if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
    });
    // end if statement
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(/ +/).join(" ").toLowerCase() !== "end if") {
            return next();
        }
        if (ctx.statementStack.length === 0 ||
            ctx.statementStack[ctx.statementStack.length - 1][0] !== "if") {
            throw `If statement: end if statement must come after if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
        }
        ctx.endStatement("if");
    });
    // analyse statement
    // if statement
    core.script.useAnalyseStatement((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted ||
            ctx.slicedArgs[0].str.toLowerCase() !== "if") {
            return next();
        }
        if (ctx.slicedArgs.length < 2) {
            throw `If statement: no expression specified, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
        }
        ctx.startStatement("if", {
            start_position: [ctx.currentPath, ctx.currentLineIndex],
            if_expression: ctx.rawtext.trim().slice(2).trim(),
            elif_list: [],
            else_position: null,
        });
    });
    // elif statement
    core.script.useAnalyseStatement((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted ||
            ctx.slicedArgs[0].str.toLowerCase() !== "elif") {
            return next();
        }
        if (ctx.slicedArgs.length < 2) {
            throw `If statement: no expression specified, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
        }
        // check if the closest statement is if statement
        if (ctx.statementStack.length === 0 ||
            ctx.statementStack[ctx.statementStack.length - 1][0] !== "if") {
            throw `If statement: elif statement must come after if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
        }
        let data = ctx.statementStack[ctx.statementStack.length - 1][2];
        data.elif_list.push({
            position: [ctx.currentPath, ctx.currentLineIndex],
            expression: ctx.rawtext.trim().slice(4).trim(),
        });
    });
    // else statement
    core.script.useAnalyseStatement((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted ||
            ctx.slicedArgs[0].str.toLowerCase() !== "else") {
            return next();
        }
        // check if the closest statement is if statement
        if (ctx.statementStack.length === 0 ||
            ctx.statementStack[ctx.statementStack.length - 1][0] !== "if") {
            throw `If statement: else statement must come after if statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
        }
        let data = ctx.statementStack[ctx.statementStack.length - 1][2];
        data.else_position = [ctx.currentPath, ctx.currentLineIndex];
    });
    // end if statement
    core.script.useAnalyseStatement((ctx, next) => {
        if (ctx.rawtext.trim().split(/ +/).join(" ").toLowerCase() !== "end if") {
            return next();
        }
        let data = ctx.endStatement("if");
        data.end_position = [ctx.currentPath, ctx.currentLineIndex];
        ctx.setStatementData(data, [...data.start_position]);
    });
    // while ... end while
    // while statement start
    core.script.use((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted ||
            ctx.slicedArgs[0].str.toLowerCase() !== "while") {
            return next();
        }
        let data = ctx.startStatement("while");
        // test if expression return boolean
        let expression = data.while_expression;
        let expression_res = core.script.evalExpression(expression);
        if (typeof expression_res !== "boolean") {
            throw `While statement: while expression must return boolean, at file [${data.start_position[0]}] line [${data.start_position[1]}]`;
        }
        if (!expression_res) {
            ctx.endStatement("while");
            core.script.jump(...data.end_position, false);
            core.script.incrementNextPosition();
        }
        else {
            return;
        }
    });
    // while statement end
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(/ +/).join(" ").toLowerCase() !== "end while") {
            return next();
        }
        // check if the closest statement is while statement
        if (ctx.statementStack.length === 0 ||
            ctx.statementStack[ctx.statementStack.length - 1][0] !== "while") {
            throw `While statement: end while statement must come after while statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
        }
        // jump to while statement start line (loop)
        let data = ctx.statementStack[ctx.statementStack.length - 1][2];
        core.script.jump(...data.start_position, false);
    });
    // analyse while statement start
    core.script.useAnalyseStatement((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted ||
            ctx.slicedArgs[0].str.toLowerCase() !== "while") {
            return next();
        }
        let while_expression = ctx.rawtext.trim().slice(5).trim();
        if (while_expression === "") {
            throw `While statement: no expression specified, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
        }
        ctx.startStatement("while", {
            start_position: [ctx.currentPath, ctx.currentLineIndex],
            while_expression,
            end_position: [ctx.currentPath, ctx.currentLineIndex],
        });
    });
    // analyse while statement end
    core.script.useAnalyseStatement((ctx, next) => {
        if (ctx.rawtext.trim().split(/ +/).join(" ").toLowerCase() !== "end while") {
            return next();
        }
        let data = ctx.endStatement("while");
        data.end_position = [ctx.currentPath, ctx.currentLineIndex];
        ctx.setStatementData(data, [...data.start_position]);
    });
    // do ... end do until
    // break command
    core.script.use((ctx, next) => {
        if (ctx.slicedArgs[0].isQuoted ||
            ctx.slicedArgs.length !== 1 ||
            ctx.slicedArgs[0].str.toLowerCase() !== "break") {
            return next();
        }
        // check if the closest statement is breakable
        // (currently only while statement is breakable)
        //(debug) output stack
        console.log("Stack=" + JSON.stringify(ctx.statementStack));
        if (ctx.statementStack.length === 0 ||
            ctx.statementStack[ctx.statementStack.length - 1][0] !== "while") {
            throw `Break statement: break statement must come after while statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex}]`;
        }
        let data = ctx.endStatement("while");
        console.log(`Break command: break from while statement at file [${data.start_position[0]}] line [${data.start_position[1] + 1}]`);
        core.script.jump(...data.end_position, false);
        core.script.incrementNextPosition();
    });
}
exports.conditional = conditional;

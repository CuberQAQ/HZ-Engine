"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menu_statement = void 0;
function menu_statement(core) {
    // menu statement start
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(" ")[0] !== "menu")
            return next();
        let menu_data = ctx.startStatement("menu");
        // Block the game
        core.system.block();
        let router = core.ui.getRouter("menu");
        if (!router) {
            core.ui.addRouter("menu", "ct");
            router = core.ui.getRouter("menu");
        }
        let menu_view_prop = buildMenuViewProp(menu_data);
        if (!router.length) {
            router.push("menu", menu_view_prop);
        }
        else {
            router.update(menu_view_prop);
        }
        // the view contains many buttons, when the button is clicked,
        // it will call core.script.jump() to jump to the next line of the @label statement
        // then hide the menu
        // so the script will continue to execute the next line of the @label statement
        // when a @label is appended again, it represents the command between the @label and the next @label
        // is executed completely, so jump to the next line of "end menu"
    });
    // menu statement close
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(/ +/).join(" ") !== "end menu")
            return next();
        ctx.endStatement("menu");
    });
    // menu internal label (start with @)
    // syntax: @"{label_name}" [enable={js_expression}]
    core.script.use((ctx, next) => {
        if (!ctx.rawtext.trim().split(" ")[0].startsWith("@"))
            return next();
        let label_name = ctx.slicedArgs[1].str;
        if (ctx.statementStack.length === 0 ||
            ctx.statementStack[ctx.statementStack.length - 1][0] !== "menu") {
            throw `@${label_name} must in menu statement`;
        }
        let menu_item = ctx.statementStack[ctx.statementStack.length - 1];
        let menu_data = menu_item[2];
        for (let i = 0; i < menu_data.item_list.length; i++) {
            if (menu_data.item_list[i].position[0] === ctx.currentPath &&
                menu_data.item_list[i].position[1] === ctx.currentLineIndex) {
                // the label belongs to this menu statement
                // so jump to the "end menu" statement
                // the script will continue from the "end menu" statement
                // get the end menu statement position
                let end_menu_position = [
                    ...menu_data.end_position,
                ];
                // jump to "end menu"
                core.script.jump(end_menu_position[0], end_menu_position[1]);
                return;
            }
        }
        // the label does not belong to this menu statement, so throw error
        throw `@${label_name} does not belong to closest menu statement, at file [${ctx.currentPath}] line [${ctx.currentLineIndex + 1}], but belong to [${menu_item[1][0]}] line [${menu_item[1][1] + 1}]`;
    });
    // analyse menu start statement
    core.script.useAnalyseStatement((ctx, next) => {
        if (ctx.rawtext.trim().split(" ")[0] !== "menu")
            return next();
        let data = ctx.startStatement("menu");
        console.log("[HZEngine] Menu start");
        // the data here is {} at first, so dont read its properties, because the properties are not defined yet
        // we will define the properties here
        data.start_position = [
            ctx.currentPath,
            ctx.currentLineIndex,
        ];
        data.item_list = [];
    });
    // analyse menu label (start with @)
    core.script.useAnalyseStatement((ctx, next) => {
        if (!ctx.rawtext.trim().split(" ")[0].startsWith("@"))
            return next();
        if (ctx.statementStack.length === 0 ||
            ctx.statementStack[ctx.statementStack.length - 1][0] !== "menu") {
            throw `@${ctx.slicedArgs[1]} must in menu statement`;
        }
        console.log("[HZEngine] Menu label: " + ctx.slicedArgs[1].str);
        let menu_stack_item = ctx.statementStack[ctx.statementStack.length - 1];
        // parse the enable js expression (syntax: enable={js_expression})
        // get the js_expression and put it in the menu data
        let enable_js_expression = undefined;
        if (ctx.slicedArgs.length > 2) {
            enable_js_expression = ctx.slicedArgs[2].str;
            if (!enable_js_expression.startsWith("enable=")) {
                throw `enable js expression must start with "enable="`;
            }
            enable_js_expression = enable_js_expression.slice(7);
            if (enable_js_expression.startsWith("{") &&
                enable_js_expression.endsWith("}")) {
                enable_js_expression = enable_js_expression.slice(1, -1);
            }
            else {
                enable_js_expression = enable_js_expression.trim();
            }
            if (enable_js_expression.length > 0) {
                enable_js_expression = `(${enable_js_expression})`;
            }
            else {
                throw `enable js expression must not be empty`;
            }
        }
        menu_stack_item[2].item_list.push({
            text: ctx.slicedArgs[1].str,
            position: [ctx.currentPath, ctx.currentLineIndex],
            enable_js_expression,
        });
    });
    // analyse menu end statement
    core.script.useAnalyseStatement((ctx, next) => {
        if (ctx.rawtext.trim().split(/ +/).join(" ") !== "end menu")
            return next();
        console.log("[HZEngine] Menu analyse end");
        let data = ctx.endStatement("menu");
        // the data here is {} at first, so dont read its properties, because the properties are not defined yet
        // we will define the properties here
        data.end_position = [ctx.currentPath, ctx.currentLineIndex];
        // set and save the menu data
        ctx.setStatementData(data, [
            data.start_position[0],
            data.start_position[1],
        ]);
    });
}
exports.menu_statement = menu_statement;
function buildMenuViewProp(menu_data) {
    return { itemList: menu_data.item_list };
}

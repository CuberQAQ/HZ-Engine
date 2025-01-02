// / <reference types="@zeppos/device-types" />
// import hmUI from "@zos/ui";
import { Async, Script } from "../../index.js";
export function img(core) {
    let transform_plugin = core.plugins.get("transform");
    if (!transform_plugin)
        core.debug.log("[IMG Plugin] Info: Transform plugin not set up");
    // show command
    core.script.use((ctx, next) => {
        var _a;
        if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "show")
            return next();
        if (ctx.slicedArgs.length === 1)
            throw `Show Command: incorrect amount of args`;
        if (ctx.slicedArgs.length === 2)
            throw `Show Command: incorrect amount of args`;
        let parsedRes = parseImgCommandFields(ctx);
        // update args to no fields
        ctx.slicedArgs = parsedRes.leftedArgs;
        let tag = ctx.slicedArgs[1].str;
        let name_key = "";
        for (let i = 1; i < ctx.slicedArgs.length; ++i) {
            name_key += ctx.slicedArgs[i].str + " ";
        }
        name_key = name_key.trim().toLowerCase();
        let path = (_a = core.storage.preloadedData.image.nameMap[name_key]) === null || _a === void 0 ? void 0 : _a[0];
        if (!path)
            throw `Show Command: image with name_key [${name_key}] not found `;
        // let size = (hmUI as any).getImageInfo(path);
        let size = core.platform.getImageInfo(path);
        console.log(`IMG: path: ${path}, size: ${JSON.stringify(size)}`);
        if (!size)
            throw `Show Command: read size of [${path}] failed`;
        showAction(tag, path, size, parsedRes.strategy);
    });
    function showAction(tag, path, size, routerStrategy) {
        const show_view_tag_prefix = "hzengine.img";
        const show_view_name = "fg_img";
        let prop = {
            imgPath: path,
            offset: {
                x: 0,
                y: 0,
            },
            size: {
                width: size.width,
                height: size.height,
            },
        };
        let tag_prefixed = `${show_view_tag_prefix}.${tag}`;
        let router = core.ui.getRouter(tag_prefixed);
        if (!router) {
            core.ui.addRouter(tag_prefixed, "fg");
            router = core.ui.getRouter(tag_prefixed);
        }
        Async.nextTick(() => {
            // @ts-ignore
            router.replace(show_view_name, prop, routerStrategy !== null && routerStrategy !== void 0 ? routerStrategy : undefined);
        });
    }
    // hide command
    core.script.use((ctx, next) => {
        if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "hide")
            return next();
        let parsedRes = parseImgCommandFields(ctx);
        ctx.slicedArgs = parsedRes.leftedArgs;
        if (ctx.slicedArgs.length !== 2) {
            throw `Hide Command: incorrect amount of args`;
        }
        let tag = ctx.slicedArgs[1].str;
        hideAction(tag, parsedRes.strategy);
    });
    function hideAction(tag, routerStrategy) {
        const show_view_tag_prefix = "hzengine.img";
        let tag_prefixed = `${show_view_tag_prefix}.${tag}`;
        let router = core.ui.getRouter(tag_prefixed);
        if (!router) {
            throw `Hide Command: router with tag [${tag}] not found `;
        }
        Async.nextTick(() => {
            router.clear(routerStrategy !== null && routerStrategy !== void 0 ? routerStrategy : undefined);
        });
    }
    // scene command
    core.script.use((ctx, next) => {
        var _a;
        if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "scene")
            return next();
        if (ctx.slicedArgs.length === 1)
            throw `Scene Command: incorrect amount of args`;
        if (ctx.slicedArgs.length === 2)
            throw `Scene Command: incorrect amount of args`;
        let parsedRes = parseImgCommandFields(ctx);
        // update args to no fields
        ctx.slicedArgs = parsedRes.leftedArgs;
        let tag = ctx.slicedArgs[1].str;
        let name_key = "";
        for (let i = 1; i < ctx.slicedArgs.length; ++i) {
            name_key += ctx.slicedArgs[i].str + " ";
        }
        name_key = name_key.trim().toLowerCase();
        let path = (_a = core.storage.preloadedData.image.nameMap[name_key]) === null || _a === void 0 ? void 0 : _a[0];
        if (!path)
            throw `Scene Command: image with name_key [${name_key}] not found `;
        // let size = (hmUI as any).getImageInfo(path);
        let size = core.platform.getImageInfo(path);
        if (!size)
            throw `Scene Command: read size of [${path}] failed`;
        sceneAction(tag, path, size, parsedRes.strategy);
    });
    function sceneAction(tag, path, size, routerStrategy) {
        const scene_view_tag_prefix = "hzengine.img";
        const scene_view_name = "bg_img";
        let prop = {
            imgPath: path,
            offset: {
                x: 0,
                y: 0,
            },
            size: {
                width: size.width,
                height: size.height,
            },
        };
        let tag_prefixed = `${scene_view_tag_prefix}.${tag}`;
        let router = core.ui.getRouter(tag_prefixed);
        if (!router) {
            core.ui.addRouter(tag_prefixed, "bg");
            router = core.ui.getRouter(tag_prefixed);
        }
        if (!router.length) {
            // @ts-ignore
            Async.nextTick(() => {
                // @ts-ignore
                router.push(scene_view_name, prop, routerStrategy !== null && routerStrategy !== void 0 ? routerStrategy : undefined);
            });
        }
        else {
            // @ts-ignore
            Async.nextTick(() => {
                // @ts-ignore
                router.update(prop, routerStrategy !== null && routerStrategy !== void 0 ? routerStrategy : undefined);
            });
        }
    }
    // with
    // at
    // wait
    // nowait
    function parseImgCommandFields(ctx) {
        let slicedArgs = JSON.parse(JSON.stringify(ctx.slicedArgs)); // TODO 深拷贝 性能
        // TODO 注意这里的代码超级高耦合
        let res = {
            strategy: null,
            wait: false,
            leftedArgs: slicedArgs,
        };
        // wait/nowait
        if (slicedArgs[slicedArgs.length - 1].str === "wait") {
            res.wait = true;
            slicedArgs.pop();
        }
        else if (slicedArgs[slicedArgs.length - 1].str === "nowait") {
            res.wait = false;
            slicedArgs.pop();
        }
        // parse long fields
        let keywords = ["with", "at"];
        let inTransforms = [];
        let outTransforms = [];
        while (true) {
            // console.log(`slicedArgs: ${JSON.stringify(slicedArgs)}`);
            let keyword_index = findLastIndex(slicedArgs, (slicedArg) => !slicedArg.isQuoted &&
                !slicedArg.isSquared &&
                keywords.includes(slicedArg.str));
            if (keyword_index === -1)
                break;
            let keyword = slicedArgs[keyword_index].str;
            let currentFieldArgs = slicedArgs.splice(keyword_index, slicedArgs.length - keyword_index);
            currentFieldArgs.shift();
            if (keyword === "at") {
                inTransforms.push(...Script.Utils.splitCommas(Script.Utils.joinSlicedArgs(currentFieldArgs)));
            }
            else if (keyword === "with") {
                let args = Script.Utils.parseHzsArgs(Script.Utils.joinSlicedArgs(currentFieldArgs));
                // console.log(`with args: ${JSON.stringify(args)}`);
                for (let i = 0; i < args.length; i++) {
                    if (Array.isArray(args[i])) {
                        // Annoymous Transition Tuple
                        if (args[i].length > 2)
                            throw `Invalid Annoymous Transition Tuple: ${JSON.stringify(args[i])}`;
                        console.log(`Annoymous Transition Tuple: ${JSON.stringify(args[i])}`);
                        if (args[i].length >= 1) {
                            if (Array.isArray(args[i][0])) {
                                outTransforms.push(...args[i][0]);
                            }
                            else {
                                outTransforms.push(args[i][0]);
                            }
                        }
                        if (args[i].length >= 2) {
                            if (Array.isArray(args[i][1])) {
                                inTransforms.push(...args[i][1]);
                            }
                            else {
                                inTransforms.push(args[i][1]);
                            }
                        }
                    }
                    else {
                        // Named Transition
                        let transition = transform_plugin.getTransition(args[i]);
                        if (!transition) {
                            core.debug.log(`Transition ${args[i]} not found`);
                            continue;
                        }
                        else {
                            core.debug.log(`Transition ${args[i]} = ${JSON.stringify(transition)}`);
                            inTransforms.push(...transition.inTransforms);
                            outTransforms.push(...transition.outTransforms);
                        }
                    }
                }
            }
        }
        // let withField: WithField = {
        //   outTransform: ctx.slicedArgs[withIndex + 1]?.str ?? null,
        //   inTransform: ctx.slicedArgs[withIndex + 2]?.str ?? null,
        // };
        res.strategy = transform_plugin.createStrategy(outTransforms.length ? outTransforms : null, inTransforms.length ? inTransforms : null);
        return res;
    }
    function findLastIndex(array, predicator) {
        for (let i = array.length - 1; i >= 0; i--) {
            if (predicator(array[i])) {
                return i;
            }
        }
        return -1;
    }
    const slicedArgsToTransforms = (slicedArgs) => Script.Utils.joinSlicedArgs(slicedArgs)
        .split(",")
        .map((str) => str.trim())
        .filter((str) => str.length > 0);
    //   type WithField = {
    //     inTransform: string | null;
    //     outTransform: string | null;
    //   };
}

import hmUI from "@zos/ui";
import { Async, HZEngineCore, Script, TransformPlugin, UI } from "../../index.js";

export function img(core: HZEngineCore) {
  let transform_plugin: TransformPlugin.InstanceType = core.plugins.get(
    "transform"
  ) as any;
  if (!transform_plugin)
    core.debug.log("[IMG Plugin] Info: Transform plugin not set up");
  // show command
  core.script.use((ctx, next) => {
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
    let path = core.storage.preloadedData.image.nameMap[name_key]?.[0];
    if (!path)
      throw `Show Command: image with name_key [${name_key}] not found `;
    let size = (hmUI as any).getImageInfo(path);
    if (!size) throw `Show Command: read size of [${path}] failed`;
    showAction(tag, path, size, parsedRes.strategy);
  });

  function showAction(
    tag: string,
    path: string,
    size: UI.Size,
    routerStrategy: UI.Router.RouteStrategy | null
  ) {
    const show_view_tag_prefix = "hzengine.img";
    const show_view_name = "fg_img";
    let prop: UI.FgImgViewProp = {
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
      router = core.ui.getRouter(tag_prefixed)!;
    }
    Async.nextTick(() => {
      router.replace<UI.FgImgViewProp>(
        show_view_name,
        prop,
        routerStrategy ?? undefined
      );
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

  function hideAction(
    tag: string,
    routerStrategy: UI.Router.RouteStrategy | null
  ) {
    const show_view_tag_prefix = "hzengine.img";

    let tag_prefixed = `${show_view_tag_prefix}.${tag}`;
    let router = core.ui.getRouter(tag_prefixed);
    if (!router) {
      throw `Hide Command: router with tag [${tag}] not found `;
    }
    Async.nextTick(() => {
      router.clear(routerStrategy ?? undefined);
    });
  }

  // scene command
  core.script.use((ctx, next) => {
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
    let path = core.storage.preloadedData.image.nameMap[name_key]?.[0];
    if (!path)
      throw `Scene Command: image with name_key [${name_key}] not found `;
    let size = (hmUI as any).getImageInfo(path);
    if (!size) throw `Scene Command: read size of [${path}] failed`;

    sceneAction(tag, path, size, parsedRes.strategy);
  });

  function sceneAction(
    tag: string,
    path: string,
    size: UI.Size,
    routerStrategy: UI.Router.RouteStrategy | null
  ) {
    const scene_view_tag_prefix = "hzengine.img";
    const scene_view_name = "bg_img";
    let prop: UI.BgImgViewProp = {
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
      router = core.ui.getRouter(tag_prefixed)!;
    }
    if (!router.length) {
      Async.nextTick(() => {
        router.push<UI.BgImgViewProp>(
          scene_view_name,
          prop,
          routerStrategy ?? undefined
        );
      });
    } else {
      Async.nextTick(() => {
        router.update<UI.BgImgViewProp>(prop, routerStrategy ?? undefined);
      });
    }
  }

  // with
  // at
  // wait
  // nowait

  function parseImgCommandFields(ctx: Script.Context): ParsedImgCommandFields {
    let slicedArgs: typeof ctx.slicedArgs = JSON.parse(
      JSON.stringify(ctx.slicedArgs)
    ); // TODO 深拷贝 性能

    // TODO 注意这里的代码超级高耦合
    let res: ReturnType<typeof parseImgCommandFields> = {
      strategy: null,
      wait: false,
      leftedArgs: slicedArgs,
    };

    // wait/nowait
    if (slicedArgs[slicedArgs.length - 1].str === "wait") {
      res.wait = true;
      slicedArgs.pop();
    } else if (slicedArgs[slicedArgs.length - 1].str === "nowait") {
      res.wait = false;
      slicedArgs.pop();
    }

    // parse long fields
    let keywords = ["with", "at"];
    let inTransforms: string[] = [];
    let outTransforms: string[] = [];
    while (true) {
      // console.log(`slicedArgs: ${JSON.stringify(slicedArgs)}`);

      let keyword_index = findLastIndex(
        slicedArgs,
        (slicedArg) =>
          !slicedArg.isQuoted &&
          !slicedArg.isSquared &&
          keywords.includes(slicedArg.str)
      );
      if (keyword_index === -1) break;
      let keyword = slicedArgs[keyword_index].str;
      let currentFieldArgs = slicedArgs.splice(
        keyword_index,
        slicedArgs.length - keyword_index
      );
      currentFieldArgs.shift();

      if (keyword === "at") {
        inTransforms.push(
          ...Script.Utils.splitCommas(
            Script.Utils.joinSlicedArgs(currentFieldArgs)
          )
        );
      } else if (keyword === "with") {
        let args = Script.Utils.parseHzsArgs(
          Script.Utils.joinSlicedArgs(currentFieldArgs)
        );
        // console.log(`with args: ${JSON.stringify(args)}`);

        for (let i = 0; i < args.length; i++) {
          if (Array.isArray(args[i])) {
            // Annoymous Transition Tuple
            if (args[i].length > 2)
              throw `Invalid Annoymous Transition Tuple: ${JSON.stringify(
                args[i]
              )}`;
            console.log(
              `Annoymous Transition Tuple: ${JSON.stringify(args[i])}`
            );

            if (args[i].length >= 1) {
              if (Array.isArray(args[i][0])) {
                outTransforms.push(...(args[i][0] as string[]));
              } else {
                outTransforms.push(args[i][0] as string);
              }
            }

            if (args[i].length >= 2) {
              if (Array.isArray(args[i][1])) {
                inTransforms.push(...(args[i][1] as string[]));
              } else {
                inTransforms.push(args[i][1] as string);
              }
            }
          } else {
            // Named Transition
            let transition = transform_plugin.getTransition(args[i] as string);
            if (!transition) {
              core.debug.log(`Transition ${args[i]} not found`);
              continue;
            } else {
              core.debug.log(
                `Transition ${args[i]} = ${JSON.stringify(transition)}`
              );
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
    res.strategy = transform_plugin.createStrategy(
      outTransforms.length ? outTransforms : null,
      inTransforms.length ? inTransforms : null
    );
    return res;
  }

  function findLastIndex<T>(array: T[], predicator: (value: T) => boolean) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (predicator(array[i])) {
        return i;
      }
    }
    return -1;
  }
  const slicedArgsToTransforms = (slicedArgs: Script.Context.SlicedArg[]) =>
    Script.Utils.joinSlicedArgs(slicedArgs)
      .split(",")
      .map((str) => str.trim())
      .filter((str) => str.length > 0);

  type ParsedImgCommandFields = {
    strategy: UI.Router.RouteStrategy | null;
    wait: boolean;
    leftedArgs: Script.Context.SlicedArg[];
  };
  //   type WithField = {
  //     inTransform: string | null;
  //     outTransform: string | null;
  //   };
}

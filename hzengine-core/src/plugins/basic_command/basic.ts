import hmUI from "@zos/ui";
import { HZEngineCore, UI } from "../..";

export function basic_commands(core: HZEngineCore) {
  // jump command
  core.script.use((ctx, next) => {
    let strArr = ctx.rawtext.trim().split(/ +/);
    if (strArr.length === 0 || strArr[0].toLowerCase() !== "jump")
      return next();
    if (strArr.length !== 2) throw "Jump Command: incorrect amount of args";
    console.log(`Jump Command: jump to label [${strArr[1]}]`);
    core.script.jumpLabel(strArr[1]);
  });

  // call command
  core.script.use((ctx, next) => {
    let strArr = ctx.rawtext.trim().split(/ +/);
    if (strArr.length === 0 || strArr[0].toLowerCase() !== "call")
      return next();
    if (strArr.length !== 2) throw "Call Command: incorrect amount of args";
    console.log(`Call Command: call label [${strArr[1]}]`);
    core.script.callLabel(strArr[1]);
  });

  // return command
  core.script.use((ctx, next) => {
    let strArr = ctx.rawtext.trim().split(/ +/);
    if (strArr.length === 0 || strArr[0].toLowerCase() !== "return")
      return next();
    if (strArr.length !== 1) throw "Return Command: this command can not have args";
    console.log(`Return Command: return`);
    core.script.return()
  });

  // (debug) echo command
  core.script.use((ctx, next) => {
    let str = ctx.rawtext.trim();
    if (!str.startsWith("echo")) return next();
    console.log(`[ECHO] ${core.script.parseString(str.slice(4).trim())}`);
  });

  // show command
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "show")
      return next();
    if (ctx.slicedArgs.length === 1)
      throw `Show Command: incorrect amount of args`;
    if (ctx.slicedArgs.length === 2)
      throw `Show Command: incorrect amount of args`;
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

    showAction(tag, path, size);
  });

  function showAction(tag: string, path: string, size: UI.Size) {
    const show_view_tag_prefix = "hzengine.fg_img";
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
    if (!router.length) {
      router.push<UI.FgImgViewProp>(show_view_name, prop);
    } else {
      router.update<UI.FgImgViewProp>(prop);
    }
  }

  // hide command
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "hide")
      return next();
    if (ctx.slicedArgs.length !== 2)
      throw `Show Command: incorrect amount of args`;
    let tag = ctx.slicedArgs[1].str;
    hideAction(tag);
  });

  
  function hideAction(tag: string) {
    const show_view_tag_prefix = "hzengine.fg_img";

    let tag_prefixed = `${show_view_tag_prefix}.${tag}`;
    let router = core.ui.getRouter(tag_prefixed);
    if (!router) {
        throw `Hide Command: router with tag [${tag}] not found `
    }
    router.clear()
  }


  // scene command
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "scene")
      return next();
    if (ctx.slicedArgs.length === 1)
      throw `Scene Command: incorrect amount of args`;
    if (ctx.slicedArgs.length === 2)
      throw `Scene Command: incorrect amount of args`;
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

    sceneAction(tag, path, size);
  });


  function sceneAction(tag: string, path: string, size: UI.Size) {
    const scene_view_tag_prefix = "hzengine.bg_img";
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
      router.push<UI.BgImgViewProp>(scene_view_name, prop);
    } else {
      router.update<UI.BgImgViewProp>(prop);
    }
  }

  // say command
  core.script.use((ctx, next) => {
    if (!ctx.rawtext.trim().startsWith('"')) return next();
    if (ctx.slicedArgs.length > 2 || ctx.slicedArgs.length < 1) {
      throw `Say Command: incorrect amount of args`;
    }
    
    if (ctx.slicedArgs.length === 1) {
      console.log(`[SAY] ${ctx.slicedArgs[0].str}`);
      sayAction(core, "", ctx.slicedArgs[0].str);
    } else {
      if (!ctx.slicedArgs[1].isQuoted)
        throw `Say Command: second arg should be quoted`;
      console.log(`[SAY] ${ctx.slicedArgs[0].str}: ${ctx.slicedArgs[1].str}`);
      sayAction(core, ctx.slicedArgs[0].str, ctx.slicedArgs[1].str);
    }
    core.system.pause();
  });

  // pause command
  core.script.use((ctx, next) => {
    if (ctx.rawtext.trim().split(" ")[0].toLowerCase() !== "pause")
      return next();
    if (ctx.slicedArgs.length > 2)
      throw `Pause Command: incorrect amount of args`;
    if (ctx.slicedArgs.length === 2) {
      if (
        ctx.slicedArgs[1].isQuoted ||
        !isFinite(Number(ctx.slicedArgs[1].str))
      )
        throw `Pause Command: the second arg must be a number`;
      core.system.pause(Number(ctx.slicedArgs[1].str));
    } else core.system.pause();
  });
}

export function sayAction(core: HZEngineCore, who: string, what: string) {
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
    router = core.ui.getRouter(say_view_tag)!;
  }
  if (!router.length) {
    router.push<UI.Message>(say_view_name, message);
  } else {
    router.update<UI.Message>(message);
  }
}

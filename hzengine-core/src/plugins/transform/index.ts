import { HZEngineCore, Storage, UI } from "../../index.js";
import { AnimationPlugin } from "./hz_anime.js";
import { Animation, Profile } from "./animation.js";
// import hmFS from "@zos/fs";
import { getTransitionMap, registerHzscriptCommands, TransitionData } from "./commands.js";

export function registerPlugin(core: HZEngineCore): InstanceType {
  let animationPlugin = new AnimationPlugin(core);
  let profileMap: Record<string, [path: string]> = {};

  registerHzscriptCommands(core);

  core.on("afterLoadProject", () => {
    profileMap = core.storage.getSaveableData(
      core.storage.preloadedData,
      false,
      "animation",
      "profileMap"
    ) as Record<string, [path: string]>;
  });
  function getProfile(name: string): Profile | null {
    let profile_item = profileMap[name];
    if (!profile_item) {
      core.debug.log(`Animation profile [${name}] not found`);
      return null;
    }
    let str = core.platform.readFileSync({
      path: profile_item[0],
      options: {
        encoding: "utf8",
      },
    });
    if (typeof str !== "string") {
      core.debug.log(`Animation profile file [${name}] not found`);
      return null;
    }
    try {
      return JSON.parse(str) as Profile;
    } catch (error) {
      core.debug.log(`Animation profile file [${name}] parse error:`, error);
    }
    return null;
  }
  function applyTransform(
    names: string[],
    target: UI.View<Storage.Saveable<unknown>>,
    isSave: boolean = false,
    destroyOnEnd: boolean = false
  ) {
    let profile: Profile | null = null;
    if (names.length === 1) {
      profile = getProfile(names[0]);
    } else if (names.length > 1) {
      let syncs: Profile[] = [];
      for (let i = 0; i < names.length; i++) {
        let profile = getProfile(names[i]);
        if (profile) syncs.push(profile);
      }
      profile = { syncs };
    }
    if (!profile) profile = [];
    animationPlugin.applyAnimation({
      profile,
      targetView: target,
      options: {
        isSave,
        destroyOnEnd,
      },
    });
  }

  class TransformRouteStrategy implements UI.Router.RouteStrategy {
    constructor(
      public outTransforms: string[] | null,
      public inTransforms: string[] | null
    ) {}
    create(
      viewName: string,
      layer: string,
      prop: Storage.Saveable<unknown>,
      ui: UI,
      isSave: boolean
    ): UI.View<Storage.Saveable<Storage.Saveable<unknown>>> {
      let view = ui.createView(viewName, layer, prop, isSave);
      this.inTransforms && applyTransform(this.inTransforms, view, isSave);
      return view;
    }
    destroy(viewInstance: UI.View<Storage.Saveable<unknown>>, ui: UI): void {
      if (this.outTransforms) {
        applyTransform(
          this.outTransforms,
          viewInstance,
          viewInstance.isSave,
          true
        );
      } else {
        ui.destroyView(viewInstance);
      }
    }
    // update(
    //   viewInstance: UI.View<Storage.Saveable<unknown>>,
    //   prop: Storage.Saveable<unknown>,
    //   ui: UI
    // ): void {
    //   ui.updateView(viewInstance, prop);
    // },
  }


  return {
    applyTransform,
    getProfile,
    createStrategy(
      outTransforms: string[] | null,
      inTransforms: string[] | null
    ): UI.Router.RouteStrategy {
      return new TransformRouteStrategy(outTransforms, inTransforms);
    },
    animationPlugin,
    getTransition(name: string): TransitionData | null {
      return getTransitionMap(core)![name] ?? null;
    }
  };
}
export interface InstanceType {
  applyTransform(
    names: string[],
    target: UI.View<Storage.Saveable<unknown>>,
    isSave?: boolean,
    destroyOnEnd?: boolean
  ): void;
  getProfile(name: string): Profile | null;
  createStrategy(
    outTransforms: string[] | null,
    inTransforms: string[] | null
  ): UI.Router.RouteStrategy;
  animationPlugin: AnimationPlugin;
  getTransition(name: string): TransitionData | null;
}

export { Animation, Profile, AnimationPlugin };

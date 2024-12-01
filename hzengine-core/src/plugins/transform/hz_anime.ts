import { HZEngineCore, Storage, UI } from "../../index.js";
import {
  Save,
  CustomSave,
} from "../../storage/decorator.js";
import { Animation, Profile, Wrapper } from "./animation.js";
// import { Time } from "@zos/sensor";

export class AnimationPlugin {
  constructor(public _core: HZEngineCore) {
    console.log("[AnimationPlugin] init");
    
    _core.loadPlugin("animation", () => this)
    _core.on("anime.cb", this._timerCb.bind(this));
    _core.async.addRepeatTask("anime.cb", [], 0); // 此處周期應考慮加個sync update
  
    this._lastCbUtc = this._core.platform.getTime()
  }

  @Save("anime.nid")
  private accessor _nextAnimationId: number = 1; // self-increment

  @CustomSave(
    "anime.map",
    function (obj): Record<string, AnimationPlugin.AnimationItem.Serialized> {
      let res: Record<string, AnimationPlugin.AnimationItem.Serialized> = {};
      for (let id in obj) {
        if (!obj[id].isSave) continue;
        res[id] = {
          destroyOnEnd: obj[id].destroyOnEnd,
          isSave: obj[id].isSave,
          targetViewId: obj[id].targetViewId,
          serializedInstance: obj[id].instance.serialize(),
        };
      }
      return res;
    },
    function (
      obj: Record<string, AnimationPlugin.AnimationItem.Serialized>
    ): Record<string, AnimationPlugin.AnimationItem> {
      let res: Record<string, AnimationPlugin.AnimationItem> = {};
      for (let id in obj) {
        if (!obj[id].isSave) continue;
        let animation = Animation.unserialize(obj[id].serializedInstance);
        this._linkAnimationCb(animation, Number(id));
        res[id] = {
          destroyOnEnd: obj[id].destroyOnEnd,
          isSave: obj[id].isSave,
          targetViewId: obj[id].targetViewId,
          instance: animation,
        };
      }
      return res;
    }
  )
  private accessor _animationMap: Record<
    string,
    AnimationPlugin.AnimationItem
  > = {};

  // private _timeSensor = new Time();

  private _lastCbUtc: number;

  public applyAnimation<P extends Profile.PropsType>({
    profile,
    targetView,
    options,
  }: {
    profile: Profile<P>;
    targetView: UI.View<Storage.Saveable<unknown>>;
    options?: AnimationPlugin.Options;
  }): number {
    const id = this._nextAnimationId++;
    let animation = new Animation(profile, {
      initProps: targetView.prop ?? {},
      wrappers: options?.customWrappers,
    });
    if (!targetView.id) throw "targetView.id must be not null";
    this._animationMap[id] = {
      destroyOnEnd: options?.destroyOnEnd ?? false,
      isSave: options?.isSave ?? true,
      instance: animation,
      targetViewId: targetView.id!,
    };
    this._linkAnimationCb(animation, id);

    animation.goto(0);

    this._core.on("afterLoadArchive", () => {
      this._lastCbUtc = this._core.platform.getTime();
    });
    return id;
  }

  public stopAnimation(id: number) {
    if (this._animationMap[id] !== undefined) {
      this._animationMap[id].instance.stop();
      delete this._animationMap[id];
    }
  }

  private _nextTempAnimationId: number = -1; // self-decrement

  _tempAnimationMap: Record<string, Animation> = {};

  public createTempAnimation<P extends Profile.PropsType = unknown>({
    profile,
    onFrame,
    onEnd,
    initProps,
    wrappers,
  }: {
    profile: Profile<P>;
    onFrame?: (props: Partial<P>) => void;
    onEnd?: () => void;
    initProps?: Partial<P>;
    wrappers?: Record<string, Wrapper>;
  }): number {
    let id = this._nextTempAnimationId--;
    let animation = new Animation(profile, {
      initProps,
      wrappers,
    });
    animation.onFrame = onFrame ?? null;
    animation.onEnd = () => {
      if (onEnd) onEnd();
      delete this._tempAnimationMap[id];
    };
    this._tempAnimationMap[id] = animation
    return id;
  }

  public clearTempAnimation(id: number) {
    if (this._tempAnimationMap[id] !== undefined) {
      this._tempAnimationMap[id].stop();
      delete this._tempAnimationMap[id];
    }
    
  }

  private _timerCb() {
    let utc = this._core.platform.getTime();
    let delta_time = (utc - this._lastCbUtc) / 1000;
    this._lastCbUtc = utc;
    // this._core.debug.log(`delta time: ${delta_time}`);
    for (let id in this._animationMap) {
      this._animationMap[id].instance.step(delta_time);
    }

    for (let id in this._tempAnimationMap) {
      this._tempAnimationMap[id].step(delta_time);
    }
  }

  private _frameCb(props: Record<string, any>, id: number) {
    if (this._animationMap[id] !== undefined) {
      let view = this._core.ui.getView(this._animationMap[id].targetViewId);
      if (!view) {
        this._core.debug.log(`view ${id} not found, stop animation`);
        this.stopAnimation(id); // TODO
        return;
      }
      view.commit(props);
      // this._core.debug.log(`update view ${view.name} with ${JSON.stringify(props)}`);
    }
  }

  private _linkAnimationCb(animation: Animation, id: number) {
    animation.onFrame = (props) => {
      // console.log("onFrame cb");

      this._frameCb(props, id);
    };
    animation.onEnd = () => this._endCb(id);
  }

  private _endCb(id: number) {
    if (this._animationMap[id] !== undefined) {
      if (this._animationMap[id].destroyOnEnd) {
        let view = this._core.ui.getView(id);
        if (view) this._core.ui.destroyView(view);
      }
      delete this._animationMap[id];
      console.log("map item", this._animationMap[id]);
      
    }
    else console.log("nf map item", this._animationMap[id]);
    
  }
}

namespace AnimationPlugin {
  export interface Options {
    destroyOnEnd?: boolean;
    isSave?: boolean;
    customWrappers?: Record<string, Wrapper>;
  }
  export interface AnimationItem {
    destroyOnEnd: boolean;
    isSave: boolean;
    targetViewId: number;
    instance: Animation;
  }
  export namespace AnimationItem {
    export interface Serialized {
      destroyOnEnd: boolean;
      isSave: boolean;
      targetViewId: number;
      serializedInstance: Animation.Serialized;
    }
  }
}

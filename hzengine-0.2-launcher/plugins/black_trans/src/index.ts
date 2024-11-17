/// <reference types="@zeppos/device-types" />
import hmUI from "@zos/ui";
import { HZEngineCore, TransformPlugin, UI } from "hzengine-core";


import {Platform} from 'hzengine-core'
export declare interface WidgetFactory {
  createWidget(widgetType: number, option: Record<string, any>): any;
  deleteWidget(widget: any): void;
}

export declare type PlatformZOS = Platform<WidgetFactory>

export default function BlackTrans(core: HZEngineCore): InstanceType {
  var animationPlugin = core.plugins.get(
    "animation"
  ) as TransformPlugin.AnimationPlugin;
  if (!animationPlugin) {
    core.debug.log("animation plugin not found");
    return null;
  }
  class BlackTransView extends UI.View<BlackTransViewProp, PlatformZOS> {
    _widget: any = null;
    _widgetFactory = this.core.ui.getLayer(this.layer)!.widgetFactory;
    _animationId: number | null = null;
    enableAnim: boolean = true;
    public onCreated: (() => any) | null = null;
    public onDestroyed: (() => any) | null = null;
    __prop: BlackTransViewProp | null = null;
    protected onCreate(prop: BlackTransViewProp): void {
      this.__prop = {...prop};
      let size = core.ui.getScreenSize();
      this._widget = this._widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: size.width,
        h: size.height,
        color: 0x000000,
      });
      this._widget.setAlpha(0);
      if (this.enableAnim) {
        this._animationId = animationPlugin.createTempAnimation({
          profile: [
            { frame: { alpha: 0 } },
            {
              time: prop.in_time,
              wrapper: prop.in_wrapper,
              frame: { alpha: 1 },
            },
          ],
          onFrame: (props) => {
            this._widget.setAlpha(~~(props.alpha! * 255));
          },

          onEnd: () => {
            if (this.onCreated) {
              this.onCreated();
            }
          },
        });
      }
    }
    protected onCommit(prop: BlackTransViewProp): void {}
    protected onDestroy(): void {
      this._stopAnim();
      if (this.enableAnim) {
        this._animationId = animationPlugin.createTempAnimation({
          profile: [
            { frame: { alpha: 1 } },
            {
              time: this.__prop!.out_time,
              wrapper: this.__prop!.out_wrapper,
              frame: { alpha: 0 },
            },
          ],
          onFrame: (props) => {
            this._widget.setAlpha(~~(props.alpha! * 255));
          },
          onEnd: () => {
            if (this._widget) {
              hmUI.deleteWidget(this._widget);
              this._widget = null;
            }
            if (this.onDestroyed) {
              this.onDestroyed();
            }
          },
        });
      } else {
        if (this._widget) {
          hmUI.deleteWidget(this._widget);
          this._widget = null;
        }
        if (this.onDestroyed) {
          this.onDestroyed();
        }
      }
    }
    _stopAnim() {
      if (this._animationId != null) {
        animationPlugin.clearTempAnimation(this._animationId);
        this._animationId = null;
      }
    }
  }
  core.ui.registerView("black_trans", BlackTransView);
  let activeView: BlackTransView | null = null;
  return {
    show({
      cb,
      layer = "overlay",
      in_time = 0.8,
      out_time = 0.8,
      in_wrapper = "easein",
      out_wrapper = "easeout",
    }: ShowArg) {
      if (activeView) {
        activeView._stopAnim();
        activeView.enableAnim = false;
        core.ui.destroyView(activeView);
        activeView = null;
      }
      activeView = core.ui.createView<BlackTransViewProp>(
        "black_trans",
        layer,
        {
          alpha: 0,
          in_time,
          out_time,
          in_wrapper,
          out_wrapper,
        },
        false
      ) as BlackTransView;
      activeView.onCreated = cb ?? null;
    },
    hide({ cb }: HideArg) {
      if (activeView) {
        activeView.onDestroyed = cb ?? null;
        core.ui.destroyView(activeView);
        activeView = null;
      }
    },
  };
}

export type InstanceType = {
  show(arg: ShowArg): void;
  hide(arg: HideArg): void;
} | null;
declare type ShowArg = {
  cb?: () => any;
  layer?: string;
  in_time?: number;
  out_time?: number;
  in_wrapper?: string;
  out_wrapper?: string;
};
declare type HideArg = {
  cb?: () => any;
};
export interface BlackTransViewProp {
  alpha: number;
  in_time: number;
  out_time: number;
  in_wrapper: string;
  out_wrapper: string;
}

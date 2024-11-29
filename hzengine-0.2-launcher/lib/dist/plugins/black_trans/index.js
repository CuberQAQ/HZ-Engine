/// <reference types="@zeppos/device-types" />
import hmUI from "@zos/ui";
import { UI } from "hzengine-core";
export default function BlackTrans(core) {
    var animationPlugin = core.plugins.get("animation");
    if (!animationPlugin) {
        core.debug.log("animation plugin not found");
        return null;
    }
    class BlackTransView extends UI.View {
        constructor() {
            super(...arguments);
            this._widget = null;
            this._widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
            this._animationId = null;
            this.enableAnim = true;
            this.onCreated = null;
            this.onDestroyed = null;
            this.__prop = null;
        }
        onCreate(prop) {
            this.__prop = { ...prop };
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
                        this._widget.setAlpha(~~(props.alpha * 255));
                    },
                    onEnd: () => {
                        if (this.onCreated) {
                            this.onCreated();
                        }
                    },
                });
            }
        }
        onCommit(prop) { }
        onDestroy() {
            this._stopAnim();
            if (this.enableAnim) {
                this._animationId = animationPlugin.createTempAnimation({
                    profile: [
                        { frame: { alpha: 1 } },
                        {
                            time: this.__prop.out_time,
                            wrapper: this.__prop.out_wrapper,
                            frame: { alpha: 0 },
                        },
                    ],
                    onFrame: (props) => {
                        this._widget.setAlpha(~~(props.alpha * 255));
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
            }
            else {
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
    let activeView = null;
    return {
        show({ cb, layer = "overlay", in_time = 0.8, out_time = 0.8, in_wrapper = "easein", out_wrapper = "easeout", }) {
            if (activeView) {
                activeView._stopAnim();
                activeView.enableAnim = false;
                core.ui.destroyView(activeView);
                activeView = null;
            }
            activeView = core.ui.createView("black_trans", layer, {
                alpha: 0,
                in_time,
                out_time,
                in_wrapper,
                out_wrapper,
            }, false);
            activeView.onCreated = cb ?? null;
        },
        hide({ cb }) {
            if (activeView) {
                activeView.onDestroyed = cb ?? null;
                core.ui.destroyView(activeView);
                activeView = null;
            }
        },
    };
}

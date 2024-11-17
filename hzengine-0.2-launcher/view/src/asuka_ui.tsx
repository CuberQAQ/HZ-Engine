import { AsukaUI, RenderView } from "@cuberqaq/asuka-ui";
import { render, store } from "@cuberqaq/asuka-ui/solid";
import { HZEngineCore, UI } from "hzengine-core";
import { PlatformZOS } from "./hzengine-platform-zeppos.js";

export default function TestPage(core: HZEngineCore) {
  registerAsukaPage(core, "asukaTestPage", () => {
    return (
      <button text="Hello Asuka Page!" width={200} height={100}>
        asukaTestPage
      </button>
    );
  });
}
var asuka: AsukaUI | null = null;
export function registerAsukaPage(
  core: HZEngineCore,
  name: string,
  Component: Function
) {
  if (!asuka) {
    asuka = new AsukaUI();
  }
  class AsukaView extends UI.View<any, PlatformZOS> {
    disposeFunc: Function | null = null;
    _widgetFactory = this.core.ui.getLayer(this.layer)!.widgetFactory;
    rootView: RenderView | null = null;
    store: store.Store<any>;
    protected onCreate(prop: any): void {
      this.rootView = asuka!.mountView(this._widgetFactory);
      this.store = store.createStore(prop);
      this.disposeFunc = render(() => <Component {...prop} />, this.rootView);
    }
    protected onCommit(prop: any): void {
      throw new Error("Method not implemented.");
    }
    protected onDestroy(): void {
      throw new Error("Method not implemented.");
    }
  }
  core.ui.registerView(name, AsukaView);
}

import { AsukaUI, RenderView } from "@cuberqaq/asuka-ui";
import {} from "@cuberqaq/asuka-ui/solid";
import { HZEngineCore, UI } from "hzengine-core";

export default function TestPage(core: HZEngineCore) {
  registerAsukaPage(core, "asukaTestPage", () => {
    return (
      <button
        text="Hello Asuka Page!"
        width={200}
        height={100}
      >
        asukaTestPage
      </button>
    );
  });
}
var asuka: AsukaUI | null = null;
export function registerAsukaPage(
  core: HZEngineCore,
  name: string,
  component: Function
) {
  if (!asuka) {
    asuka = new AsukaUI();
  }
  class AsukaView extends UI.View<any> {
    disposeFunc: Function | null = null;
    _widgetFactory = this.core.ui.getLayer(this.layer)!.widgetFactory;
    rootView: RenderView | null = null;
    protected onCreate(prop: any): void {
      this.rootView = asuka!.mountView(this._widgetFactory);
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

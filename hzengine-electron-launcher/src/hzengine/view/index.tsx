import { HZEngineCore, UI } from "hzengine-core";
import HZEnginePlatformWeb from "../hzengine-platform-web";
import ReactDOM from "react-dom/client";
import Say from "./Say";
import { registerReactView } from "./react-view";
import Menu from "./Menu";
import BgImg from "./BgImg";
import FgImg from "./FgImg";
export function EletronViewPlugin(core: HZEngineCore) {
  core.ui.registerView("title", EmptyView);
  // core.ui.registerView("menu", Menu);
  registerReactView(core, "menu", Menu);
  // core.ui.registerView("fg_img", EmptyView);
  registerReactView(core, "fg_img", FgImg);
  // core.ui.registerView("bg_img", EmptyView);
  registerReactView(core, "bg_img", BgImg);
  // core.ui.registerView("say", EmptyView);
  registerReactView(core, "say", Say);
  core.ui.registerView("quick_menu", EmptyView);
}

class EmptyView extends UI.View<any, typeof HZEnginePlatformWeb> {
  parent: HTMLDivElement | null = this.core.ui.getLayer(this.layer)
    ?.widgetFactory;
  protected onCreate(prop: any): void {
    console.log("create view. parent", this.parent);

    const div = document.createElement("div");
    // div.style.zIndex = z_index.toString();
    div.style.position = "absolute";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.left = "0px";
    div.style.top = "0px";
    div.style.pointerEvents = "none";

    this.core.debug.log(`EmptyView [${this.name}] created`, prop);
  }
  protected onCommit(prop: any): void {
    this.core.debug.log(`EmptyView [${this.name}] committed`, prop);
  }
  protected onDestroy(): void {
    this.core.debug.log(`EmptyView [${this.name}] destroyed`);
  }
}

import { HZEngineCore, Storage, UI } from "hzengine-core";
import React from "react";
import ReactDOM from 'react-dom/client'

export function registerReactView<PropType extends Storage.Saveable<PropType>>(
  core: HZEngineCore,
  name: string,
  component: React.FunctionComponent<any>
) {
  const ReactView = class extends UI.View<PropType, any> {
    div: HTMLDivElement | null = null;
    root: ReactDOM.Root | null = null;
  protected onCreate(prop: any): void {
    const parent = this.core.ui.getLayer(this.layer)?.widgetFactory;
    console.log("create ReactView. parent", parent);

    this.div = document.createElement("div");
    // div.style.zIndex = z_index.toString();
    this.div.style.position = "absolute";
    this.div.style.width = "100%";
    this.div.style.height = "100%";
    this.div.style.left = "0px";
    this.div.style.top = "0px";
    this.div.style.pointerEvents = "none";

    parent?.append(this.div);
    this.core.debug.log(`ReactView [${this.name}] create`, prop);
    this.root = ReactDOM.createRoot(this.div)
    this.root.render(React.createElement(component.bind(this), prop, null))
  }
  protected onCommit(prop: any): void {
    this.core.debug.log(`ReactView [${this.name}] commit`, prop);
    this.root!.render(React.createElement(component.bind(this), prop, null))
  }
  protected onDestroy(): void {
    this.core.debug.log(`ReactView [${this.name}] destroy`);
    this.root!.unmount();
    this.div!.remove();
  }
};
  core.ui.registerView(name, ReactView);
}

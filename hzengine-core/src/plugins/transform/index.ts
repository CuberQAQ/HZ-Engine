import hmUI from "@zos/ui";
import { HZEngineCore, Storage, UI } from "../..";

export function transform(core: HZEngineCore) {
    
}

const transformRouteStrategy: UI.Router.RouteStrategy = {
    create(
      viewName: string,
      layer: string,
      prop: Storage.Saveable<unknown>,
      ui: UI,
      isSave: boolean
    ): UI.View<Storage.Saveable<Storage.Saveable<unknown>>> {
      let view = ui.createView(viewName, layer, prop, isSave);
      return view
    },
    destroy(viewInstance: UI.View<Storage.Saveable<unknown>>, ui: UI): void {
      ui.destroyView(viewInstance);
    },
    // update(
    //   viewInstance: UI.View<Storage.Saveable<unknown>>,
    //   prop: Storage.Saveable<unknown>,
    //   ui: UI
    // ): void {
    //   ui.updateView(viewInstance, prop);
    // },
  };



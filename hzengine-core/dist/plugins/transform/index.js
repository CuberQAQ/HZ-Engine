"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = transform;
function transform(core) {
}
const transformRouteStrategy = {
    create(viewName, layer, prop, ui, isSave) {
        let view = ui.createView(viewName, layer, prop, isSave);
        return view;
    },
    destroy(viewInstance, ui) {
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

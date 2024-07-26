import { HZEngineCore } from "..";
import { ArchiveStateAccessorWithSerializer } from "../storage/decorator";
import { Storage } from "../storage/index";
/// <reference path="node_modules/@zeppos/device-types/dist/index.d.ts" />
import * as hmUI from "@zos/ui";
import {} from "@zos/ui";
export class UI {
  constructor(public _core: HZEngineCore) {
    this.addLayer("bg", 1);
    this.addLayer("fg", 3);
    this.addLayer("ct", 5);
    this.addLayer("overlay", 7);
    this.addRouter("page", "overlay", false);
  }

  // Layer
  @ArchiveStateAccessorWithSerializer(
    "ui.layerList",
    function serializer(layerList) {
      let obj: Record<string, [name: string, z_index: number]> = {};
      for (let [key, value] of this.layerList) {
        obj[key] = [value.name, value.z_index];
      }
      return obj;
    },
    function deserializer(obj) {
      // destroy old layer
      for (let [key, value] of this.layerList) {
        value.destroy();
      }
      this.layerList.clear();

      let newLayerList = new Map<string, UI.Layer>();
      // create new layer
      for (let key in obj) {
        let newLayer = new UI.Layer(obj[key][0], obj[key][1]);
        newLayerList.set(key, newLayer);
        this._core.emit("afterAddLayer", newLayer);
      }

      return newLayerList;
    }
  )
  private accessor _layerList: Map<string, UI.Layer> = new Map();

  get layerList() {
    return this._layerList;
  }
  addLayer(name: string, z_index: number) {
    this._core.emit("beforeAddLayer", name, z_index);
    if (this._layerList.has(name)) throw `Layer ${name} already exist`;
    let newLayer = new UI.Layer(name, z_index);
    this._layerList.set(name, newLayer);
    this._core.emit("afterAddLayer", newLayer);
  }
  getLayer(name: string): UI.Layer | undefined {
    return this.layerList.get(name);
  }

  // View
  private _viewClassMap: Map<string, UI.ViewClass<Storage.Saveable<unknown>>> =
    new Map();
  // _activeViewList: [name: string, layer: string, instance: UI.View<unknown>][] =
  //   [];

  registerView<T extends Storage.Saveable<T>>(
    name: string,
    cls: UI.ViewClass<T>
  ): void {
    this._viewClassMap.set(name, cls);
  }
  createView<T extends Storage.Saveable<T>>(
    name: string,
    layer: string,
    prop: T
  ): UI.View<T> {
    if (!this._viewClassMap.get(name)) {
      throw "要创建的View不存在";
    }
    let _ViewFactory = this._viewClassMap.get(name);
    let viewInstance = new _ViewFactory!(layer, this._core);
    viewInstance.onCreate(prop);
    // this._activeViewList.push([name, layer, viewInstance]);
    return viewInstance;
  }
  updateView<T extends Storage.Saveable<T>>(
    viewInstance: UI.View<T>,
    new_prop: T
  ) {
    viewInstance.onCommit(new_prop);
  }
  destroyView(viewInstance: UI.View<Storage.Saveable<unknown>>) {
    viewInstance.onDestroy();
  }

  @ArchiveStateAccessorWithSerializer(
    "ui.routerMap",
    function serializer(routerMap) {
      let obj: Record<string, UI.Router.Serialized> = {};
      for (let [key, value] of routerMap) {
        if (!value.isSave) continue;
        obj[key] = value.serialize();
      }
      return obj;
    },
    function deserializer(obj) {
      // reshow not save router
      let newRouterMap = new Map<string, UI.Router>();
      for (let [name, router] of this._routerMap) {
        if (!router.isSave) {
          if (router.length > 0) {
            router.activeViewInstance = this._core.ui.createView(
              router.viewStack[0][0],
              router.layer,
              router.viewStack[0][1]
            );
          }
          newRouterMap.set(name, router);
        }
      }
      for (let key in obj) {
        newRouterMap.set(key, UI.Router.deserialize(this, obj[key]));
      }
      return newRouterMap;
    }
  )
  private accessor _routerMap: Map<string, UI.Router> = new Map();

  getRouter(tag: string) {
    return this._routerMap.get(tag);
  }

  addRouter(tag: string, layer: string, isSave: boolean = true) {
    if (this._routerMap.has(tag))
      throw `Route with tag [${tag}] already exist!`;
    let router = new UI.Router(this, tag, layer, isSave);
    this._routerMap.set(tag, router);
    return router;
  }
}

export namespace UI {
  export type ViewClass<T extends Storage.Saveable<T>> = {
    new (layer: string, core: HZEngineCore): View<T>;
  };

  export abstract class View<T extends Storage.Saveable<T>> {
    constructor(public layer: string, public core: HZEngineCore) {}
    abstract onCreate(prop: T): void;
    abstract onCommit(prop: T): void;
    abstract onDestroy(): void;
  }

  export interface Message {
    who: string;
    what: string;
  }
  export abstract class MessageView extends View<Message> {}

  export interface MenuItemData {
    text: string;
    position: [path: string, index: number];
    enable_js_expression?: string;
  }
  export type MenuViewProp = {
    itemList: MenuItemData[];
  };
  export abstract class MenuView extends View<MenuViewProp> {}

  export type Coordinate = { x: number; y: number };
  export type Size = { width: number; height: number };

  /**
   * 立绘/道具等显示在`fg`layer上的图片View
   */
  export type FgImgViewProp = {
    imgPath: string;
    offset: Coordinate;
    size: Size;
  };
  export abstract class FgImgView extends View<FgImgViewProp> {}

  /**
   * cg等显示在`bg`layer上的图片View
   */
  export type BgImgViewProp = {
    imgPath: string;
    offset: Coordinate;
    size: Size;
  };
  export abstract class BgImgView extends View<FgImgViewProp> {}

  export class Layer {
    widgetFactory: Layer.WidgetFactory;
    constructor(public name: string, public z_index: number) {
      this.widgetFactory = hmUI.createWidget(
        (hmUI.widget as any).VIEW_CONTAINER,
        {
          scroll_enable: 0,
          z_index,
        }
      ) as unknown as Layer.WidgetFactory;
    }
    destroy() {
      hmUI.deleteWidget(this.widgetFactory as any);
    }
  }
  export namespace Layer {
    export interface WidgetFactory {
      createWidget(widgetType: number, option: Record<string, any>): any;
      deleteWidget(widget: any): void;
    }
  }

  export class Router {
    constructor(
      private _ui: UI,
      public tag: string,
      public layer: string,
      public isSave = true
    ) {}
    serialize(): Router.Serialized {
      return {
        tag: this.tag,
        layer: this.layer,
        isSave: this.isSave,
        viewStack: this.viewStack,
      };
    }
    static deserialize(ui: UI, data: Router.Serialized) {
      let router = new Router(ui, data.tag, data.layer, data.isSave);
      router.viewStack = data.viewStack;
      if (router.viewStack.length)
        router.activeViewInstance = ui.createView(
          data.viewStack[0][0],
          data.layer,
          data.viewStack[0][1]
        );
      return router;
    }
    viewStack: [view_name: string, prop: Storage.Saveable<unknown>][] = [];
    get length() {
      return this.viewStack.length;
    }
    activeViewInstance: View<Storage.Saveable<unknown>> | null = null;
    push<T extends Storage.Saveable<T>>(view_name: string, prop: T) {
      let layerInstance = this._ui.getLayer(this.layer);
      if (!layerInstance) throw `Layer [${this.layer}] not found`;
      this.activeViewInstance = this._ui.createView(
        view_name,
        this.layer,
        prop
      );
      this.viewStack.push([view_name, prop]);
    }
    pop<T extends Storage.Saveable<T>>(back_prop?: T) {
      if (this.activeViewInstance) {
        this._ui.destroyView(this.activeViewInstance);
        this.activeViewInstance = null;
      }
      this.viewStack.pop();

      if (this.viewStack.length) {
        let backViewInfo = this.viewStack[this.viewStack.length - 1];
        let layerInstance = this._ui.getLayer(this.layer);
        if (!layerInstance) throw `Layer [${this.layer}] not found`;
        this.activeViewInstance = this._ui.createView(
          backViewInfo[0],
          this.layer,
          back_prop ?? backViewInfo[1]
        );
      }
    }
    replace<T extends Storage.Saveable<T>>(view_name: string, prop: T) {
      if (this.activeViewInstance) {
        this._ui.destroyView(this.activeViewInstance);
        this.activeViewInstance = null;
      }
      this.viewStack.pop();

      let layerInstance = this._ui.getLayer(this.layer);
      if (!layerInstance) throw `Layer [${this.layer}] not found`;
      this.activeViewInstance = this._ui.createView(
        view_name,
        this.layer,
        prop
      );
      this.viewStack.push([view_name, prop]);
    }
    update<T extends Storage.Saveable<T>>(prop: T) {
      if (!this.activeViewInstance)
        throw `Update View but activeViewInstance is null`;
      this.viewStack[this.viewStack.length - 1][1] = prop;
      this._ui.updateView(this.activeViewInstance, prop);
    }
    clear() {
      if (this.activeViewInstance) {
        this._ui.destroyView(this.activeViewInstance);
      }
      this.viewStack = [];
    }
  }
  export namespace Router {
    export type Serialized = {
      tag: string;
      layer: string;
      isSave: boolean;
      viewStack: [view_name: string, prop: Storage.Saveable<unknown>][];
    };
  }
}

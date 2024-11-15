import { HZEngineCore } from "../index.js";
import {
  Save,
  CustomSave,
} from "../storage/decorator.js";
import { Storage } from "../storage/index.js";
/// <reference path="node_modules/@zeppos/device-types/dist/index.d.ts" />
import * as hmUI from "@zos/ui";
import {} from "@zos/ui";

import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
const { width, height, screenShape } = getDeviceInfo();
export class UI {
  constructor(public _core: HZEngineCore) {
    this._initUI();
  }

  private _initUI() {
    this.addLayer("bg", 1);
    this.addLayer("fg", 2);
    this.addLayer("ct", 3);
    this.addLayer("overlay", 4);
    this.addRouter("page", "overlay", false);
  }

  private _cleanUI() {
    for (let [key, value] of this.layerList) {
      value.destroy();
    }
    this.layerList.clear();
    this._routerMap.clear();
  }

  resetUI() {
    this._cleanUI();
    this._initUI();
  }

  // Layer
  @CustomSave(
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

  // View Class
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

  // View
  @Save("ui.nextViewId")
  private accessor _nextViewId: number = 50;

  @CustomSave(
    "ui.viewMap",
    function serializer(viewMap) {
      let obj: Record<string, UI.View.Serialized> = {};
      for (let [id, view] of viewMap) {
        // 注意viewMap中的id是number，而obj中的id會自動轉成string
        if (view.isSave) obj[id] = view.serialize();
      }
      return obj;
    },
    function deserializer(obj) {
      let newViewMap = new Map<number, UI.View<Storage.Saveable<unknown>>>();
      for (let key in obj) {
        let item = obj[key] as UI.View.Serialized;
        let view = this._produceViewWithId(
          item.name,
          item.layer,
          item.prop,
          Number(key)
        );
        view.isSave = true;
        newViewMap.set(Number(key), view);
      }
      return newViewMap;
    }
  )
  private accessor _viewMap: Map<number, UI.View<Storage.Saveable<unknown>>> =
    new Map();

  getView(id: number): UI.View<Storage.Saveable<unknown>> | null {
    return this._viewMap.get(id) ?? null;
  }

  createView<T extends Storage.Saveable<T>>(
    name: string,
    layer: string,
    prop: T,
    isSave: boolean
  ): UI.View<T> {
    let id = this._nextViewId++;
    let viewInstance = this._produceViewWithId(name, layer, prop, id);
    this._core.debug.log(`creating view ${viewInstance.name}`);
    viewInstance.isSave = isSave;
    this._viewMap.set(id, viewInstance);
    return viewInstance;
  }
  updateView<T extends Storage.Saveable<T>>(
    viewInstance: UI.View<T>,
    new_prop: T
  ) {
    viewInstance.commit(new_prop);
  }
  destroyView(viewInstance: UI.View<Storage.Saveable<unknown>>) {
    if (viewInstance.id != null) this._viewMap.delete(viewInstance.id);
    viewInstance.destroy();
  }
  /**由調用者提供id，創建一個View，不會處理isSave，也不會更新viewMap */
  private _produceViewWithId<T extends Storage.Saveable<T>>(
    name: string,
    layer: string,
    prop: T,
    id: number
  ): UI.View<T> {
    if (!this._viewClassMap.get(name)) {
      throw "要创建的View不存在";
    }
    let _ViewFactory = this._viewClassMap.get(name);
    let viewInstance = new _ViewFactory!(layer, this._core) as UI.View<T>;
    viewInstance.id = id;
    viewInstance.name = name;
    viewInstance.create(prop);
    this._core.debug.log(`producing view ${viewInstance.name}`);
    return viewInstance;
  }

  @CustomSave(
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
      let newRouterMap = new Map<string, UI.Router>();
      // reshow not save router
      for (let [name, router] of this._routerMap) {
        if (!router.isSave) {
          if (router.length > 0) {
            // TODO 因爲讀檔的時候會重置整個ui系統，所以要重新創建activeViewInstance  這裏感覺有點問題
            router.activeViewInstance = this._core.ui.createView(
              router.viewStack[0][0],
              router.layer,
              router.viewStack[0][1],
              router.isSave
            );
          }
          newRouterMap.set(name, router);
        }
      }
      // reshow save router
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
    public id: number | null = null;
    public name: string | null = null;
    public isSave: boolean = true;
    private _prop: T | null = null;
    public get prop(): T | null {
      return this._prop;
    }
    private set prop(prop: T | null) {
      this._prop = prop;
    }
    constructor(public layer: string, public core: HZEngineCore) {}
    create(prop: T) {
      this.prop = prop;
      this.onCreate(prop);
    }
    protected abstract onCreate(prop: T): void;
    commit(prop: T) {
      this.prop = prop;
      this.onCommit(prop);
    }
    protected abstract onCommit(prop: T): void;
    destroy() {
      this.onDestroy();
      this.prop = null;
      this.id = null;
    }
    protected abstract onDestroy(): void;

    serialize(): View.Serialized {
      if (this.name == null)
        throw new Error("View name is null when serialize");
      return {
        name: this.name,
        layer: this.layer,
        prop: this.prop,
      };
    }
  }

  export namespace View {
    export interface Serialized {
      name: string;
      layer: string;
      prop: Storage.Saveable<unknown>;
    }
  }

  export interface BasicUniversalProp {
    // 透明度 [0, 1]
    alpha?: number;
    // 锚点对齐位置 [0, 1]； 在不指定的情况下，默认位于屏幕中心
    xalign?: number;
    yalign?: number;
    // 锚点相对图像位置 [0, 1]； 在不指定的情况下，以图像中心作为锚点
    xanchor?: number;
    yanchor?: number;
    // px； 不指定就是不偏移
    xoffset?: number;
    yoffset?: number;
  }

  export function getScreenSize(): Size {
    return {
      width,
      height,
    };
  }

  /**
   * 根据 BasicUniversalProp 计算屏幕上的位置
   * @param prop 包含 BasicUniversalProp 的 prop
   * @param size (可选)图像的尺寸，若不指定，返回的anchor坐标和origin坐标一样
   * @returns 
   */
  export function calcPosition(
    prop: BasicUniversalProp,
    size?: Size
  ): {
    /** 锚点（算上偏移）的屏幕位置 */
    anchor: Coordinate;
    /** 图像左上角的屏幕位置 */
    origin: Coordinate;
  } {
    // 1. 确定 anchor
    // 2. 通过 align 确定初始位置
    // 3. offset
    // 返回左上角的位置
    let anchor_coord = {
      x:
        (width * ((prop.xalign ?? 0) + 1)) / 2 + // 根据 align 求出 anchor 位置
        (prop.xoffset ?? 0), // offset
      y:
        (height * ((prop.yalign ?? 0) + 1)) / 2 + // 根据 align 求出 anchor 位置
        (prop.yoffset ?? 0), // offset
    };
    let origin_coord = {
      x: anchor_coord.x - (((prop.xanchor ?? 0) + 1) / 2) * (size?.width ?? 0),
      y: anchor_coord.y - (((prop.yanchor ?? 0) + 1) / 2) * (size?.height ?? 0),
    };
    return {
      anchor: anchor_coord,
      origin: origin_coord,
    };
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
        activeViewId: this.activeViewInstance?.id ?? null,
      };
    }
    defaultRouteStrategy: Router.RouteStrategy = {
      destroy: (viewInstance, ui) => {
        this._ui._core.debug.log(`destroy view ${viewInstance.name}`);
        ui.destroyView(viewInstance);
      },
      create: (viewName, layer, prop, ui, isSave) => {
        this._ui._core.debug.log(`create view ${viewName}`);
        return ui.createView(viewName, layer, prop, isSave);
      },
      update: (viewInstance, prop, ui) => {
        this._ui._core.debug.log(`update view ${viewInstance.name}`);
        ui.updateView(viewInstance, prop);
      },
    };
    static deserialize(ui: UI, data: Router.Serialized) {
      let router = new Router(ui, data.tag, data.layer, data.isSave);
      router.viewStack = data.viewStack;
      if (data.activeViewId != null) {
        let viewInstance = ui.getView(data.activeViewId);
        if (!viewInstance)
          throw `View [${data.activeViewId}] not found when deserialize`;
        router.activeViewInstance = viewInstance;
      }
      return router;
    }
    viewStack: [view_name: string, prop: Storage.Saveable<unknown>][] = [];
    get length() {
      return this.viewStack.length;
    }
    activeViewInstance: View<Storage.Saveable<unknown>> | null = null;
    push<T extends Storage.Saveable<T>>(
      view_name: string,
      prop: T,
      strategy?: Router.RouteStrategy
    ) {
      if (this.activeViewInstance) {
        // this._ui.destroyView(this.activeViewInstance);
        // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
        //   this.activeViewInstance,
        //   this._ui
        // );
        if (strategy?.destroy) {
          strategy.destroy(this.activeViewInstance, this._ui);
        } else {
          this.defaultRouteStrategy.destroy!(this.activeViewInstance, this._ui);
        }
        this.activeViewInstance = null;
      }
      let layerInstance = this._ui.getLayer(this.layer);
      if (!layerInstance) throw `Layer [${this.layer}] not found`;
      // this.activeViewInstance = (
      //   strategy?.create ?? this.defaultRouteStrategy.create!
      // )(view_name, this.layer, prop, this._ui, this.isSave);
      if (strategy?.create) {
        this.activeViewInstance = strategy.create(
          view_name,
          this.layer,
          prop,
          this._ui,
          this.isSave
        );
      } else {
        this.activeViewInstance = this.defaultRouteStrategy.create!(
          view_name,
          this.layer,
          prop,
          this._ui,
          this.isSave
        );
      }
      this.viewStack.push([view_name, prop]);
    }
    pop<T extends Storage.Saveable<T>>(
      back_prop?: T,
      strategy?: Router.RouteStrategy
    ) {
      if (this.activeViewInstance) {
        // this._ui.destroyView(this.activeViewInstance);
        // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
        //   this.activeViewInstance,
        //   this._ui
        // );
        if (strategy?.destroy) {
          strategy.destroy(this.activeViewInstance, this._ui);
        } else {
          this.defaultRouteStrategy.destroy!(this.activeViewInstance, this._ui);
        }
        this.activeViewInstance = null;
      }
      this.viewStack.pop();

      if (this.viewStack.length) {
        let backViewInfo = this.viewStack[this.viewStack.length - 1];
        let layerInstance = this._ui.getLayer(this.layer);
        if (!layerInstance) throw `Layer [${this.layer}] not found`;
        // this.activeViewInstance = (
        //   strategy?.create ?? this.defaultRouteStrategy.create!
        // )(
        //   backViewInfo[0],
        //   this.layer,
        //   back_prop ?? backViewInfo[1],
        //   this._ui,
        //   this.isSave
        // );
        if (strategy?.create) {
          this.activeViewInstance = strategy.create(
            backViewInfo[0],
            this.layer,
            back_prop ?? backViewInfo[1],
            this._ui,
            this.isSave
          );
        } else {
          this.activeViewInstance = this.defaultRouteStrategy.create!(
            backViewInfo[0],
            this.layer,
            back_prop ?? backViewInfo[1],
            this._ui,
            this.isSave
          );
        }
      }
    }
    replace<T extends Storage.Saveable<T>>(
      view_name: string,
      prop: T,
      strategy?: Router.RouteStrategy
    ) {
      if (this.activeViewInstance) {
        // this._ui.destroyView(this.activeViewInstance);
        // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
        //   this.activeViewInstance,
        //   this._ui
        // );
        if (strategy?.destroy) {
          strategy.destroy(this.activeViewInstance, this._ui);
        } else {
          this.defaultRouteStrategy.destroy!(this.activeViewInstance, this._ui);
        }
        this.activeViewInstance = null;
      }
      this.viewStack.pop();

      let layerInstance = this._ui.getLayer(this.layer);
      if (!layerInstance) throw `Layer [${this.layer}] not found`;
      // this.activeViewInstance = (
      //   strategy?.create ?? this.defaultRouteStrategy.create!
      // )(view_name, this.layer, prop, this._ui, this.isSave);
      if (strategy?.create) {
        this.activeViewInstance = strategy.create(
          view_name,
          this.layer,
          prop,
          this._ui,
          this.isSave
        );
      } else {
        this.activeViewInstance = this.defaultRouteStrategy.create!(
          view_name,
          this.layer,
          prop,
          this._ui,
          this.isSave
        );
      }
      this.viewStack.push([view_name, prop]);
    }
    update<T extends Storage.Saveable<T>>(
      prop: T,
      strategy?: Router.RouteStrategy
    ) {
      if (!this.activeViewInstance)
        throw `Update View but activeViewInstance is null`;
      this.viewStack[this.viewStack.length - 1][1] = prop;
      // (strategy?.update ?? this.defaultRouteStrategy.update!)(
      //   this.activeViewInstance,
      //   prop,
      //   this._ui
      // );
      if (strategy?.update) {
        strategy.update(this.activeViewInstance, prop, this._ui);
      } else {
        this.defaultRouteStrategy.update!(
          this.activeViewInstance,
          prop,
          this._ui
        );
      }
    }
    clear(strategy?: Router.RouteStrategy) {
      if (this.activeViewInstance) {
        // (strategy?.destroy ?? this.defaultRouteStrategy.destroy!)(
        //   this.activeViewInstance,
        //   this._ui
        // );
        if (strategy?.destroy) {
          strategy.destroy(this.activeViewInstance, this._ui);
        } else {
          this.defaultRouteStrategy.destroy!(this.activeViewInstance, this._ui);
        }
        this.activeViewInstance = null;
      }
      this.viewStack = [];
    }
  }
  export namespace Router {
    export interface Serialized {
      tag: string;
      layer: string;
      isSave: boolean;
      viewStack: [view_name: string, prop: Storage.Saveable<unknown>][];
      activeViewId: number | null;
    }

    // 实现自定义路由策略，允许接管Router对View的创建和销毁，实现例如动画等功能
    export interface RouteStrategy<
      T extends Storage.Saveable<T> = Storage.Saveable<unknown>
    > {
      destroy?(viewInstance: View<T>, ui: UI): void;
      create?(
        viewName: string,
        layer: string,
        prop: T,
        ui: UI,
        isSave: boolean
      ): View<Storage.Saveable<T>>;

      update?(viewInstance: View<T>, prop: T, ui: UI): void;
    }
  }
}

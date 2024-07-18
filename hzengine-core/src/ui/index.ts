import { HZEngineCore } from "..";

export class UI {
  constructor(private _core: HZEngineCore) {}
  private _layerList: Map<string, UI.Layer> = new Map();
  get layerList() {
    return this._layerList;
  }
  addLayer(name: string) {}
  getLayer(name: string): UI.Layer | undefined {
    return this.layerList.get(name);
  }
  _viewClassMap: Map<string, UI.ViewClass<unknown>> = new Map();
  _activeViewList: [name: string, layer: string, instance: UI.View<unknown>][] =
    [];
  registerView(name: string, cls: UI.ViewClass<unknown>): void {
    this._viewClassMap.set(name, cls);
  }
  createView(name: string, layer: string, prop: unknown): void {
    if (!this._viewClassMap.get(name)) {
      throw "要创建的View不存在";
    }
    let _ViewFactory = this._viewClassMap.get(name);
    let viewInstance = new _ViewFactory!();
    viewInstance.onCreate(prop, layer, this._core);
    this._activeViewList.push([name, layer, viewInstance]);
  }
}

export namespace UI {
  export type ViewClass<T> = {
    new (): View<T>;
  };

  export abstract class View<T> {
    abstract onCreate(prop: T, layer: string, core: HZEngineCore): void;
    abstract onCommit(prop: T, layer: string, core: HZEngineCore): void;
    abstract onDestroy(prop: T, layer: string, core: HZEngineCore): void;
  }

  export interface Message {
    who: string;
    text: string;
  }
  export abstract class MessageView extends View<Message> {}

  export type ChoiceViewProp = {
    choiceList: string[];
    onChoice(index: number): void;
  };
  export abstract class ChoiceView extends View<ChoiceViewProp> {}

  export type Coordinate = { x: number; y: number };

  /**
   * 立绘/道具等显示在`fg`layer上的图片View
   */
  export type FgImgViewProp = {
    imgPath: string;
    position: Coordinate;
  };
  export abstract class FgImgView extends View<FgImgViewProp> {}

  /**
   * cg等显示在`bg`layer上的图片View
   */
  export type BgImgViewProp = {
    imgPath: string;
    position: Coordinate;
  };
  export abstract class BgImgView extends View<FgImgViewProp> {}

  export class Layer {}
}

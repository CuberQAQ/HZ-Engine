import { HZEngineCore } from "..";
import { Storage } from "../storage/index";
export declare class UI {
    _core: HZEngineCore;
    constructor(_core: HZEngineCore);
    private accessor _layerList;
    get layerList(): Map<string, UI.Layer>;
    addLayer(name: string, z_index: number): void;
    getLayer(name: string): UI.Layer | undefined;
    private _viewClassMap;
    registerView<T extends Storage.Saveable<T>>(name: string, cls: UI.ViewClass<T>): void;
    createView<T extends Storage.Saveable<T>>(name: string, layer: string, prop: T): UI.View<T>;
    updateView<T extends Storage.Saveable<T>>(viewInstance: UI.View<T>, new_prop: T): void;
    destroyView(viewInstance: UI.View<Storage.Saveable<unknown>>): void;
    private accessor _routerMap;
    getRouter(tag: string): UI.Router | undefined;
    addRouter(tag: string, layer: string, isSave?: boolean): UI.Router;
}
export declare namespace UI {
    type ViewClass<T extends Storage.Saveable<T>> = {
        new (layer: string, core: HZEngineCore): View<T>;
    };
    abstract class View<T extends Storage.Saveable<T>> {
        layer: string;
        core: HZEngineCore;
        constructor(layer: string, core: HZEngineCore);
        abstract onCreate(prop: T): void;
        abstract onCommit(prop: T): void;
        abstract onDestroy(): void;
    }
    interface Message {
        who: string;
        what: string;
    }
    abstract class MessageView extends View<Message> {
    }
    interface MenuItemData {
        text: string;
        position: [path: string, index: number];
        enable_js_expression?: string;
    }
    type MenuViewProp = {
        itemList: MenuItemData[];
    };
    abstract class MenuView extends View<MenuViewProp> {
    }
    type Coordinate = {
        x: number;
        y: number;
    };
    type Size = {
        width: number;
        height: number;
    };
    /**
     * 立绘/道具等显示在`fg`layer上的图片View
     */
    type FgImgViewProp = {
        imgPath: string;
        offset: Coordinate;
        size: Size;
    };
    abstract class FgImgView extends View<FgImgViewProp> {
    }
    /**
     * cg等显示在`bg`layer上的图片View
     */
    type BgImgViewProp = {
        imgPath: string;
        offset: Coordinate;
        size: Size;
    };
    abstract class BgImgView extends View<FgImgViewProp> {
    }
    class Layer {
        name: string;
        z_index: number;
        widgetFactory: Layer.WidgetFactory;
        constructor(name: string, z_index: number);
        destroy(): void;
    }
    namespace Layer {
        interface WidgetFactory {
            createWidget(widgetType: number, option: Record<string, any>): any;
            deleteWidget(widget: any): void;
        }
    }
    class Router {
        private _ui;
        tag: string;
        layer: string;
        isSave: boolean;
        constructor(_ui: UI, tag: string, layer: string, isSave?: boolean);
        serialize(): Router.Serialized;
        static deserialize(ui: UI, data: Router.Serialized): Router;
        viewStack: [view_name: string, prop: Storage.Saveable<unknown>][];
        get length(): number;
        activeViewInstance: View<Storage.Saveable<unknown>> | null;
        push<T extends Storage.Saveable<T>>(view_name: string, prop: T): void;
        pop<T extends Storage.Saveable<T>>(back_prop?: T): void;
        replace<T extends Storage.Saveable<T>>(view_name: string, prop: T): void;
        update<T extends Storage.Saveable<T>>(prop: T): void;
        clear(): void;
    }
    namespace Router {
        type Serialized = {
            tag: string;
            layer: string;
            isSave: boolean;
            viewStack: [view_name: string, prop: Storage.Saveable<unknown>][];
        };
    }
}

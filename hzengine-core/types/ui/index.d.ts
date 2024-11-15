import { HZEngineCore } from "../index.js";
import { Storage } from "../storage/index.js";
export declare class UI {
    _core: HZEngineCore;
    constructor(_core: HZEngineCore);
    private _initUI;
    private _cleanUI;
    resetUI(): void;
    private accessor _layerList;
    get layerList(): Map<string, UI.Layer>;
    addLayer(name: string, z_index: number): void;
    getLayer(name: string): UI.Layer | undefined;
    private _viewClassMap;
    registerView<T extends Storage.Saveable<T>>(name: string, cls: UI.ViewClass<T>): void;
    private accessor _nextViewId;
    private accessor _viewMap;
    getView(id: number): UI.View<Storage.Saveable<unknown>> | null;
    createView<T extends Storage.Saveable<T>>(name: string, layer: string, prop: T, isSave: boolean): UI.View<T>;
    updateView<T extends Storage.Saveable<T>>(viewInstance: UI.View<T>, new_prop: T): void;
    destroyView(viewInstance: UI.View<Storage.Saveable<unknown>>): void;
    /**由調用者提供id，創建一個View，不會處理isSave，也不會更新viewMap */
    private _produceViewWithId;
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
        id: number | null;
        name: string | null;
        isSave: boolean;
        private _prop;
        get prop(): T | null;
        private set prop(value);
        constructor(layer: string, core: HZEngineCore);
        create(prop: T): void;
        protected abstract onCreate(prop: T): void;
        commit(prop: T): void;
        protected abstract onCommit(prop: T): void;
        destroy(): void;
        protected abstract onDestroy(): void;
        serialize(): View.Serialized;
    }
    namespace View {
        interface Serialized {
            name: string;
            layer: string;
            prop: Storage.Saveable<unknown>;
        }
    }
    interface BasicUniversalProp {
        alpha?: number;
        xalign?: number;
        yalign?: number;
        xanchor?: number;
        yanchor?: number;
        xoffset?: number;
        yoffset?: number;
    }
    function getScreenSize(): Size;
    /**
     * 根据 BasicUniversalProp 计算屏幕上的位置
     * @param prop 包含 BasicUniversalProp 的 prop
     * @param size (可选)图像的尺寸，若不指定，返回的anchor坐标和origin坐标一样
     * @returns
     */
    function calcPosition(prop: BasicUniversalProp, size?: Size): {
        /** 锚点（算上偏移）的屏幕位置 */
        anchor: Coordinate;
        /** 图像左上角的屏幕位置 */
        origin: Coordinate;
    };
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
        defaultRouteStrategy: Router.RouteStrategy;
        static deserialize(ui: UI, data: Router.Serialized): Router;
        viewStack: [view_name: string, prop: Storage.Saveable<unknown>][];
        get length(): number;
        activeViewInstance: View<Storage.Saveable<unknown>> | null;
        push<T extends Storage.Saveable<T>>(view_name: string, prop: T, strategy?: Router.RouteStrategy): void;
        pop<T extends Storage.Saveable<T>>(back_prop?: T, strategy?: Router.RouteStrategy): void;
        replace<T extends Storage.Saveable<T>>(view_name: string, prop: T, strategy?: Router.RouteStrategy): void;
        update<T extends Storage.Saveable<T>>(prop: T, strategy?: Router.RouteStrategy): void;
        clear(strategy?: Router.RouteStrategy): void;
    }
    namespace Router {
        interface Serialized {
            tag: string;
            layer: string;
            isSave: boolean;
            viewStack: [view_name: string, prop: Storage.Saveable<unknown>][];
            activeViewId: number | null;
        }
        interface RouteStrategy<T extends Storage.Saveable<T> = Storage.Saveable<unknown>> {
            destroy?(viewInstance: View<T>, ui: UI): void;
            create?(viewName: string, layer: string, prop: T, ui: UI, isSave: boolean): View<Storage.Saveable<T>>;
            update?(viewInstance: View<T>, prop: T, ui: UI): void;
        }
    }
}

import { HZEngineCore, Platform } from "../index.js";
import { Storage } from "../storage/index.js";
export declare class UI<PlatformType extends Platform = any> {
    _core: HZEngineCore<PlatformType>;
    constructor(_core: HZEngineCore<PlatformType>);
    private _initUI;
    private _cleanUI;
    resetUI(): void;
    private accessor _layerList;
    get layerList(): Map<string, UI.Layer<PlatformType>>;
    addLayer(name: string, z_index: number): void;
    getLayer(name: string): UI.Layer<PlatformType> | undefined;
    private _viewClassMap;
    registerView<PropType extends Storage.Saveable<PropType>>(name: string, cls: UI.ViewClass<PropType, PlatformType>): void;
    private accessor _nextViewId;
    private accessor _viewMap;
    getView(id: number): UI.View<Storage.Saveable<unknown>, PlatformType> | null;
    createView<PropType extends Storage.Saveable<PropType>>(name: string, layer: string, prop: PropType, isSave: boolean): UI.View<PropType, PlatformType>;
    updateView<PropType extends Storage.Saveable<PropType>>(viewInstance: UI.View<PropType, PlatformType>, new_prop: PropType): void;
    destroyView(viewInstance: UI.View<Storage.Saveable<unknown>, PlatformType>): void;
    /**由調用者提供id，創建一個View，不會處理isSave，也不會更新viewMap */
    private _produceViewWithId;
    private accessor _routerMap;
    getRouter(tag: string): UI.Router<PlatformType> | undefined;
    addRouter(tag: string, layer: string, isSave?: boolean): UI.Router<PlatformType>;
    getScreenSize(): {
        width: number;
        height: number;
    };
    /**
     * 根据 BasicUniversalProp 计算屏幕上的位置
     * @param prop 包含 BasicUniversalProp 的 prop
     * @param size (可选)图像的尺寸，若不指定，返回的anchor坐标和origin坐标一样
     * @returns
     */
    calcPosition(prop: UI.BasicUniversalProp, size?: UI.Size): {
        /** 锚点（算上偏移）的屏幕位置 */
        anchor: UI.Coordinate;
        /** 图像左上角的屏幕位置 */
        origin: UI.Coordinate;
    };
}
export declare namespace UI {
    type ViewClass<PropType extends Storage.Saveable<PropType>, PlatformType extends Platform> = {
        new (layer: string, core: HZEngineCore<PlatformType>): View<PropType, PlatformType>;
    };
    abstract class View<PropType extends Storage.Saveable<PropType>, PlatformType extends Platform = any> {
        layer: string;
        core: HZEngineCore<PlatformType>;
        id: number | null;
        name: string | null;
        isSave: boolean;
        private _prop;
        get prop(): PropType | null;
        private set prop(value);
        constructor(layer: string, core: HZEngineCore<PlatformType>);
        create(prop: PropType): void;
        protected abstract onCreate(prop: PropType): void;
        commit(prop: PropType): void;
        protected abstract onCommit(prop: PropType): void;
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
    interface Message {
        who: string;
        what: string;
    }
    abstract class MessageView<PlatformType extends Platform> extends View<Message, PlatformType> {
    }
    interface MenuItemData {
        text: string;
        position: [path: string, index: number];
        enable_js_expression?: string;
    }
    type MenuViewProp = {
        itemList: MenuItemData[];
    };
    abstract class MenuView<PlatformType extends Platform> extends View<MenuViewProp, PlatformType> {
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
    abstract class FgImgView<PlatformType extends Platform> extends View<FgImgViewProp, PlatformType> {
    }
    /**
     * cg等显示在`bg`layer上的图片View
     */
    type BgImgViewProp = {
        imgPath: string;
        offset: Coordinate;
        size: Size;
    };
    abstract class BgImgView<PlatformType extends Platform> extends View<FgImgViewProp, PlatformType> {
    }
    class Layer<PlatformType extends Platform> {
        _core: HZEngineCore<PlatformType>;
        name: string;
        z_index: number;
        widgetFactory: ReturnType<PlatformType["createUILayer"]>;
        constructor(_core: HZEngineCore<PlatformType>, name: string, z_index: number);
        destroy(): void;
    }
    namespace Layer {
    }
    class Router<PlatformType extends Platform> {
        private _ui;
        tag: string;
        layer: string;
        isSave: boolean;
        constructor(_ui: UI<PlatformType>, tag: string, layer: string, isSave?: boolean);
        serialize(): Router.Serialized;
        defaultRouteStrategy: Router.RouteStrategy;
        static deserialize<PlatformType extends Platform>(ui: UI<PlatformType>, data: Router.Serialized): Router<PlatformType>;
        viewStack: [view_name: string, prop: Storage.Saveable<unknown>][];
        get length(): number;
        activeViewInstance: View<Storage.Saveable<unknown>, PlatformType> | null;
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
        interface RouteStrategy<PropType extends Storage.Saveable<PropType> = Storage.Saveable<unknown>, PlatformType extends Platform = any> {
            destroy?(viewInstance: View<PropType, PlatformType>, ui: UI<PlatformType>): void;
            create?(viewName: string, layer: string, prop: PropType, ui: UI<PlatformType>, isSave: boolean): View<Storage.Saveable<PropType>, PlatformType>;
            update?(viewInstance: View<PropType, PlatformType>, prop: PropType, ui: UI<PlatformType>): void;
        }
    }
}

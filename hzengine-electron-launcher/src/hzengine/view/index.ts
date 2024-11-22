import { HZEngineCore, UI } from "hzengine-core";

export function EletronViewPlugin(core: HZEngineCore) {
	core.ui.registerView("title", EmptyView);
    core.ui.registerView("menu", EmptyView);
    core.ui.registerView("fg_img", EmptyView);
    core.ui.registerView("bg_img", EmptyView);
    core.ui.registerView("say", EmptyView);
    core.ui.registerView("quick_menu", EmptyView);
}

class EmptyView extends UI.View<any, any> {
    protected onCreate(prop: any): void {
        this.core.debug.log(`EmptyView [${this.name}] created`, prop);
    }
    protected onCommit(prop: any): void {
        this.core.debug.log(`EmptyView [${this.name}] committed`, prop);
    }
    protected onDestroy(): void {
        this.core.debug.log(`EmptyView [${this.name}] destroyed`);
    }
}
import { AsukaUI } from "@cuberqaq/asuka-ui";
import { render, store } from "@cuberqaq/asuka-ui/solid";
import { UI } from "hzengine-core";
export default function TestPage(core) {
    registerAsukaPage(core, "asukaTestPage", () => {
        return (<button text="Hello Asuka Page!" width={200} height={100}>
        asukaTestPage
      </button>);
    });
}
var asuka = null;
export function registerAsukaPage(core, name, Component) {
    if (!asuka) {
        asuka = new AsukaUI();
    }
    class AsukaView extends UI.View {
        disposeFunc = null;
        _widgetFactory = this.core.ui.getLayer(this.layer).widgetFactory;
        rootView = null;
        store;
        onCreate(prop) {
            this.rootView = asuka.mountView(this._widgetFactory);
            this.store = store.createStore(prop);
            this.disposeFunc = render(() => <Component {...prop}/>, this.rootView);
        }
        onCommit(prop) {
            throw new Error("Method not implemented.");
        }
        onDestroy() {
            throw new Error("Method not implemented.");
        }
    }
    core.ui.registerView(name, AsukaView);
}

import { Async } from "./async";
import { basic_command } from "./plugins/basic_command";
import { global_gesture } from "./plugins/global_gesture";
import { Script } from "./script";
import { Storage } from "./storage";
import { System } from "./system";
import { UI } from "./ui";

class HZEngineCore {
  // 請不要調整這裡的初始化順序，不然會有問題（裝飾器裡有時候要用到前面初始化的東西）
  private _eventCallbacks: Map<string, Set<Function>> = new Map();
  storage = new Storage(this);
  ui = new UI(this);
  script = new Script(this);
  system = new System(this);
  constructor() {
    // internal plugin
    this.loadPlugin("global_gesture", global_gesture);
    this.loadPlugin("basic_command", basic_command);
  }
  loadProject(projectPath: string) {
    this.storage.loadProject(projectPath);
  }
  start(callback?: () => unknown) {
    // this.system.start()
    Async.nextTick(() => {
      let title = this.storage.packageData?.name;
      if (title == null) {
        throw `[HZEngine] project name is null, please loadProject first or check your project.json format`;
      }
      this.ui.getRouter("page")!.push("title", {
        title,
      });
      callback?.();
    });
  }

  // Load Plugin
  loadPlugin(name: string, plugin: Plugin) {
    console.log(`[HZEngine] load plugin [${name}]`);

    plugin(this);
  }

  // Event Bus
  on(event: string, cb: Function) {
    if (this._eventCallbacks.has(event)) {
      this._eventCallbacks.get(event)!.add(cb);
    } else {
      this._eventCallbacks.set(event, new Set<Function>().add(cb));
    }
  }
  off(event: string, cb: Function): boolean {
    return !!this._eventCallbacks.get(event)?.delete(cb);
  }
  emit(event: string, ...args: any[]) {
    this._eventCallbacks.get(event)?.forEach((cb) => {
      cb(...args);
    });
  }
}

type Plugin = (core: HZEngineCore) => void;

export { HZEngineCore, UI, Storage, Script, System };

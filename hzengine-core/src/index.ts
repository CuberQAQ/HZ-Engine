import { Storage } from "./storage";
import { UI } from "./ui";

class HZEngineCore {
  ui = new UI(this);
  storage = new Storage(this);
  constructor() {}
  loadProject(projectPath: string) {
    this.storage.loadProject(projectPath)
  }
  start() {}

  // Load Plugin
  loadPlugin(name: string, plugin: Plugin) {
    plugin(this);
  }

  // Event Bus
  private _eventCallbacks: Map<string, Set<Function>> = new Map();
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

export { HZEngineCore, UI, Storage };

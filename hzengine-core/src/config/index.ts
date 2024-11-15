import { HZEngineCore } from "../index.js";

export class Config {
  constructor(private _core: HZEngineCore) {
    _core.on("initGlobalData", () => {
      _core.storage.setSaveableData(
        _core.storage.globalData,
        true,
        { ...defaultConfig },
        "config"
      );
    });
    _core.on("afterLoadGlobalData", () => {
      if (!(_core.storage.globalData as any)?.config) {
        _core.storage.setSaveableData(
          _core.storage.globalData,
          true,
          { ...defaultConfig },
          "config"
        );
      }
      _core.storage.saveGlobalData();
    });
  }

  getConfig(key: string) {
    let keys = this.normalizeKey(key);
    // this._core.debug.log(`getConfig keys = ${JSON.stringify(keys)}`);

    if (keys == null) return;
    try {
      let res = this._core.storage.getSaveableData(
        this._core.storage.globalData,
        false,
        "config",
        ...keys
      );
    //   this._core.debug.log(`getConfig res = ${JSON.stringify(res)}`);
      return res;
    } catch (e) {
        // this._core.debug.log(`getConfig error`,e);
      return;
    }
  }

  setConfig(key: string, value: any) {
    let keys = this.normalizeKey(key);
    if (keys == null) return;
    this._core.storage.setSaveableData(
      this._core.storage.globalData,
      true,
      value,
      "config",
      ...keys
    );

    this._core.storage.saveGlobalData();
  }

  private normalizeKey(key: string): string[] | null {
    let keys = <string[]>[];
    key.split(".").forEach((key) => {
      if (key.trim().length > 0) keys.push(key);
      else return null;
    });
    return keys;
  }

  resetConfig() {}
}

const defaultConfig = {
  game: {
    autoplay: {
      enable: false,
      ms_per_char: 150,
      extra_delay: 1300,
    },
  },
};

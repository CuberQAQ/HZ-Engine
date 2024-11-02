"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
class Config {
    constructor(_core) {
        this._core = _core;
        _core.on("initGlobalData", () => {
            _core.storage.setSaveableData(_core.storage.globalData, true, Object.assign({}, defaultConfig), "config");
        });
        _core.on("afterLoadGlobalData", () => {
            var _a;
            if (!((_a = _core.storage.globalData) === null || _a === void 0 ? void 0 : _a.config)) {
                _core.storage.setSaveableData(_core.storage.globalData, true, Object.assign({}, defaultConfig), "config");
            }
            _core.storage.saveGlobalData();
        });
    }
    getConfig(key) {
        let keys = this.normalizeKey(key);
        // this._core.debug.log(`getConfig keys = ${JSON.stringify(keys)}`);
        if (keys == null)
            return;
        try {
            let res = this._core.storage.getSaveableData(this._core.storage.globalData, false, "config", ...keys);
            //   this._core.debug.log(`getConfig res = ${JSON.stringify(res)}`);
            return res;
        }
        catch (e) {
            // this._core.debug.log(`getConfig error`,e);
            return;
        }
    }
    setConfig(key, value) {
        let keys = this.normalizeKey(key);
        if (keys == null)
            return;
        this._core.storage.setSaveableData(this._core.storage.globalData, true, value, "config", ...keys);
        this._core.storage.saveGlobalData();
    }
    normalizeKey(key) {
        let keys = [];
        key.split(".").forEach((key) => {
            if (key.trim().length > 0)
                keys.push(key);
            else
                return null;
        });
        return keys;
    }
    resetConfig() { }
}
exports.Config = Config;
const defaultConfig = {
    game: {
        autoplay: {
            enable: false,
            ms_per_char: 150,
            extra_delay: 1300,
        },
    },
};

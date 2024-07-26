"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const hmFS = __importStar(require("@zos/fs"));
const fs_1 = require("./fs");
const path_polyfill_1 = __importDefault(require("@cuberqaq/path-polyfill"));
class Storage {
    constructor(_core) {
        this._core = _core;
        this.projectRoot = null;
        this.preloadedData = null;
        this.packageData = null;
        // Storage Data
        /**
         * 全局数据
         * 其中的数据不会跟随存档保存，而是直接存储在全局数据文件中
         * 如：设置、CG解锁情况等
         */
        this._globalData = null;
        /**
         * 存档数据
         * 其中的数据会跟随存档保存
         * 如：脚本执行位置即调用栈，攻略度等
         */
        this._archiveData = null;
        /**
         * 保存全局数据
         * 可以多次調用，實際上會異步儲存，也就是在一個宏任務中即使調用多次，也只會在宏任務結束後儲存一次
         */
        this._saveGlobalDataTimerId = null;
        this._saveArchiveDataTimerId = null;
        // Decorator Field
        this._archiveStateSetterRegisteredList = new Set();
        this._archiveStateGetterRegisteredList = new Set();
    }
    loadProject(path) {
        if (!(0, fs_1.readdirAssetsSync)({ path })) {
            throw "Dir not exist";
        }
        this.projectRoot = path;
        this.loadPackageData();
        this.preload();
    }
    loadPackageData() {
        if (!this.projectRoot)
            throw "projectDir is null";
        if (!hmFS.statAssetsSync({
            path: path_polyfill_1.default.join(this.projectRoot, "hz_package.json"),
        })) {
            throw "HZEngine Package File (hz_package.json) not exist";
        }
        this.packageData = JSON.parse((0, fs_1.readFileAssetsSync)({
            path: path_polyfill_1.default.join(this.projectRoot, "hz_package.json"),
            options: { encoding: "utf8" },
        }));
    }
    get globalData() {
        if (!this._globalData) {
            this.loadGlobalData();
        }
        if (this._globalData == null)
            throw `[HZEngine] GlobalData is null`;
        return this._globalData;
    }
    /**
     * alias globalData
     */
    get gd() {
        return this.globalData;
    }
    get archiveData() {
        if (!this._archiveData) {
            this.loadArchiveData();
        }
        if (this._archiveData == null)
            throw `[HZEngine] ArchiveData is null`;
        return this._archiveData;
    }
    /**
     * alias archiveData
     */
    get sd() {
        return this.archiveData;
    }
    loadGlobalData() {
        if (!this.projectRoot) {
            throw "projectDir is null, please loadProject first";
        }
        this._core.emit("beforeLoadGlobalData");
        if (hmFS.statAssetsSync({
            path: path_polyfill_1.default.join(this.projectRoot, "globalData.json"),
        })) {
            this._globalData = JSON.parse((0, fs_1.readFileAssetsSync)({
                path: path_polyfill_1.default.join(this.projectRoot, "globalData.json"),
                options: {
                    encoding: "utf8",
                },
            }));
            if (this._globalData == null) {
                this._globalData = {}; // TODO initial GlobalData value
                this._core.emit("initGlobalData");
            }
        }
        else {
            console.log(`[HZEngine] globalData.json not exist, create it.`);
            this._globalData = {}; // Initial GlobalData value
            (0, fs_1.writeFileAssetsSync)({
                path: path_polyfill_1.default.join(this.projectRoot, "globalData.json"),
                data: JSON.stringify(this._globalData),
            });
            this._core.emit("afterLoadGlobalData");
        }
    }
    saveGlobalData() {
        if (!this.projectRoot) {
            throw "projectDir is null, please loadProject first";
        }
        if (this._saveGlobalDataTimerId)
            return;
        this._saveGlobalDataTimerId = setTimeout(() => {
            this._saveGlobalDataTimerId = null;
            if (!this.projectRoot) {
                throw "projectDir is null, please loadProject first";
            }
            this._core.emit("beforeSaveGlobalData");
            let res = (0, fs_1.writeFileAssetsSync)({
                path: path_polyfill_1.default.join(this.projectRoot, "globalData.json"),
                data: JSON.stringify(this._globalData),
            });
            if (res < 0)
                throw `[HZEngine] save globalData to globalData.json failed, code = ${res}`;
            console.log(`[HZEngine] save globalData to globalData.json`);
            this._core.emit("afterSaveGlobalData");
        }, 0);
    }
    loadArchiveData(archivePath) {
        this._core.emit("beforeLoadArchive");
        if (archivePath) {
            if (!this.projectRoot)
                throw `projectDir is null, please loadProject first`;
            if (!hmFS.statAssetsSync({
                path: path_polyfill_1.default.join(this.projectRoot, archivePath),
            })) {
                throw `Archive [${archivePath}] not exist`;
            }
            let archiveData = JSON.parse((0, fs_1.readFileAssetsSync)({
                path: path_polyfill_1.default.join(this.projectRoot, archivePath),
                options: {
                    encoding: "utf8",
                },
            }));
            if (archiveData == null)
                throw `[HZEngine] ArchiveData is null`;
            this._archiveData = archiveData;
            console.log(`[HZEngine] load archiveData from ${archivePath}`);
            this._core.emit("afterLoadArchive");
        }
        else {
            console.log(`[HZEngine] load archiveData from empty template`);
            this._archiveData = {};
            this._core.emit("initArchiveData");
        }
    }
    /**
     * 保存存档数据
     * 可以多次調用，實際上會異步儲存，也就是在一個宏任務中即使調用多次，也只會在宏任務結束後儲存一次
     * @param archivePath 存档文件目錄及名字
     */
    saveArchiveData(archivePath, immediate = false) {
        if (!this.projectRoot)
            throw `projectDir is null, please loadProject first`;
        this._core.emit("beforeSaveArchive");
        console.log("[HZEngine] will save archiveData to " + archivePath);
        let saveFunc = () => {
            console.log("[HZEngine] saving archiveData to " + archivePath);
            if (!this.projectRoot)
                throw `projectDir is null, please loadProject first`;
            let res = (0, fs_1.writeFileAssetsSync)({
                path: path_polyfill_1.default.join(this.projectRoot, archivePath),
                data: JSON.stringify(this._archiveData),
            });
            if (res < 0)
                throw `[HZEngine] save archiveData to ${archivePath} failed, code = ${res}`;
            console.log(`[HZEngine] save archiveData to ${archivePath}`);
            this._core.emit("afterSaveArchive");
        };
        if (immediate) {
            saveFunc();
            if (this._saveArchiveDataTimerId) {
                clearTimeout(this._saveArchiveDataTimerId);
                this._saveArchiveDataTimerId = null;
            }
        }
        else
            this._saveArchiveDataTimerId = setTimeout(() => {
                this._saveArchiveDataTimerId = null;
                saveFunc();
            }, 0);
    }
    getSaveableData(data, auto_correct, ...key_chain) {
        let obj = data;
        // if(obj == null) throw `[HZEngine] saveable data is null`
        for (let key of key_chain) {
            if (obj == null)
                throw Error(`[HZEngine] saveable data is null`);
            if (typeof obj !== "object")
                throw Error(`[HZEngine] saveable data is not object`);
            if (Array.isArray(obj))
                throw Error(`[HZEngine] saveable data is array`);
            if (!obj[key]) {
                if (auto_correct) {
                    obj[key] = {};
                }
                else
                    throw Error(`[HZEngine] saveable data key ${key} not exist`);
            }
            obj = obj[key];
        }
        if (obj == null)
            throw Error(`[HZEngine] saveable data result obj is null`);
        // if (typeof obj !== "object")
        // throw Error(`[HZEngine] saveable data result obj is not array or object`);
        // if (Array.isArray(obj)) throw Error(`[HZEngine] saveable data result is an array, key_chain = ${key_chain.join(".")}, res = ${JSON.stringify(obj)}`);
        return obj;
    }
    setSaveableData(data, auto_correct, value, ...key_chain) {
        console.log(`[HZEngine] setSaveableData ${key_chain} = ${JSON.stringify(value)}`);
        if (key_chain.length == 0)
            throw `key_chain is empty`;
        let parentObj = this.getSaveableData(data, auto_correct, ...key_chain.slice(0, -1));
        if (parentObj == null)
            throw `[HZEngine] saveable data is null`;
        if (typeof parentObj !== "object")
            throw `[HZEngine] saveable data is not object`;
        if (Array.isArray(parentObj))
            throw `[HZEngine] saveable data is array`;
        parentObj[key_chain[key_chain.length - 1]] = value;
    }
    checkSaveableData(data, ...key_chain) {
        return this.getSaveableData(data, false, ...key_chain);
    }
    // Preload
    preload() {
        if (!this.projectRoot) {
            throw "projectDir is null, please loadProject first";
        }
        if (hmFS.statAssetsSync({
            path: path_polyfill_1.default.join(this.projectRoot, "preloaded.json"),
        })) {
            // 已经预加载过了，退出
            this.preloadedData = JSON.parse((0, fs_1.readFileAssetsSync)({
                path: path_polyfill_1.default.join(this.projectRoot, "preloaded.json"),
                options: {
                    encoding: "utf8",
                },
            }));
            return;
        }
        this.preloadedData = {
            script: {
                labelMap: {},
                hzsInfoMap: {},
            },
            image: {
                nameMap: {},
            },
        };
        this.preloadScript();
        this.preloadImage();
        // console.log(JSON.stringify(this.preloadedData));
        (0, fs_1.writeFileAssetsSync)({
            path: path_polyfill_1.default.join(this.projectRoot, "preloaded.json"),
            data: JSON.stringify(this.preloadedData),
        });
        // console.log(
        //   `${Path.join(this.projectDir, "preloaded.json")} = ${readFileAssetsSync({
        //     path: Path.join(this.projectDir, "preloaded.json"),
        //     options:{encoding:"utf8"}
        //   })}`
        // );
    }
    /**
     * 预加载脚本
     * 遍历出所有hzs文件和所有label，建立map
     */
    preloadScript() {
        // 记录脚本label的位置
        // 这里的index是以0开始计数的行数
        let labelMap = this.preloadedData.script.labelMap;
        let scriptDir = path_polyfill_1.default.join(this.projectRoot, "script");
        let hzsInfoMap = this.preloadedData.script.hzsInfoMap;
        if (!(0, fs_1.readdirAssetsSync)({ path: scriptDir }))
            throw "项目文件夹中script文件夹不存在";
        // 遍历所有hzs文件
        traverseScript(scriptDir);
        function traverseScript(path) {
            let dirs = (0, fs_1.readdirAssetsSync)({ path });
            // console.log(dirs);
            for (let dir of dirs) {
                let subpath = path_polyfill_1.default.join(path, dir);
                if ((0, fs_1.isFileAssetsSync)({ path: subpath })) {
                    // 是文件
                    if (dir.endsWith(".hzs")) {
                        preloadHzs(subpath);
                    }
                }
                else {
                    // 是目录
                    traverseScript(subpath);
                }
            }
        }
        /**
         * 1. 预加载所有的label并检查冲突
         * 2. 记录所有脚本文件的行数
         */
        function preloadHzs(path) {
            let fd = hmFS.openAssetsSync({ path });
            if (fd < 0)
                throw "Fd<0";
            let size = hmFS.statAssetsSync({ path }).size;
            let arrbuf = new ArrayBuffer(size);
            hmFS.readSync({ fd, buffer: arrbuf });
            let buffer = Buffer.from(arrbuf);
            let contentStr = buffer.toString();
            let contentLines = contentStr.split("\n");
            let totalLines = contentLines.length;
            hzsInfoMap[path] = { totalLines };
            for (let i = 0; i < totalLines; ++i) {
                let line = contentLines[i].trim();
                if (line.startsWith("*")) {
                    let len = line.length, p = 1, q;
                    while (p < len && line.charAt(p) === " ")
                        ++p;
                    if (p === len)
                        throw `Lost Label Name at file(${path}) line(${i + 1})`;
                    q = p;
                    while (q < len && line.charAt(q) !== " ")
                        ++q;
                    // [p, q)
                    let label = line.slice(p, q);
                    if (labelMap[label]) {
                        throw `Label name "${label}" conflict : \
at [${labelMap[label][0]}(line ${labelMap[label][1]})] \
[${path}(line ${i + 1})]`;
                    }
                    labelMap[label] = [path, i];
                }
            }
        }
    }
    /**
     * 预加载资源
     * 遍历所有png文件，计算对应的name key，建立map
     */
    preloadImage() {
        // 记录脚本label的位置
        // 这里的index是以0开始计数的行数
        let nameMap = this.preloadedData.image.nameMap;
        let imageDir = path_polyfill_1.default.join(this.projectRoot, "image");
        if (!(0, fs_1.readdirAssetsSync)({ path: imageDir }))
            throw "项目文件夹中image文件夹不存在";
        // 遍历所有hzs文件
        traverseImage(imageDir);
        function traverseImage(path) {
            let dirs = (0, fs_1.readdirAssetsSync)({ path });
            // console.log(dirs);
            for (let dir of dirs) {
                let subpath = path_polyfill_1.default.join(path, dir);
                if ((0, fs_1.isFileAssetsSync)({ path: subpath })) {
                    // 是文件
                    if (dir.endsWith(".png")) {
                        preloadImage(subpath);
                    }
                }
                else {
                    // 是目录
                    traverseImage(subpath);
                }
            }
        }
        /**
         * 1. 预加载所有的image并检查冲突
         * 2. 记录所有image的name key和路径
         */
        function preloadImage(path) {
            let raw_name = path_polyfill_1.default.parse(path).name;
            let name_key = raw_name
                .trim()
                .replace("_", " ")
                .replace(/ +/, " ")
                .toLowerCase();
            if (nameMap[name_key])
                throw `Image name key conflict [${name_key}], at file [${path}] and [${nameMap[name_key]}]`;
            nameMap[name_key] = [path];
        }
        // console.log(
        //   `Preloaded image: ${JSON.stringify(this.preloadedData.image.nameMap)}`
        // );
    }
}
exports.Storage = Storage;

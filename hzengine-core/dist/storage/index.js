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
        this.projectDir = null;
        this.preloadedData = null;
    }
    loadProject(path) {
        if (!(0, fs_1.readdirAssetsSync)({ path })) {
            throw "Dir not exist";
        }
        this.projectDir = path;
        this.preloadScript();
    }
    /**
     * 预加载脚本
     * 遍历出所有hzs文件和所有label，建立map
     */
    preloadScript() {
        if (!this.projectDir) {
            throw "projectDir is null, please loadProject first";
        }
        if (hmFS.statAssetsSync({
            path: path_polyfill_1.default.join(this.projectDir, "preloaded.json"),
        })) {
            // 已经预加载过了，退出
            this.preloadedData = JSON.parse((0, fs_1.readFileAssetsSync)({
                path: path_polyfill_1.default.join(this.projectDir, "preloaded.json"),
            }));
            return;
        }
        this.preloadedData = {
            script: {
                labelMap: {},
                hzsInfoMap: {},
            },
        };
        // 记录脚本label的位置
        // 这里的index是以0开始计数的行数
        let labelMap = this.preloadedData.script.labelMap;
        let scriptDir = path_polyfill_1.default.join(this.projectDir, "script");
        let hzsInfoMap = this.preloadedData.script.hzsInfoMap;
        if (!(0, fs_1.readdirAssetsSync)({ path: scriptDir }))
            throw "项目文件夹中script文件夹不存在";
        // 遍历所有hzs文件
        traverseScript(scriptDir);
        function traverseScript(path) {
            let dirs = (0, fs_1.readdirAssetsSync)({ path });
            console.log(dirs);
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
        console.log(JSON.stringify(this.preloadedData));
        console.log("awa1");
        (0, fs_1.writeFileAssetsSync)({
            path: path_polyfill_1.default.join(this.projectDir, "preloaded.json"),
            data: JSON.stringify(this.preloadedData),
        });
        console.log("awa2");
        console.log(`${path_polyfill_1.default.join(this.projectDir, "preloaded.json")} = ${(0, fs_1.readFileAssetsSync)({
            path: path_polyfill_1.default.join(this.projectDir, "preloaded.json"),
        })}`);
    }
}
exports.Storage = Storage;

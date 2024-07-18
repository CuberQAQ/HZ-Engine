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
exports.readFileAssetsSync = exports.writeFileAssetsSync = exports.isFileAssetsSync = exports.isFileDataSync = exports.readdirAssetsSync = void 0;
const hmApp = __importStar(require("@zos/app"));
const hmFS = __importStar(require("@zos/fs"));
const path_polyfill_1 = __importDefault(require("@cuberqaq/path-polyfill"));
function getAppDir(appId = hmApp.getPackageInfo().appId) {
    let str = appId.toString(16);
    switch (str.length) {
        case 1:
            return `0000000${str}`.toUpperCase();
        case 2:
            return `000000${str}`.toUpperCase();
        case 3:
            return `00000${str}`.toUpperCase();
        case 4:
            return `0000${str}`.toUpperCase();
        case 5:
            return `000${str}`.toUpperCase();
        case 6:
            return `00${str}`.toUpperCase();
        case 7:
            return `0${str}`.toUpperCase();
        case 8:
            return `${str}`.toUpperCase();
    }
}
function readdirAssetsSync(option) {
    return hmFS.readdirSync({
        path: fromDataToAssetsPath(option.path),
    });
}
exports.readdirAssetsSync = readdirAssetsSync;
function isFileDataSync(option) {
    let code = hmFS.openSync({ path: option.path });
    if (code >= 0) {
        hmFS.closeSync({ fd: code });
        return true;
    }
    else {
        return false;
    }
}
exports.isFileDataSync = isFileDataSync;
function isFileAssetsSync(option) {
    console.log("path=" + option.path);
    let code = hmFS.openAssetsSync({ path: option.path });
    if (code >= 0) {
        hmFS.closeSync({ fd: code });
        return true;
    }
    else {
        return false;
    }
}
exports.isFileAssetsSync = isFileAssetsSync;
/**
 * 将基于assets的文件路径转换为基于data的文件路径
 */
function fromDataToAssetsPath(path) {
    return path_polyfill_1.default.join(`../../${getAppDir()}/assets`, path);
}
function writeFileAssetsSync(opt) {
    return hmFS.writeFileSync({
        path: fromDataToAssetsPath(opt.path),
        data: opt.data,
        options: opt.options
    });
}
exports.writeFileAssetsSync = writeFileAssetsSync;
function readFileAssetsSync(opt) {
    return hmFS.readFileSync({
        path: fromDataToAssetsPath(opt.path),
        options: opt.options
    });
}
exports.readFileAssetsSync = readFileAssetsSync;

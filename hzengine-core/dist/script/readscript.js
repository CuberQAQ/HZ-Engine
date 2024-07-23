"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readline = void 0;
const fs_1 = require("../storage/fs");
let cache = new Map();
function readline(path, line_index) {
    if (cache.has(path)) {
        return cache.get(path)[line_index];
    }
    // Get Command
    let hzsContent = (0, fs_1.readFileAssetsSync)({
        path,
        options: { encoding: "utf8" },
    });
    let file = hzsContent.split(/\r?\n|(?<!\n)\r/);
    cache.set(path, file);
    return file[line_index];
}
exports.readline = readline;

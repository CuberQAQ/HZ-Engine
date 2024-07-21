"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readline = void 0;
const fs_1 = require("../storage/fs");
function readline(path, line_index) {
    // Get Command
    let hzsContent = (0, fs_1.readFileAssetsSync)({
        path,
        options: { encoding: "utf8" },
    });
    return hzsContent.split(/\r?\n|(?<!\n)\r/)[line_index];
}
exports.readline = readline;

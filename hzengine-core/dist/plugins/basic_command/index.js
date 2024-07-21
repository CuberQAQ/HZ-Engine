"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basic_command = void 0;
const basic_1 = require("./basic");
const character_1 = require("./character");
const decorator_1 = require("./decorator");
const eval_1 = require("./eval");
const menu_1 = require("./menu");
function basic_command(core) {
    (0, basic_1.basic_commands)(core);
    (0, character_1.character_command)(core);
    (0, menu_1.menu_statement)(core);
    (0, decorator_1.decorator_module)(core);
    (0, eval_1.eval_module)(core);
}
exports.basic_command = basic_command;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basic_command = basic_command;
const _1 = require("./$");
const audio_1 = require("./audio");
const basic_1 = require("./basic");
const character_1 = require("./character");
const conditional_1 = require("./conditional");
const config_1 = require("./config");
const decorator_1 = require("./decorator");
const eval_1 = require("./eval");
const img_1 = require("./img");
const menu_1 = require("./menu");
function basic_command(core) {
    (0, basic_1.basic_commands)(core);
    (0, character_1.character_command)(core);
    (0, menu_1.menu_statement)(core);
    (0, decorator_1.decorator_module)(core);
    (0, _1.$_command)(core);
    (0, eval_1.eval_module)(core);
    (0, conditional_1.conditional)(core);
    (0, img_1.img)(core);
    (0, audio_1.audio_command)(core);
    (0, config_1.config_command)(core);
}

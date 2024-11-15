import { HZEngineCore, UI } from "../../index.js";
import { $_command } from "./$.js";
import { audio_command } from "./audio.js";
import { basic_commands } from "./basic.js";
import { character_command } from "./character.js";
import { conditional } from "./conditional.js";
import { config_command } from "./config.js";
import { decorator_module } from "./decorator.js";
import { eval_module } from "./eval.js";
import { img } from "./img.js";
import { menu_statement } from "./menu.js";

export function basic_command(core: HZEngineCore) {
  basic_commands(core);
  character_command(core);
  menu_statement(core);
  decorator_module(core);
  $_command(core);
  eval_module(core);
  conditional(core);
  img(core);
  audio_command(core);
  config_command(core);
}

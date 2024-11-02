import { HZEngineCore, UI } from "../..";
import { $_command } from "./$";
import { audio_command } from "./audio";
import { basic_commands } from "./basic";
import { character_command } from "./character";
import { conditional } from "./conditional";
import { config_command } from "./config";
import { decorator_module } from "./decorator";
import { eval_module } from "./eval";
import { img } from "./img";
import { menu_statement } from "./menu";

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

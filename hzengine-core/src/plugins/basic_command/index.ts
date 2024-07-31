import { HZEngineCore, UI } from "../..";
import { $_command } from "./$";
import { basic_commands } from "./basic";
import { character_command } from "./character";
import { conditional } from "./conditional";
import { decorator_module } from "./decorator";
import { eval_module } from "./eval";
import { menu_statement } from "./menu";

export function basic_command(core: HZEngineCore) {
  basic_commands(core)
  character_command(core)
  menu_statement(core)
  decorator_module(core)
  $_command(core)
  eval_module(core)
  conditional(core)
}

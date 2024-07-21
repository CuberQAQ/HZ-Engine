import { HZEngineCore, UI } from "../..";
import { basic_commands } from "./basic";
import { character_command } from "./character";
import { menu_statement } from "./menu";

export function basic_command(core: HZEngineCore) {
  basic_commands(core)
  character_command(core)
  menu_statement(core)
}

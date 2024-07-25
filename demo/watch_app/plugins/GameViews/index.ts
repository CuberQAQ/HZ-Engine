import * as hmUI from "@zos/ui";
import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device";
import { HZEngineCore, UI } from "hzengine-core";
import { px } from "@zos/utils";
import { Fx } from "../../shared/fx.js";
import path from "@cuberqaq/path-polyfill";
import { BgImgView, FgImgView, MenuView, SayView } from "./nvl.js";
import { TitleView } from "./title.js";
const { width, height, screenShape } = getDeviceInfo();

export default function GameViews(core: HZEngineCore) {
  core.ui.registerView("say", SayView);
  core.ui.registerView("fg_img", FgImgView);
  core.ui.registerView("bg_img", BgImgView);
  core.ui.registerView("menu", MenuView);
  core.ui.registerView("title", TitleView);
}

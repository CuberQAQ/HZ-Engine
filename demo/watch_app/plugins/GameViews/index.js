import { getDeviceInfo } from "@zos/device";
import { BgImgView, FgImgView, MenuView, SayView } from "./nvl.js";
import { TitleView } from "./title.js";
const { width, height, screenShape } = getDeviceInfo();
export default function GameViews(core) {
    core.ui.registerView("say", SayView);
    core.ui.registerView("fg_img", FgImgView);
    core.ui.registerView("bg_img", BgImgView);
    core.ui.registerView("menu", MenuView);
    core.ui.registerView("title", TitleView);
}

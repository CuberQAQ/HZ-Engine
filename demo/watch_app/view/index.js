import { getDeviceInfo } from "@zos/device";
import { BgImgView, FgImgView, MenuView, SayView } from "./nvl.js";
import { TitleView } from "./title.js";
import { QuickMenu } from "./quick_menu.js";
const { width, height, screenShape } = getDeviceInfo();
export default function ViewPlugin(core) {
    core.ui.registerView("say", SayView);
    core.ui.registerView("fg_img", FgImgView);
    core.ui.registerView("bg_img", BgImgView);
    core.ui.registerView("menu", MenuView);
    core.ui.registerView("title", TitleView);
    core.ui.registerView("quick_menu", QuickMenu);
}

// 这里是 ViewPlugin 插件的入口文件
// 该插件注册了say，fg_img，bg_img，menu，title，quick_menu等常用页面组件(view)
// 你可以添加自己的页面组件，也可以修改view文件夹已有的页面组件
// page/index.js中的loadPlugin将这个插件注册到HZEngine中
import { BgImgView, FgImgView, MenuView, SayView } from "./nvl.js";
import { TitleView } from "./title.js";
import { QuickMenu } from "./quick_menu.js";
export default function ViewPlugin(core) {
    // core.ui.registerView的作用是注册页面组件
    // 第一个参数是页面组件的名字，第二个参数是页面组件的类
    // 有一些页面组件是必须的，比如说say，fg_img，bg_img，menu，title
    // 它们会在HZEngine中内部使用，比如名字为say的页面组件会被用于显示角色对话
    core.ui.registerView("say", SayView);
    core.ui.registerView("fg_img", FgImgView);
    core.ui.registerView("bg_img", BgImgView);
    core.ui.registerView("menu", MenuView);
    core.ui.registerView("title", TitleView);
    core.ui.registerView("quick_menu", QuickMenu);
}

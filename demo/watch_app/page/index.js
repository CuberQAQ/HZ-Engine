import { getText } from "@zos/i18n";
import { px } from "@zos/utils";
import {HZEngineCore} from 'hzengine-core'
import CustomViews from "../plugins/CustomViews";
Page({
  build() {
    console.log(getText("example"));
    let hzengine = new HZEngineCore()
    hzengine.loadPlugin("customViews", CustomViews)

    hzengine.loadProject("project")
    hzengine.start() // 原神启动
    console.log("awa");
  },
});


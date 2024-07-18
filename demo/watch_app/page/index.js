import { getText } from "@zos/i18n";
import {HZEngineCore} from 'hzengine-core'
Page({
  build() {
    console.log(getText("example"));
    let hzengine = new HZEngineCore()
    // hzengine.loadProject("example") // 加载 assets/example 项目
    // hzengine.start() // 原神启动

    // console.log("task start");
    // console.log(a)
    hzengine.loadProject("project")

    console.log("awa");
  },
});

function a(){
  console.log("awawa")
}
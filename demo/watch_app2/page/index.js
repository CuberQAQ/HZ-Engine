import { getText } from "@zos/i18n";
import * as hmFS from "@zos/fs";
import * as hmApp from "@zos/app";
import * as hmSensor from "@zos/sensor";
import * as Styles from "zosLoader:./index.[pf].layout.js";
Page({
  build() {
    console.log(getText("example"));
    console.log("Ciallo");
    // console.log(`eval result=${evalExpression('sf.a+gf.b')}`);
    console.log(`result=${hmSensor.checkSensor(hmSensor.Geolocation)}`);
  },
});

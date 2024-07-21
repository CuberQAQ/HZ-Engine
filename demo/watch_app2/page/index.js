import { getText } from "@zos/i18n";
import * as hmFS from "@zos/fs";
import * as hmApp from "@zos/app";
import * as Styles from "zosLoader:./index.[pf].layout.js";
Page({
  build() {
    console.log(getText("example"));
    console.log("Ciallo");
    console.log(`eval result=${evalExpression('sf.a+gf.b')}`);
  },
});

function evalScope(code) {
  return new Function( "sf", "gf", `return ((sf, gf) => {${code}})(sf, gf)`)({}, {});
}
function evalExpression(code) {
  return new Function("sf", "gf", `return (${code})`)({a:2}, {b:3});
}

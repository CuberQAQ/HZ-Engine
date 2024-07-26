import { getText } from "@zos/i18n";
import * as hmFS from "@zos/fs";
import * as hmApp from "@zos/app";
import * as Styles from "zosLoader:./index.[pf].layout.js";
import { ArchiveStateAccessor, ArchiveStateSetter, ArchiveStateGetter } from "../shared/decorator";
Page({
  build() {
    console.log(getText("example"));
    console.log("Ciallo");
    // console.log(`eval result=${evalExpression('sf.a+gf.b')}`);
    let test = new ArchiveStateTest()
    console.log(`testGet=${test.testGet}`)
    console.log(`testSet=${test.testSet(100)}`)
    console.log(`testAccessor get=${test.testAccessor}`)
    console.log(`testAccessor set=${test.testAccessor = 200}`);
  },
});

class ArchiveStateTest {
  _core = {}
  @ArchiveStateGetter("testGet")
  get testGet() {
    return 1
  }

  #testSet = 1
  /**
   * @param {number} val
   */
  @ArchiveStateSetter("testSet")
  set testSet(val) {
    this.#testSet = val
  }

  @ArchiveStateAccessor("testAccessor")
  accessor testAccessor = 2
  
  constructor() {}

}
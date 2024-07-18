import { getText } from '@zos/i18n'
import * as hmFS from '@zos/fs'
import * as hmApp from '@zos/app'
import * as Styles from 'zosLoader:./index.[pf].layout.js'
Page({
  build() {
    console.log(getText('example'))
    hmFS.mkdirSync("awa")
    hmFS.writeFileSync({
      path: "awa/a.txt",
      data: "ciallo"
    })
    hmFS.writeFileSync({
      path: "awa/a2.txt",
      data: "ciallo"
    })
    hmFS.writeFileSync({
      path: "awa/a3.txt",
      data: "ciallo"
    })
    console.log(hmFS.readdirSync({
      path: `../../${getAppDir()}/assets`
    }))

    let code = (hmFS.openSync({path:"awa"}))
    let isDir = code === -4 || code === -5
    console.log(`code=${code} isDir={${isDir}}`);
    // console.log(getAppDir()) 
  }
})

/**
 * 
 * @param {number} appId 
 */
function getAppDir(appId = hmApp.getPackageInfo().appId) {
  let str = appId.toString(16)
  switch(str.length) {
    case 1: return `0000000${str}`
    case 2: return `000000${str}`
    case 3: return `00000${str}`
    case 4: return `0000${str}`
    case 5: return `000${str}`
    case 6: return `00${str}`
    case 7: return `0${str}`
    case 8: return `${str}`
  }
}
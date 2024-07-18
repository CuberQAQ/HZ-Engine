/// <reference path="../../../../node_modules/@zeppos/device-types/dist/index.d.ts" />
import { HZEngineCore } from "..";
import * as hmFS from "@zos/fs";
import {
  isFileAssetsSync,
  readdirAssetsSync,
  readFileAssetsSync,
  writeFileAssetsSync,
} from "./fs";
import Path from "@cuberqaq/path-polyfill";

export class Storage {
  constructor(private _core: HZEngineCore) {}

  projectDir: string | null = null;
  preloadedData: NonNullable<any> | null = null;
  loadProject(path: string) {
    if (!readdirAssetsSync({ path })) {
      throw "Dir not exist";
    }
    this.projectDir = path;

    this.preloadScript();
  }
  /**
   * 预加载脚本
   * 遍历出所有hzs文件和所有label，建立map
   */
  preloadScript() {
    if (!this.projectDir) {
      throw "projectDir is null, please loadProject first";
    }

    if (
      hmFS.statAssetsSync({
        path: Path.join(this.projectDir, "preloaded.json"),
      })
    ) {
      // 已经预加载过了，退出
      this.preloadedData = JSON.parse(
        readFileAssetsSync({
          path: Path.join(this.projectDir, "preloaded.json"),
        }) as string
      );
      return;
    }

    this.preloadedData = {
      script: {
        labelMap: {},
        hzsInfoMap: {},
      },
    };

    // 记录脚本label的位置
    // 这里的index是以0开始计数的行数
    let labelMap: Record<string, [path: string, index: number]> =
      this.preloadedData.script.labelMap;
    let scriptDir = Path.join(this.projectDir, "script");

    // 记录脚本文件信息
    type HzsInfo = {
      totalLines: number;
    };
    let hzsInfoMap: Record<string, [path: string, info: HzsInfo]> =
      this.preloadedData.script.hzsInfoMap;
    if (!readdirAssetsSync({ path: scriptDir }))
      throw "项目文件夹中script文件夹不存在";

    // 遍历所有hzs文件
    traverseScript(scriptDir);
    function traverseScript(path: string) {
      let dirs = readdirAssetsSync({ path });
      console.log(dirs);

      for (let dir of dirs!) {
        let subpath = Path.join(path, dir);
        if (isFileAssetsSync({ path: subpath })) {
          // 是文件
          if (dir.endsWith(".hzs")) {
            preloadHzs(subpath);
          }
        } else {
          // 是目录
          traverseScript(subpath);
        }
      }
    }

    /**
     * 1. 预加载所有的label并检查冲突
     * 2. 记录所有脚本文件的行数
     */
    function preloadHzs(path: string) {
      let fd = hmFS.openAssetsSync({ path });
      if (fd < 0) throw "Fd<0";
      let size = hmFS.statAssetsSync({ path })!.size;
      let arrbuf = new ArrayBuffer(size);
      hmFS.readSync({ fd, buffer: arrbuf });
      let buffer = Buffer.from(arrbuf);
      let contentStr = buffer.toString();
      let contentLines = contentStr.split("\n");
      let totalLines = contentLines.length;

      for (let i = 0; i < totalLines; ++i) {
        let line = contentLines[i].trim();
        if (line.startsWith("*")) {
          let len = line.length,
            p = 1,
            q;
          while (p < len && line.charAt(p) === " ") ++p;
          if (p === len)
            throw `Lost Label Name at file(${path}) line(${i + 1})`;
          q = p;
          while (q < len && line.charAt(q) !== " ") ++q;
          // [p, q)
          let label = line.slice(p, q);

          if (labelMap[label]) {
            throw `Label name "${label}" conflict : \
at [${labelMap[label][0]}(line ${labelMap[label][1]})] \
[${path}(line ${i + 1})]`;
          }

          labelMap[label] = [path, i];
        }
      }
    }

    console.log(JSON.stringify(this.preloadedData));
    console.log("awa1");

    writeFileAssetsSync({
      path: Path.join(this.projectDir, "preloaded.json"),
      data: JSON.stringify(this.preloadedData),
    });
    console.log("awa2");

    console.log(
      `${Path.join(this.projectDir, "preloaded.json")} = ${readFileAssetsSync({
        path: Path.join(this.projectDir, "preloaded.json"),
      })}`
    );
  }
}

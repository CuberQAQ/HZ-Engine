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

    this.preload();
  }

  // Storage Data

  /**
   * 全局数据
   * 其中的数据不会跟随存档保存，而是直接存储在全局数据文件中
   * 如：设置、CG解锁情况等
   */
  private _globalData: NonNullable<Storage.JSONValue> | null = null;
  get globalData() {
    if (!this._globalData) {
      this.loadGlobalData();
    }
    if (this._globalData == null) throw `[HZEngine] GlobalData is null`;
    return this._globalData;
  }
  /**
   * alias globalData
   */
  get gd() {
    return this.globalData;
  }

  /**
   * 存档数据
   * 其中的数据会跟随存档保存
   * 如：脚本执行位置即调用栈，攻略度等
   */
  private _archiveData: NonNullable<Storage.JSONValue> | null = null;
  get archiveData(): NonNullable<Storage.JSONValue> {
    if (!this._archiveData) {
      this.loadArchiveData();
    }
    if (this._archiveData == null) throw `[HZEngine] ArchiveData is null`;
    return this._archiveData;
  }
  /**
   * alias archiveData
   */
  get sd() {
    return this.archiveData;
  }

  loadGlobalData() {
    if (!this.projectDir) {
      throw "projectDir is null, please loadProject first";
    }
    if (
      hmFS.statAssetsSync({
        path: Path.join(this.projectDir, "globalData.json"),
      })
    ) {
      this._globalData = JSON.parse(
        readFileAssetsSync({
          path: Path.join(this.projectDir, "globalData.json"),
          options: {
            encoding: "utf8",
          },
        }) as string
      );
      if (this._globalData == null) {
        this._globalData = {}; // TODO initial GlobalData value
      }
    } else {
      console.log(`[HZEngine] globalData.json not exist, create it.`);
      this._globalData = {}; // Initial GlobalData value
      writeFileAssetsSync({
        path: Path.join(this.projectDir, "globalData.json"),
        data: JSON.stringify(this._globalData),
      });
    }
  }

  /**
   * 保存全局数据
   * 可以多次調用，實際上會異步儲存，也就是在一個宏任務中即使調用多次，也只會在宏任務結束後儲存一次
   */
  private _saveGlobalDataTimerId: number | null = null;
  saveGlobalData() {
    if (!this.projectDir) {
      throw "projectDir is null, please loadProject first";
    }
    if (this._saveGlobalDataTimerId) return;
    this._saveGlobalDataTimerId = setTimeout(() => {
      this._saveGlobalDataTimerId = null;
      if (!this.projectDir) {
        throw "projectDir is null, please loadProject first";
      }
      let res = writeFileAssetsSync({
        path: Path.join(this.projectDir, "globalData.json"),
        data: JSON.stringify(this._globalData),
      });
      if (res < 0)
        throw `[HZEngine] save globalData to globalData.json failed, code = ${res}`;
      console.log(`[HZEngine] save globalData to globalData.json`);
    }, 0);
  }

  loadArchiveData(archivePath?: string) {
    if (archivePath) {
      if (!this.projectDir)
        throw `projectDir is null, please loadProject first`;
      if (
        !hmFS.statAssetsSync({
          path: Path.join(this.projectDir, archivePath),
        })
      ) {
        throw `Archive [${archivePath}] not exist`;
      }
      let archiveData: Storage.JSONValue = JSON.parse(
        readFileAssetsSync({
          path: Path.join(this.projectDir, archivePath),
          options: {
            encoding: "utf8",
          },
        }) as string
      );
      if (archiveData == null) archiveData = {};
      this._archiveData = archiveData;
      console.log(`[HZEngine] load archiveData from ${archivePath}`);
    } else {
      console.log(`[HZEngine] load archiveData from empty template`);
      this._archiveData = {};
    }
  }

  _saveArchiveDataTimerId: number | null = null;
  /**
   * 保存存档数据
   * 可以多次調用，實際上會異步儲存，也就是在一個宏任務中即使調用多次，也只會在宏任務結束後儲存一次
   * @param archivePath 存档文件目錄及名字
   */
  saveArchiveData(archivePath: string, immediate = false) {
    if (!this.projectDir) throw `projectDir is null, please loadProject first`;
    console.log("[HZEngine] will save archiveData to " + archivePath);
    let saveFunc = () => {
      console.log("[HZEngine] saving archiveData to " + archivePath);

      if (!this.projectDir)
        throw `projectDir is null, please loadProject first`;
      let res = writeFileAssetsSync({
        path: Path.join(this.projectDir, archivePath),
        data: JSON.stringify(this._archiveData),
      });
      if (res < 0)
        throw `[HZEngine] save archiveData to ${archivePath} failed, code = ${res}`;
      console.log(`[HZEngine] save archiveData to ${archivePath}`);
    };
    if (immediate) {
      saveFunc();
      if(this._saveArchiveDataTimerId) {
        clearTimeout(this._saveArchiveDataTimerId);
        this._saveArchiveDataTimerId = null;
      }
    } else
      this._saveArchiveDataTimerId = setTimeout(() => {
        this._saveArchiveDataTimerId = null;
        saveFunc();
      }, 0);
  }

  getSaveableData(
    data: Storage.JSONValue,
    auto_correct: boolean,
    ...key_chain: string[]
  ): Record<string, Storage.JSONValue> {
    let obj = data;

    // if(obj == null) throw `[HZEngine] saveable data is null`
    for (let key of key_chain) {
      if (obj == null) throw `[HZEngine] saveable data is null`;
      if (typeof obj !== "object")
        throw `[HZEngine] saveable data is not object`;
      if (Array.isArray(obj)) throw `[HZEngine] saveable data is array`;
      if (!obj[key]) {
        if (auto_correct) {
          obj[key] = {};
        } else throw `[HZEngine] saveable data key ${key} not exist`;
      }
      obj = obj[key];
    }
    if (obj == null) throw `[HZEngine] saveable data result obj is null`;
    if (typeof obj !== "object")
      throw `[HZEngine] saveable data result obj is not array or object`;
    if (Array.isArray(obj)) throw `[HZEngine] saveable data result is an array`;
    return obj;
  }

  checkSaveableData(data: Storage.JSONValue, ...key_chain: string[]) {
    return this.getSaveableData(data, false, ...key_chain);
  }

  // Preload

  preload() {
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
          options: {
            encoding: "utf8",
          },
        }) as string
      );
      return;
    }

    this.preloadedData = {
      script: {
        labelMap: {},
        hzsInfoMap: {},
      },
      image: {
        nameMap: {},
      },
    };

    this.preloadScript();
    this.preloadImage();

    // console.log(JSON.stringify(this.preloadedData));

    writeFileAssetsSync({
      path: Path.join(this.projectDir, "preloaded.json"),
      data: JSON.stringify(this.preloadedData),
    });

    // console.log(
    //   `${Path.join(this.projectDir, "preloaded.json")} = ${readFileAssetsSync({
    //     path: Path.join(this.projectDir, "preloaded.json"),
    //     options:{encoding:"utf8"}
    //   })}`
    // );
  }
  /**
   * 预加载脚本
   * 遍历出所有hzs文件和所有label，建立map
   */
  preloadScript() {
    // 记录脚本label的位置
    // 这里的index是以0开始计数的行数
    let labelMap: Record<string, [path: string, index: number]> =
      this.preloadedData.script.labelMap;
    let scriptDir = Path.join(this.projectDir!, "script");

    let hzsInfoMap: Record<string, HzsInfo> =
      this.preloadedData.script.hzsInfoMap;
    if (!readdirAssetsSync({ path: scriptDir }))
      throw "项目文件夹中script文件夹不存在";

    // 遍历所有hzs文件
    traverseScript(scriptDir);
    function traverseScript(path: string) {
      let dirs = readdirAssetsSync({ path });
      // console.log(dirs);

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
      hzsInfoMap[path] = { totalLines };
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
  }
  /**
   * 预加载资源
   * 遍历所有png文件，计算对应的name key，建立map
   */
  preloadImage() {
    // 记录脚本label的位置
    // 这里的index是以0开始计数的行数
    let nameMap: Record<string, [path: string]> =
      this.preloadedData.image.nameMap;
    let imageDir = Path.join(this.projectDir!, "image");

    if (!readdirAssetsSync({ path: imageDir }))
      throw "项目文件夹中image文件夹不存在";

    // 遍历所有hzs文件
    traverseImage(imageDir);
    function traverseImage(path: string) {
      let dirs = readdirAssetsSync({ path });
      // console.log(dirs);

      for (let dir of dirs!) {
        let subpath = Path.join(path, dir);
        if (isFileAssetsSync({ path: subpath })) {
          // 是文件
          if (dir.endsWith(".png")) {
            preloadImage(subpath);
          }
        } else {
          // 是目录
          traverseImage(subpath);
        }
      }
    }

    /**
     * 1. 预加载所有的image并检查冲突
     * 2. 记录所有image的name key和路径
     */
    function preloadImage(path: string) {
      let raw_name = Path.parse(path).name;
      let name_key = raw_name
        .trim()
        .replace("_", " ")
        .replace(/ +/, " ")
        .toLowerCase();
      if (nameMap[name_key])
        throw `Image name key conflict [${name_key}], at file [${path}] and [${nameMap[name_key]}]`;
      nameMap[name_key] = [path];
    }
    // console.log(
    //   `Preloaded image: ${JSON.stringify(this.preloadedData.image.nameMap)}`
    // );
  }
}

// 记录脚本文件信息
export declare type HzsInfo = {
  totalLines: number;
};

export namespace Storage {
  export type JSONBaseType = number | string | boolean | null;
  export type JSONValue =
    | JSONBaseType
    | { [key: string]: JSONValue }
    | JSONValue[];

  export type Saveable<T> =
    | {
        [P in keyof T]: T[P] extends JSONValue
          ? T[P]
          : T[P] extends NotAssignableToJson
          ? never
          : Saveable<T[P]>;
      }
    | JSONValue[]
    | JSONValue;
  type NotAssignableToJson = bigint | symbol | Function;
}

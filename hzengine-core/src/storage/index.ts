/// <reference path="../../../../node_modules/@zeppos/device-types/dist/index.d.ts" />
import { HZEngineCore } from "..";
import * as hmFS from "@zos/fs";
import Path from "../utils/path";
import { isFileSync } from "./fs";

export class Storage {
  constructor(private _core: HZEngineCore) {}

  projectRoot: string | null = null;
  cacheRoot: string | null = null;
  saveRoot: string | null = null;
  preloadedData: NonNullable<any> | null = null;
  packageData: NonNullable<any> | null = null;
  loadProject(options: {
    projectPath: string;
    cachePath: string;
    savePath: string;
  }) {
    this._core.emit("beforeLoadProject");
    if (!hmFS.readdirSync({ path: options.projectPath })) {
      throw "Dir not exist";
    }
    this.projectRoot = options.projectPath;
    this.cacheRoot = options.cachePath;
    this.saveRoot = options.savePath;

    this.loadPackageData();
    this.preload();

    this._core.emit("afterLoadProject");
  }

  loadPackageData() {
    if (!this.projectRoot) throw "projectDir is null";
    this._core.debug.log(
      `loadPackageData ${this.projectRoot} ${Path.join(
        this.projectRoot,
        "hz_package.json"
      )}`
    );

    if (
      !hmFS.statSync({
        path: Path.join(this.projectRoot, "hz_package.json"),
      })
    ) {
      throw "HZEngine Package File (hz_package.json) not exist";
    }
    this.packageData = JSON.parse(
      hmFS.readFileSync({
        path: Path.join(this.projectRoot, "hz_package.json"),
        options: { encoding: "utf8" },
      }) as string
    );
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
    if (!this.saveRoot) {
      throw "saveDir is null, please loadProject first";
    }
    this._core.emit("beforeLoadGlobalData");
    if (
      hmFS.statSync({
        path: Path.join(this.saveRoot, "globalData.json"),
      })
    ) {
      this._globalData = JSON.parse(
        hmFS.readFileSync({
          path: Path.join(this.saveRoot, "globalData.json"),
          options: {
            encoding: "utf8",
          },
        }) as string
      );
      if (this._globalData == null) {
        this._globalData = {}; // TODO initial GlobalData value
        this._core.emit("initGlobalData");
      }
    } else {
      this._core.debug.log(`globalData.json not exist, create it.`);
      this._globalData = {}; // Initial GlobalData value
      this._core.emit("initGlobalData");
      hmFS.writeFileSync({
        path: Path.join(this.saveRoot, "globalData.json"),
        data: JSON.stringify(this._globalData),
      });
    }
    this._core.emit("afterLoadGlobalData");
  }

  /**
   * 保存全局数据
   * 可以多次調用，實際上會異步儲存，也就是在一個宏任務中即使調用多次，也只會在宏任務結束後儲存一次
   */
  private _saveGlobalDataTimerId: number | null = null;
  saveGlobalData() {
    if (!this.projectRoot) {
      throw "projectDir is null, please loadProject first";
    }
    if (this._saveGlobalDataTimerId) return;
    this._saveGlobalDataTimerId = setTimeout(() => {
      this._saveGlobalDataTimerId = null;
      if (!this.projectRoot) {
        throw "projectDir is null, please loadProject first";
      }
      this._core.emit("beforeSaveGlobalData");
      let res = hmFS.writeFileSync({
        path: Path.join(this.projectRoot, "globalData.json"),
        data: JSON.stringify(this._globalData),
      }) as unknown as number; // TODO
      if (res < 0)
        throw `[HZEngine] save globalData to globalData.json failed, code = ${res}`;
      this._core.debug.log(`save globalData to globalData.json`);
      this._core.emit("afterSaveGlobalData");
    }, 0) as unknown as number;
  }

  loadArchiveData(archiveFile?: string) {
    this._core.emit("beforeLoadArchive");
    if (archiveFile) {
      if (!this.saveRoot) throw `saveRoot is null, please loadProject first`;
      if (
        !hmFS.statSync({
          path: Path.join(this.saveRoot, archiveFile),
        })
      ) {
        throw `Archive [${archiveFile}] not exist`;
      }
      let archiveData: Storage.JSONValue = JSON.parse(
        hmFS.readFileSync({
          path: Path.join(this.saveRoot, archiveFile),
          options: {
            encoding: "utf8",
          },
        }) as string
      );
      if (archiveData == null) throw `[HZEngine] ArchiveData is null`;
      this._archiveData = archiveData;
      this._core.debug.log(`load archiveData from ${archiveFile}`);
      this._core.emit("afterLoadArchive");
    } else {
      this._core.debug.log(`load archiveData from empty template`);
      this._archiveData = {};
      this._core.emit("initArchiveData");
    }
  }

  _saveArchiveDataTimerId: number | null = null;
  /**
   * 保存存档数据
   * 可以多次調用，實際上會異步儲存，也就是在一個宏任務中即使調用多次，也只會在宏任務結束後儲存一次
   * @param archiveFile 存档文件目錄及名字
   */
  saveArchiveData(archiveFile: string, immediate = false) {
    if (!this.saveRoot) throw `saveRoot is null, please loadProject first`;
    this._core.emit("beforeSaveArchive");
    this._core.debug.log("Will save archiveData to " + archiveFile);
    let saveFunc = () => {
      this._core.debug.log("Saving archiveData to " + archiveFile);

      if (!this.saveRoot) throw `projectDir is null, please loadProject first`;
      let res = hmFS.writeFileSync({
        path: Path.join(this.saveRoot, archiveFile),
        data: JSON.stringify(this._archiveData),
      }) as unknown as number; //TODO
      if (res < 0)
        throw `[HZEngine] save archiveData to ${archiveFile} failed, code = ${res}`;
      this._core.debug.log(`Save archiveData to ${archiveFile}`);

      this._core.emit("afterSaveArchive");
    };
    if (immediate) {
      saveFunc();
      if (this._saveArchiveDataTimerId) {
        clearTimeout(this._saveArchiveDataTimerId);
        this._saveArchiveDataTimerId = null;
      }
    } else
      this._saveArchiveDataTimerId = setTimeout(() => {
        this._saveArchiveDataTimerId = null;
        saveFunc();
      }, 0) as unknown as number;
  }

  getSaveableData(
    data: Storage.JSONValue,
    auto_correct: boolean,
    ...key_chain: string[]
  ): NonNullable<Storage.JSONValue> {
    let obj = data;

    // if(obj == null) throw `[HZEngine] saveable data is null`
    for (let key of key_chain) {
      if (obj == null) throw Error(`[HZEngine] saveable data is null`);
      if (typeof obj !== "object")
        throw Error(`[HZEngine] saveable data is not object`);
      if (Array.isArray(obj)) throw Error(`[HZEngine] saveable data is array`);
      if (!obj[key]) {
        if (auto_correct) {
          obj[key] = {};
        } else throw Error(`[HZEngine] saveable data key ${key} not exist`);
      }
      obj = obj[key];
    }
    if (obj == null) throw Error(`[HZEngine] saveable data result obj is null`);
    // if (typeof obj !== "object")
    // throw Error(`[HZEngine] saveable data result obj is not array or object`);
    // if (Array.isArray(obj)) throw Error(`[HZEngine] saveable data result is an array, key_chain = ${key_chain.join(".")}, res = ${JSON.stringify(obj)}`);
    return obj;
  }

  setSaveableData(
    data: Storage.JSONValue,
    auto_correct: boolean,
    value: Storage.JSONValue,
    ...key_chain: string[]
  ) {
    this._core.debug.log(
      `setSaveableData ${key_chain} => ${JSON.stringify(value)}`
    );

    if (key_chain.length == 0) throw `key_chain is empty`;
    let parentObj = this.getSaveableData(
      data,
      auto_correct,
      ...key_chain.slice(0, -1)
    );

    if (parentObj == null) throw `[HZEngine] saveable data is null`;
    if (typeof parentObj !== "object")
      throw `[HZEngine] saveable data is not object`;
    if (Array.isArray(parentObj)) throw `[HZEngine] saveable data is array`;
    parentObj[key_chain[key_chain.length - 1]] = value;
  }

  checkSaveableData(data: Storage.JSONValue, ...key_chain: string[]) {
    return this.getSaveableData(data, false, ...key_chain);
  }

  // Preload

  preload() {
    if (!this.cacheRoot) {
      throw "cacheRoot is null, please loadProject first";
    }

    // writeFileSync({path: "data://test.json", data: "awa", options: {encoding: "utf8"}});

    if (
      hmFS.statSync({
        path: Path.join(this.cacheRoot, "preloaded.json"),
      })
    ) {
      // 已经预加载过了，退出
      this.preloadedData = JSON.parse(
        hmFS.readFileSync({
          path: Path.join(this.cacheRoot, "preloaded.json"),
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
      animation: {
        profileMap: {},
      },
    };

    this.preloadScript();
    this.preloadImage();
    this.preloadAnimation();

    // console.log(JSON.stringify(this.preloadedData));

    hmFS.writeFileSync({
      path: Path.join(this.cacheRoot, "preloaded.json"),
      data: JSON.stringify(this.preloadedData),
    });

    // console.log(
    //   `${Path.join(this.projectDir, "preloaded.json")} = ${readFileSync({
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
    let scriptDir = Path.join(this.projectRoot!, "script");

    let hzsInfoMap: Record<string, HzsInfo> =
      this.preloadedData.script.hzsInfoMap;
    if (!hmFS.readdirSync({ path: scriptDir }))
      throw "项目文件夹中script文件夹不存在";

    // 遍历所有hzs文件
    traverseScript(scriptDir);
    function traverseScript(path: string) {
      let dirs = hmFS.readdirSync({ path });
      // console.log(dirs);

      for (let dir of dirs!) {
        let subpath = Path.join(path, dir);
        if (isFileSync({ path: subpath })) {
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
      let fd = hmFS.openSync({ path });
      if (fd < 0) throw "Fd<0";
      let size = hmFS.statSync({ path })!.size;
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
    let nameMap: Record<string, [path: string]> =
      this.preloadedData.image.nameMap;
    let imageDir = Path.join(this.projectRoot!, "image");

    if (!hmFS.readdirSync({ path: imageDir }))
      throw "项目文件夹中image文件夹不存在";

    // 遍历所有hzs文件
    traverseImage(imageDir);
    function traverseImage(path: string) {
      let dirs = hmFS.readdirSync({ path });
      // console.log(dirs);

      for (let dir of dirs!) {
        let subpath = Path.join(path, dir);
        if (isFileSync({ path: subpath })) {
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

  /**
   * 預加載動畫profile
   * 遍歷animation文件夾下的所有json文件，以文件名為key，json内容為value
   */
  preloadAnimation() {
    let profileMap: Record<string, [path: string]> =
      this.preloadedData.animation.profileMap;

    let animationDir = Path.join(this.projectRoot!, "animation");
    if (!hmFS.readdirSync({ path: animationDir }))
      throw "项目文件夹中animation文件夹不存在";
    traverseAnimation(animationDir);
    function traverseAnimation(path: string) {
      let dirs = hmFS.readdirSync({ path });
      // console.log(dirs);

      for (let dir of dirs!) {
        let subpath = Path.join(path, dir);
        if (isFileSync({ path: subpath })) {
          // 是文件
          if (dir.endsWith(".json")) {
            preloadAnimation(subpath);
          }
        } else {
          // 是目录
          traverseAnimation(subpath);
        }
      }
    }

    function preloadAnimation(path: string) {
      let raw_name = Path.parse(path).name;
      let name_key = raw_name.trim().replace(/ +/, "_");
      if (profileMap[name_key])
        throw `Animation profile name key conflict [${name_key}], at file [${path}] and [${profileMap[name_key]}]`;
      profileMap[name_key] = [path];
    }
  }
  // Decorator Field
  // _archiveStateSetterRegisteredList: Set<string> = new Set();
  // _archiveStateGetterRegisteredList: Set<string> = new Set();
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

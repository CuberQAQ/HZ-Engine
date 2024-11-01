import { HZEngineCore } from "..";
export declare class Storage {
    private _core;
    constructor(_core: HZEngineCore);
    projectRoot: string | null;
    cacheRoot: string | null;
    saveRoot: string | null;
    preloadedData: NonNullable<any> | null;
    packageData: NonNullable<any> | null;
    loadProject(options: {
        projectPath: string;
        cachePath: string;
        savePath: string;
    }): void;
    loadPackageData(): void;
    /**
     * 全局数据
     * 其中的数据不会跟随存档保存，而是直接存储在全局数据文件中
     * 如：设置、CG解锁情况等
     */
    private _globalData;
    get globalData(): NonNullable<Storage.JSONValue>;
    /**
     * alias globalData
     */
    get gd(): NonNullable<Storage.JSONValue>;
    /**
     * 存档数据
     * 其中的数据会跟随存档保存
     * 如：脚本执行位置即调用栈，攻略度等
     */
    private _archiveData;
    get archiveData(): NonNullable<Storage.JSONValue>;
    /**
     * alias archiveData
     */
    get sd(): NonNullable<Storage.JSONValue>;
    loadGlobalData(): void;
    /**
     * 保存全局数据
     * 可以多次調用，實際上會異步儲存，也就是在一個宏任務中即使調用多次，也只會在宏任務結束後儲存一次
     */
    private _saveGlobalDataTimerId;
    saveGlobalData(): void;
    loadArchiveData(archiveFile?: string): void;
    _saveArchiveDataTimerId: number | null;
    /**
     * 保存存档数据
     * 可以多次調用，實際上會異步儲存，也就是在一個宏任務中即使調用多次，也只會在宏任務結束後儲存一次
     * @param archiveFile 存档文件目錄及名字
     */
    saveArchiveData(archiveFile: string, immediate?: boolean): void;
    getSaveableData(data: Storage.JSONValue, auto_correct: boolean, ...key_chain: string[]): NonNullable<Storage.JSONValue>;
    setSaveableData(data: Storage.JSONValue, auto_correct: boolean, value: Storage.JSONValue, ...key_chain: string[]): void;
    checkSaveableData(data: Storage.JSONValue, ...key_chain: string[]): NonNullable<Storage.JSONValue>;
    preload(): void;
    /**
     * 预加载脚本
     * 遍历出所有hzs文件和所有label，建立map
     */
    preloadScript(): void;
    /**
     * 预加载资源
     * 遍历所有png文件，计算对应的name key，建立map
     */
    preloadImage(): void;
    /**
     * 預加載動畫profile
     * 遍歷animation文件夾下的所有json文件，以文件名為key，json内容為value
     */
    preloadAnimation(): void;
}
export declare type HzsInfo = {
    totalLines: number;
};
export declare namespace Storage {
    export type JSONBaseType = number | string | boolean | null;
    export type JSONValue = JSONBaseType | {
        [key: string]: JSONValue;
    } | JSONValue[];
    export type Saveable<T> = {
        [P in keyof T]: T[P] extends JSONValue ? T[P] : T[P] extends NotAssignableToJson ? never : Saveable<T[P]>;
    } | JSONValue[] | JSONValue;
    type NotAssignableToJson = bigint | symbol | Function;
    export {};
}

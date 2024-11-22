export interface Platform<WidgetFactory = any> {
    name: string;
    getScreenSize(): [width: number, height: number];
    createUILayer({ z_index }: {
        z_index: number;
    }): WidgetFactory;
    deleteUILayer(widgetFactory: WidgetFactory): void;
    isFileSync({ path }: {
        path: string;
    }): boolean;
    readdirSync(option: Platform.readdirSync.Option): Platform.readdirSync.Result;
    statSync(option: Platform.statSync.Option): Platform.statSync.Result;
    readFileSync(option: Platform.readFileSync.Option): Platform.readFileSync.Result;
    writeFileSync(option: Platform.writeFileSync.Option): void;
    getImageInfo(img_path: string): {
        width: number;
        height: number;
    };
    getTime(): number;
    createAudioPlayer(): Platform.AudioPlayer;
    releaseAudioPlayer(audio_player: Platform.AudioPlayer): void;
    setFrameInterval(callback: () => void): void;
}
export declare namespace Platform {
    interface AudioPlayer {
        onPrepared?: (success: boolean) => void | undefined;
        onCompleted?: () => void | undefined;
        prepare(): void;
        start(): void;
        stop(): void;
        release(): void;
        getMediaInfo(): MediaInfo;
        setSource({ path }: {
            path: string;
        }): void;
    }
    interface MediaInfo {
        title: string | undefined;
        artist: string | undefined;
        duration: number;
    }
    namespace readdirSync {
        interface Option {
            /**
             * @zh 目录路径
             * @en Directory path
             */
            path: string;
        }
        /**
         * @zh 如果返回 `undefined` 则目录不存在，否则返回文件名数组
         * @en If `undefined` is returned, the directory does not exist, otherwise an array of filenames is returned
         */
        type Result = Array<string> | undefined;
    }
    namespace statSync {
        interface Option {
            /**
             * @zh 路径
             * @en path
             */
            path: string;
        }
        /**
         * @zh 如果返回 `undefined` 则目标文件不存在，否则返回文件信息对象
         * @en If `undefined` is returned, the target file does not exist, otherwise the file information object is returned
         */
        type Result = FSStat | undefined;
        /**
         * @output
         */
        interface FSStat {
            /**
             * @zh 文件大小（单位为字节）
             * @en The size of the file in bytes
             */
            size: number;
        }
    }
    namespace readFileSync {
        interface Option {
            /**
             * @zh 文件路径
             * @en path
             */
            path: string;
            /**
             * @zh 其他选项
             * @en Other Options
             */
            options?: Options;
        }
        interface Options {
            /**
             * @zh 当指定了编码方式之后，API 返回结果为 `string`
             * @en When the encoding method is specified, the API returns `string` as the result
             */
            encoding?: string;
        }
        /**
         * @zh 文件内容。如果返回 `undefined`，则表明读取文件失败
         * @en File content. If `undefined` is returned, the file failed to be read
         */
        type Result = ArrayBuffer | string | undefined;
    }
    namespace writeFileSync {
        interface Option {
            /**
             * @zh 文件路径或者文件句柄
             * @en File path or file descriptor
             */
            path: string | number;
            /**
             * @zh 写入目标文件的数据
             * @en Data to be written to the target file
             */
            data: ArrayBuffer | string | DataView;
            /**
             * @zh 其他选项
             * @en Other Options
             */
            options?: Options;
        }
        interface Options {
            /**
             * @zh 如果数据格式为 `string`，需要指定编码方式
             * @en If the `data` format is `string`, you need to specify the encoding method
             * @defaultValue utf8
             */
            encoding?: string;
        }
    }
}
export default Platform;

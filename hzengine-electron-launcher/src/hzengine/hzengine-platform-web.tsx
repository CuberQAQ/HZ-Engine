import { HZEngineCore, Platform } from "hzengine-core";
declare const fs: typeof import("node:fs");
declare const isFile: (path: string) => boolean;
const HZEnginePlatformWeb: Platform = {
  name: "",
  getScreenSize: function (): [width: number, height: number] {
    return [window.innerWidth, window.innerHeight];
  },
  createUILayer: function ({ z_index }: { z_index: number }): HTMLDivElement {
    return document.createElement("div");
  },
  deleteUILayer: function (widgetFactory: HTMLDivElement): void {},
  isFileSync: function ({ path }: { path: string }): boolean {
    return isFile(path)
  },
  readdirSync: function (
    option: Platform.readdirSync.Option
  ): string[] | undefined {
    return fs.readdirSync(option.path);
  },
  statSync: function (
    option: Platform.statSync.Option
  ): Platform.statSync.FSStat | undefined {
    try {
      return fs.statSync(option.path);
    } catch {
      return undefined;
    }
  },
  readFileSync: function (
    option: Platform.readFileSync.Option
  ): string | ArrayBuffer | undefined {
    try {
      if (option.options?.encoding) {
        return fs.readFileSync(option.path, {
          encoding: option.options.encoding as BufferEncoding,
        });
      } else return fs.readFileSync(option.path); // TODO
    } catch (e) {
      console.error(e);
    }
    return undefined;
  },
  writeFileSync: function (option: Platform.writeFileSync.Option): void {
    const data =
      option.data instanceof ArrayBuffer
        ? Buffer.from(option.data)
        : option.data;
    if (option.options?.encoding) {
      return fs.writeFileSync(option.path, data, {
        flag: "w+",
        encoding: option.options.encoding as BufferEncoding,
      });
    } else return fs.writeFileSync(option.path, data, {
      flag: "w+",
    });
  },
  getImageInfo: function (img_path: string): {
    width: number;
    height: number;
  } {
    console.warn("[getImageInfo] Function not implemented.");
    return {width: 0, height: 0}
  },
  getTime: function (): number {
    return Date.now();
  },
  createAudioPlayer: function (): Platform.AudioPlayer {
    return {
      prepare: function (): void {
        console.log(`[PlatformWeb] (Not implemented) prepare`);
      },
      start: function (): void {
        console.log(`[PlatformWeb] (Not implemented) start`);
      },
      stop: function (): void {
        console.log(`[PlatformWeb] (Not implemented) stop`);
      },
      release: function (): void {
        console.log(`[PlatformWeb] (Not implemented) release`);
      },
      getMediaInfo: function (): Platform.MediaInfo {
        console.log(`[PlatformWeb] (Not implemented) getMediaInfo`);
        return {
          artist: "",
          title: "",
          duration: 0,
        };
      },
      setSource: function ({ path }: { path: string }): void {
        console.log(`[PlatformWeb] (Not implemented) setSource`);
      },
    };
  },
  releaseAudioPlayer: function (audio_player: Platform.AudioPlayer): void {},
  setFrameInterval: function (callback: () => void): void {
    requestAnimationFrame(callback);
  },
};

export default HZEnginePlatformWeb;

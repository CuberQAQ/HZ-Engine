import { HZEngineCore, Platform } from "hzengine-core";
declare const fs: {
  readFileSync: (path: string, options?: any) => string | ArrayBuffer;
  readdirSync: (path: string) => string[];
  statSync: (path: string) => { isFile: () => boolean; isDirectory: () => boolean; size: number };
  writeFileSync: (path: string, data: any, options?: any) => void;
  existsSync: (path: string) => boolean;
  mkdirSync: (path: string, options?: any) => void;
};
declare const path: {
  join: (...args: string[]) => string;
  dirname: (p: string) => string;
  basename: (p: string) => string;
  resolve: (...args: string[]) => string;
};
declare const isFile: (path: string) => boolean;
declare const ipcRenderer: {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  sendSync: (channel: string, ...args: any[]) => any;
};

const HZEnginePlatformWeb: Platform = {
  name: "ElectronWeb",
  getScreenSize: function (): [width: number, height: number] {
    const root = document.getElementById("hzengine-root");
    if (root) {
      return [root.clientWidth, root.clientHeight];
    }
    return [window.innerWidth, window.innerHeight];
  },
  createUILayer: function ({ z_index }: { z_index: number }): HTMLDivElement {
    const div = document.createElement("div");
    div.style.zIndex = z_index.toString();
    div.style.position = "absolute";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.left = "0";
    div.style.top = "0";
    div.style.pointerEvents = "none";

    const root = document.getElementById("hzengine-root");
    root?.append(div);
    return div;
  },
  deleteUILayer: function (widgetFactory: HTMLDivElement): void {
    widgetFactory.remove();
  },
  isFileSync: function ({ path }: { path: string }): boolean {
    return isFile(path);
  },
  readdirSync: function (
    option: Platform.readdirSync.Option
  ): string[] | undefined {
    try {
      return fs.readdirSync(option.path);
    } catch (e) {
      console.error('readdirSync error:', e);
      return undefined;
    }
  },
  statSync: function (
    option: Platform.statSync.Option
  ): Platform.statSync.FSStat | undefined {
    try {
      const s = fs.statSync(option.path);
      return {
        size: s.size,
        isFile: () => s.isFile(),
        isDirectory: () => s.isDirectory(),
      } as Platform.statSync.FSStat;
    } catch {
      return undefined;
    }
  },
  readFileSync: function (
    option: Platform.readFileSync.Option
  ): string | ArrayBuffer | undefined {
    console.log('[PlatformWeb] readFileSync:', option.path, option.options);
    try {
      let result;
      if (option.options?.encoding) {
        result = fs.readFileSync(option.path, {
          encoding: option.options.encoding,
        });
      } else {
        result = fs.readFileSync(option.path);
      }
      console.log('[PlatformWeb] readFileSync result type:', typeof result, result instanceof ArrayBuffer ? 'ArrayBuffer' : '');
      return result as string | ArrayBuffer;
    } catch (e) {
      console.error('[PlatformWeb] readFileSync error:', e);
    }
    return undefined;
  },
  writeFileSync: function (option: Platform.writeFileSync.Option): void {
    try {
      const dir = path.dirname(option.path as string);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(option.path, option.data, option.options);
    } catch (e) {
      console.error("writeFileSync error:", e);
    }
  },
  getImageInfo: function (img_path: string): {
    width: number;
    height: number;
  } {
    const size = ipcRenderer.sendSync("get-image-size-sync", img_path);
    if (size) {
      return {
        width: size.width,
        height: size.height,
      };
    }
    return { width: 0, height: 0 };
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
    console.log(`[PlatformWeb] setFrameInterval`);
    const cb = () => {
      requestAnimationFrame(cb);
      callback();
    }
    requestAnimationFrame(cb);
  },
};

export default HZEnginePlatformWeb;

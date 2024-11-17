import { Sound, sound } from "@pixi/sound";
import { HZEngineCore, Platform } from "hzengine-core";
import { Application, Assets, Container } from "pixi.js";

const HZEnginePlatformWeb: Platform = {
    name: "",
    getScreenSize: function (): [width: number, height: number] {
      return [window.innerWidth, window.innerHeight];
    },
    createUILayer: function ({ z_index }: { z_index: number }): Container {
      const container = new Container();
      container.zIndex = z_index;
      return container;
    },
    deleteUILayer: function (widgetFactory: Container): void {
      widgetFactory.destroy();
    },
    isFileSync: function ({ path }: { path: string }): boolean {
      
      // Assets.
      throw new Error("Function not implemented.");
    },
    readdirSync: function (
      option: Platform.readdirSync.Option
    ): string[] | undefined {
      throw new Error("Function not implemented.");
    },
    statSync: function (
      option: Platform.statSync.Option
    ): Platform.statSync.FSStat | undefined {
      throw new Error("Function not implemented.");
    },
    readFileSync: function (
      option: Platform.readFileSync.Option
    ): string | ArrayBuffer | undefined {
      throw new Error("Function not implemented.");
    },
    writeFileSync: function (option: Platform.writeFileSync.Option): void {
      throw new Error("Function not implemented.");
    },
    getImageInfo: function (img_path: string): {
      width: number;
      height: number;
    } {
      throw new Error("Function not implemented.");
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
            duration: 0
          }
        },
        setSource: function ({ path }: { path: string }): void {
          console.log(`[PlatformWeb] (Not implemented) setSource`);
        },
      };
    },
    releaseAudioPlayer: function (audio_player: Platform.AudioPlayer): void {
    },
    setFrameInterval: function (callback: () => void): void {
      requestAnimationFrame(callback);
    },
}

export default HZEnginePlatformWeb
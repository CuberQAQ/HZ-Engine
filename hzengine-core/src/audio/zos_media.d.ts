declare module "@zos/media" {
  export function create(id: number): Player;
  export enum id {
    PLAYER,
    RECORDER,
  }
  interface Player {
    // univerval methods
    start(): void;
    stop(): void;
    addEventListener(event: number, callback: (res) => void): void;

    // specific methods
    setSource(source: number, obj: { file: string }): void;
    prepare(): void;
    getDuration(): number;
    getVolume(): number;
    setVolume(vol: number): boolean;
    getTitle(): string | undefined;
    getArtist(): string | undefined;
    getMediaInfo(): MediaInfo;
    release(): void;
    getStatus(): number;
    source: {
      FILE: number;
    };
    event: {
      PREPARE: number;
      COMPLETE: number;
    };
    state: {
      IDLE: number;
      INITIALIZED: number;
      PREPARING: number;
      PREPARED: number;
      STARTED: number;
      PAUSED: number;
      STOPPED: number;
    };
  }
  interface MediaInfo {
    title: string | undefined;
    artist: string | undefined;
    duration: number;
  }
}

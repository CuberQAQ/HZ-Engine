import { HZEngineCore } from "..";

export class Audio {
  constructor(public _core: HZEngineCore) {
    this._channels["default"] = new Audio.Channel();
  }

  // @ArchiveStateAccessor("audio.channels")
  private accessor _channels: Record<string, Audio.Channel> = {};
  get channels() {
    return this._channels;
  }
  createChannel(name: string): Audio.Channel {
    if (this._channels[name]) throw "Channel Already Exist";
    return (this._channels[name] = new Audio.Channel());
  }
}

export namespace Audio {
  export class Channel {
    constructor() {}
    mode: Channel.Mode = Channel.Mode.PlayInOrder;
    status: Channel.Status = Channel.Status.Stopped;
    playbackList: PlaybackItem[] = [];
    push(item: PlaybackItem) {}
    play() {}
    pause() {}
    /**
     * 停止并清空队列
     */
    stop() {}
  }
  export namespace Channel {
    export enum Mode {
      PlayInOrder,
      PlayInOrderRepeat,
      Random,
      RandomRepeat,
    }
    export enum Status {
      Pending,
      Stopped,
      Playing,
      Error,
    }
  }
  export interface PlaybackItem {
    path: string;
  }
}

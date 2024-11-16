// / <reference path="./zos_media.d.ts" />
// import { create, id } from "@zos/media";
import { CustomSave, Save } from "../storage/decorator.js";
import { HZEngineCore } from "../index.js";

import { AudioPlayer } from "../platform/index.js";

export class Audio {
  // static _hmPlayer = create(id.PLAYER);

  constructor(public _core: HZEngineCore) {
    this._channels["audio"] = new Audio.Channel(this);
  }

  @CustomSave(
    "audio.channels",
    function (channels) {
      let res = <Record<string, Audio.Channel.Serialized>>{};
      for (let key in channels) {
        res[key] = channels[key].serialize();
      }
      return res;
    },
    function (serialized) {
      // clear exist channels
      for (let key in this._channels) {
        this._channels[key].stop();
        this._channels[key].onRelease();
      }

      let res = <Record<string, Audio.Channel>>{};
      for (let key in serialized) {
        res[key] = Audio.Channel.deserialize(this, serialized[key]);
      }
      return res;
    }
  )
  private accessor _channels: Record<string, Audio.Channel> = {};
  get channels() {
    return this._channels;
  }

  createChannel(name: string): Audio.Channel {
    // TODO support more audio channels
    if (Object.getOwnPropertyNames(this._channels).length > 0)
      throw "Can't create more than one audio channel on ZeppOS";

    if (this._channels[name]) throw "Channel Already Exist";
    return (this._channels[name] = new Audio.Channel(this));
  }
}

export namespace Audio {
  export class Channel {
    // platform specific

    // universal
    _audioPlayer: AudioPlayer;
    constructor(public _audio: Audio) {
      this._audioPlayer = _audio._core.platform.createAudioPlayer();

      this._audioPlayer.onPrepared = (success: boolean) => {
        this._onPrepared(success);
      };

      this._audioPlayer.onCompleted = () => {
        this._onCompleted();
      };

      // Audio._hmPlayer.addEventListener(Audio._hmPlayer.event.PREPARE, (res) =>
      //   this._onPrepared(res)
      // );
      // Audio._hmPlayer.addEventListener(Audio._hmPlayer.event.COMPLETE, () => {
      //   this._onCompleted();
      // });
    }

    onRelease() {
      this._audioPlayer.release() // TODO
      this._audio._core.platform.releaseAudioPlayer(this._audioPlayer);
    }

    mode: Channel.Mode = Channel.Mode.PlayInOrder;
    status: Channel.Status = Channel.Status.Stopped;
    _playbackList: PlaybackItem[] = [];
    _nowIndex: number | null = null;

    currentInfo: AudioInfo | null = null;

    push(item: PlaybackItem) {
      this._playbackList.push(item);
    }
    play() {
      if (this.status !== Channel.Status.Stopped) return;
      this._playNext();
    }
    pause() {
      if (this.status !== Channel.Status.Playing) return;
      this._audioPlayer.stop();
      this.status = Channel.Status.Stopped;
    }
    /**
     * 停止并清空队列
     */
    stop() {
      if (this.status !== Channel.Status.Playing) return;
      this._audio._core.debug.log("audio channel stop");
      this._audioPlayer.stop();
      this._playbackList = [];
      this.currentInfo = null;
      this._nowIndex = null;
      this.status = Channel.Status.Stopped;
    }

    serialize(): Channel.Serialized {
      return {
        mode: this.mode,
        status: this.status,
        playbackList: this._playbackList,
        nowIndex: this._nowIndex,
      };
    }
    static deserialize(audio: Audio, data: Channel.Serialized): Channel {
      let channel = new Channel(audio);
      channel.mode = data.mode;
      channel.status = data.status;
      channel._playbackList = data.playbackList;
      channel._nowIndex = data.nowIndex;
      if (channel.status === Channel.Status.Playing) channel._playNext();
      return channel;
    }

    _onPrepared(result: boolean) {
      if (result) {
        let mediaInfo = this._audioPlayer.getMediaInfo();
        this.currentInfo = {
          // placeholder
          artist: mediaInfo.artist ?? "未知",
          title: mediaInfo.title ?? "未知",
          duration: mediaInfo.duration,
        };
        console.log("=== prepare succeed ===");
        this._audioPlayer.start();
      } else {
        console.log("=== prepare fail ===");
        this.status = Channel.Status.Error;
        this._audioPlayer.release();
      }
    }

    _onCompleted() {
      // update playback list
      if (this.mode === Channel.Mode.PlayInOrder) {
        this._playbackList.shift();
        if (this._playbackList.length > 0) this._nowIndex = 0;
        else this._nowIndex = null;
      } else if (this.mode === Channel.Mode.PlayInOrderRepeat) {
        if (this._playbackList.length > 0) {
          if (this._nowIndex === null) this._nowIndex = 0;
          this._nowIndex = (this._nowIndex + 1) % this._playbackList.length;
        } else this._nowIndex = null;
      }

      this._playNext();
    }

    /**
     * Play the next item in the playback list. If there are no items in the
     * playback list, set the channel status to Stopped and return.
     * @private
     */
    _playNext() {
      if (this._playbackList.length === 0) {
        this._nowIndex = null;
        this.status = Channel.Status.Stopped;
        return;
      }

      if (this.mode === Channel.Mode.PlayInOrder) {
        if (this._nowIndex === null) this._nowIndex = 0;
        // otherwise onCompleted will set _nowIndex to next index
      } else if (this.mode === Channel.Mode.PlayInOrderRepeat) {
        if (this._nowIndex === null) this._nowIndex = 0;
        // otherwise onCompleted will set _nowIndex to next index
      }

      // Audio._hmPlayer.setSource(Audio._hmPlayer.source.FILE, {
      //   file: this._playbackList[this._nowIndex!].path,
      // });
      this._audioPlayer.setSource({
        path: this._playbackList[this._nowIndex!].path,
      });

      this._audioPlayer.prepare();

      this.status = Channel.Status.Playing;
    }
  }
  export namespace Channel {
    export enum Mode {
      PlayInOrder,
      PlayInOrderRepeat,
    }
    export enum Status {
      Stopped,
      Playing,
      Error,
    }
    export type Serialized = {
      mode: Channel.Mode;
      status: Channel.Status;
      playbackList: PlaybackItem[];
      nowIndex: number | null;
    };
  }
  export interface PlaybackItem {
    path: string;
  }
  export interface AudioInfo {
    duration: number;
    title: string;
    artist: string;
  }
}

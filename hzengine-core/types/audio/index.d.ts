import { HZEngineCore } from "../index.js";
export declare class Audio {
    _core: HZEngineCore;
    static _hmPlayer: import("@zos/media").Player;
    constructor(_core: HZEngineCore);
    private accessor _channels;
    get channels(): Record<string, Audio.Channel>;
    createChannel(name: string): Audio.Channel;
}
export declare namespace Audio {
    class Channel {
        _audio: Audio;
        constructor(_audio: Audio);
        mode: Channel.Mode;
        status: Channel.Status;
        _playbackList: PlaybackItem[];
        _nowIndex: number | null;
        currentInfo: AudioInfo | null;
        push(item: PlaybackItem): void;
        play(): void;
        pause(): void;
        /**
         * 停止并清空队列
         */
        stop(): void;
        serialize(): Channel.Serialized;
        static deserialize(audio: Audio, data: Channel.Serialized): Channel;
        _onPrepared(result: boolean): void;
        _onCompleted(): void;
        /**
         * Play the next item in the playback list. If there are no items in the
         * playback list, set the channel status to Stopped and return.
         * @private
         */
        _playNext(): void;
    }
    namespace Channel {
        enum Mode {
            PlayInOrder = 0,
            PlayInOrderRepeat = 1
        }
        enum Status {
            Stopped = 0,
            Playing = 1,
            Error = 2
        }
        type Serialized = {
            mode: Channel.Mode;
            status: Channel.Status;
            playbackList: PlaybackItem[];
            nowIndex: number | null;
        };
    }
    interface PlaybackItem {
        path: string;
    }
    interface AudioInfo {
        duration: number;
        title: string;
        artist: string;
    }
}

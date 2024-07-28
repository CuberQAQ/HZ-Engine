import { HZEngineCore } from "..";
export declare class Audio {
    _core: HZEngineCore;
    constructor(_core: HZEngineCore);
    private accessor _channels;
    get channels(): Record<string, Audio.Channel>;
    createChannel(name: string): Audio.Channel;
}
export declare namespace Audio {
    class Channel {
        constructor();
        mode: Channel.Mode;
        status: Channel.Status;
        playbackList: PlaybackItem[];
        push(item: PlaybackItem): void;
        play(): void;
        pause(): void;
        /**
         * 停止并清空队列
         */
        stop(): void;
    }
    namespace Channel {
        enum Mode {
            PlayInOrder = 0,
            PlayInOrderRepeat = 1,
            Random = 2,
            RandomRepeat = 3
        }
        enum Status {
            Pending = 0,
            Stopped = 1,
            Playing = 2,
            Error = 3
        }
    }
    interface PlaybackItem {
        path: string;
    }
}

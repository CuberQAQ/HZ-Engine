/**
 * animation.js
 * @description A library for providing multi-track animations in ZeppOS. 一个用于在ZeppOS中提供简单动画的库
 * @date 2024/10/2
 * @author CuberQAQ
 */

export class Animation {
  constructor(
    public profile: AnimationProfile,
    public timer: Timer<any>,
    protected options?: Animation.Options
  ) {
    timer.init(this);
  }

  public onStop: ((animation: Animation) => void) | null = null;

  serialize(): string {
    throw "Unimplemented";
  }
  static unserialize(data: string): Animation {
    throw "Unimplemented";
  }

  timerCb(): void {

  }

  start(): void {

  }

  reverse(): void {

  }

  stop(): void {

  }



}

export namespace Animation {
  export interface Options {}
  export interface Serialized {
    profile: AnimationProfile.Serialized
  }

}


export class AnimationProfile {
  constructor(public trackList: AnimationProfile.TrackList) {
    
  }
  // static from(profileJson: string): AnimationProfile {
  //   throw "Unimplemented";
  // }
  static intersect(profile1: AnimationProfile, profile2: AnimationProfile): AnimationProfile {
    throw "Unimplemented";
  }
}

export namespace AnimationProfile {
  export interface Serialized {
    
  }

  export type TrackList = Track[]
  export type Track = Frame[]
  export type Frame = {
    duration?: number
    delay?: number
    wrapper?: keyof typeof buildInWrappers | Wrapper
    frame: Record<string, FrameItem>
  }
  export type FrameItem = number | boolean | string
}



export interface Timer<TimerIdType> {
  init(animation: Animation): void;
  // 回調時調用animation.timerCallback
  setTimeout(timeout?: number): TimerIdType;
  clearTimeout(timerId: TimerIdType): void;
  setInterval(interval?: number): TimerIdType;
  clearInterval(timerId: TimerIdType): void;
  getTime(): number; // in ms
  setOption?(option: Timer.Options): void;
}

export namespace Timer {
  export interface Options {
    fps?: number;
  }
}

// Map a number from [0, 1] (progress time percentage) to [0, 1] (animation parameter value percentage).
export type Wrapper = (delta: number) => number;

const buildInWrappers = {
  linear: (delta: number) => delta,
  easein: (delta: number) => Math.pow(delta, 3),
  easeout: (delta: number) => 1 - Math.pow(1 - delta, 3),
  easeinout: (delta: number) => {
    if (delta < 0.5) {
      return 0.5 * Math.pow(delta, 3);
    } else {
      return 1 - 0.5 * Math.pow(1 - delta, 3);
    }
  },
}

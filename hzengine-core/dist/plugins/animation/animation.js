"use strict";
/**
 * animation.js
 * @description A library for providing multi-track animations in ZeppOS. 一个用于在ZeppOS中提供简单动画的库
 * @date 2024/10/2
 * @author CuberQAQ
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationProfile = exports.Animation = void 0;
class Animation {
    constructor(profile, timer, options) {
        this.profile = profile;
        this.timer = timer;
        this.options = options;
        this.onStop = null;
        timer.init(this);
    }
    serialize() {
        throw "Unimplemented";
    }
    static unserialize(data) {
        throw "Unimplemented";
    }
    timerCb() {
    }
    start() {
    }
    reverse() {
    }
    stop() {
    }
}
exports.Animation = Animation;
class AnimationProfile {
    constructor(trackList) {
        this.trackList = trackList;
    }
    // static from(profileJson: string): AnimationProfile {
    //   throw "Unimplemented";
    // }
    static intersect(profile1, profile2) {
        throw "Unimplemented";
    }
}
exports.AnimationProfile = AnimationProfile;
const buildInWrappers = {
    linear: (delta) => delta,
    easein: (delta) => Math.pow(delta, 3),
    easeout: (delta) => 1 - Math.pow(1 - delta, 3),
    easeinout: (delta) => {
        if (delta < 0.5) {
            return 0.5 * Math.pow(delta, 3);
        }
        else {
            return 1 - 0.5 * Math.pow(1 - delta, 3);
        }
    },
};

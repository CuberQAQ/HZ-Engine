"use strict";
/**
 * animation.js
 * @description A library for providing multi-track animations in ZeppOS. 一个用于在ZeppOS中提供简单动画的库
 * @date 2024/10/2
 * @author CuberQAQ
 */
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _ActiveTrackNode_currentSection, _ActiveTrackNode_currentIndex, _ActiveTrackNode_currentTrack;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveTrackNode = exports.Profile = exports.Animation = void 0;
class Animation {
    constructor(profile, options) {
        this.profile = profile;
        this.options = options;
        this.initProps = {};
        this.activeRootTrack = null;
        this.lastTime = 0;
        this.onFrame = null;
        this.onEnd = null;
        this.customWrappers = {};
        this.onStop = null;
        this.normalizedProfile = Profile.normalize(profile);
        if (this.options) {
            this.options.initProps && (this.initProps = this.options.initProps);
            this.options.wrappers && (this.customWrappers = this.options.wrappers);
        }
    }
    serialize() {
        throw "Unimplemented";
    }
    static unserialize(data) {
        throw "Unimplemented";
    }
    timerCb() { }
    init() {
        this.activeRootTrack = new ActiveTrackNode(this, {
            accessKeys: [],
            index: 0,
            initProps: this.initProps,
        });
    }
    goto(time) {
        if (time < 0)
            time = 0;
        if (time < this.lastTime) {
            this.init(); // reset the tracknode
            this.activeRootTrack.step(time);
        }
        else if (time > this.lastTime) {
            this.activeRootTrack.step(time - this.lastTime);
        }
        this.lastTime = time;
    }
    calcProps() { }
    reverse() { }
    stop() { }
    _accessProfile(accessKeys) {
        let section = this.normalizedProfile;
        for (let i = 0; i < accessKeys.length; i++) {
            section = section[accessKeys[i]];
        }
        return section;
    }
    _getWrapper(wrapper) {
        var _a, _b;
        if (typeof wrapper === "string") {
            return ((_b = (_a = this.customWrappers[wrapper]) !== null && _a !== void 0 ? _a : buildInWrappers[wrapper]) !== null && _b !== void 0 ? _b : buildInWrappers.none);
        }
        else if (wrapper === undefined) {
            return buildInWrappers.none;
        }
        else
            return wrapper;
    }
    _calcWrappedProps(former_props, props, wrapper, progress) {
        let wrapper_func = this._getWrapper(wrapper);
        let wraped_prog = wrapper_func(progress);
        let res = Object.assign({}, former_props);
        for (let key in props) {
            if (typeof props[key] === "number") {
                res[key] = props[key] + wraped_prog * (props[key] - former_props[key]);
            }
            else if (typeof props[key] === "boolean" ||
                typeof props[key] === "string") {
                res[key] = wraped_prog === 1 ? props[key] : former_props[key];
            }
            else {
                res[key] = props[key];
            }
        }
        return res;
    }
}
exports.Animation = Animation;
var Profile;
(function (Profile) {
    function normalize(profile) {
        if (!Array.isArray(profile)) {
            // section
            return [profile];
        }
        else if (profile.length === 0) {
            // empty track/tracklist
            return [];
        }
        else if (!Array.isArray(profile[0])) {
            // track
            return profile;
        }
        else {
            // tracklist
            return [
                {
                    syncs: profile,
                },
            ];
        }
    }
    Profile.normalize = normalize;
})(Profile || (exports.Profile = Profile = {}));
class ActiveTrackNode {
    get currentSection() {
        if (__classPrivateFieldGet(this, _ActiveTrackNode_currentSection, "f") === null) {
            if (this.currentIndex === null) {
                __classPrivateFieldSet(this, _ActiveTrackNode_currentSection, this.animation._accessProfile(this.accessKeys), "f");
            }
            else {
                __classPrivateFieldSet(this, _ActiveTrackNode_currentSection, this.currentTrack[this.currentIndex], "f");
            }
            __classPrivateFieldSet(this, _ActiveTrackNode_currentIndex, this.currentIndex, "f");
        }
        else if (this.currentIndex !== __classPrivateFieldGet(this, _ActiveTrackNode_currentIndex, "f")) {
            __classPrivateFieldSet(this, _ActiveTrackNode_currentSection, this.currentTrack[this.currentIndex], "f");
            __classPrivateFieldSet(this, _ActiveTrackNode_currentIndex, this.currentIndex, "f");
        }
        return __classPrivateFieldGet(this, _ActiveTrackNode_currentSection, "f");
    }
    get currentTrack() {
        if (__classPrivateFieldGet(this, _ActiveTrackNode_currentTrack, "f") === null && this.currentIndex !== null) {
            __classPrivateFieldSet(this, _ActiveTrackNode_currentTrack, this.animation._accessProfile(this.accessKeys), "f");
        }
        return __classPrivateFieldGet(this, _ActiveTrackNode_currentTrack, "f");
    }
    constructor(animation, { accessKeys, index, initProps, }) {
        this.animation = animation;
        this.repeated = 0;
        this.status = ActiveTrackNode.Status.Playing;
        this.now_time = 0;
        _ActiveTrackNode_currentSection.set(this, null);
        _ActiveTrackNode_currentIndex.set(this, null);
        _ActiveTrackNode_currentTrack.set(this, null);
        this.lastProps = {};
        this.nowProps = {};
        this.activeSyncs = [];
        this.accessKeys = accessKeys;
        this.currentIndex = index;
        this.lastProps = Object.assign({}, initProps);
        this.nowProps = Object.assign({}, initProps);
    }
    /**
     *
     * @param delta_time
     * @returns 剩餘的時間
     */
    step(delta_time) {
        var _a;
        // if (this.status === ActiveTrackNode.Status.Pause) return delta_time;
        // because we should proceed async list
        // normal
        while (true) {
            // constant field: time, wrapper, frame
            if (this.status === ActiveTrackNode.Status.Playing) {
                if (this.currentSection.time === undefined ||
                    this.currentSection.time <= 0) {
                    this.nowProps = Object.assign(Object.assign({}, this.nowProps), this.currentSection.frame);
                }
                else {
                    if (this.now_time + delta_time >= this.currentSection.time) {
                        // this.now_time = this.currentSection.time
                        delta_time -= this.currentSection.time - this.now_time;
                        this.nowProps = Object.assign(Object.assign({}, this.nowProps), this.currentSection.frame);
                    }
                    else {
                        this.now_time += delta_time;
                        // calc
                        let progress = this.now_time / this.currentSection.time;
                        this.nowProps = this.animation._calcWrappedProps(this.lastProps, (_a = this.currentSection.frame) !== null && _a !== void 0 ? _a : {}, this.currentSection.wrapper, progress);
                        break;
                    }
                }
            }
            // instant filed: syncs, asyncs
            // TODO
            // check repeat , finish
            if (this.currentSection.repeat !== undefined) {
                this.repeated++;
                if (this.repeated >= this.currentSection.repeat) {
                    // finish and proceed next section
                    // TODO
                    if (this._switchNextSection())
                        continue;
                    else
                        break;
                }
                else {
                    // continue this section
                    this.now_time = 0;
                    this.nowProps = Object.assign({}, this.lastProps);
                    continue;
                }
            }
            else {
                if (this._switchNextSection())
                    continue;
                else
                    break;
            }
        }
        // waiting syncs
    }
    calcProps() {
        return this.nowProps;
    }
    _switchNextSection() {
        if (this.currentIndex === null ||
            this.currentTrack.length === this.currentIndex + 1) {
            // already reach the end
            this.status = ActiveTrackNode.Status.Pause;
            return false;
        }
        else {
            this.lastProps = Object.assign({}, this.nowProps);
            this.repeated = 0;
            this.now_time = 0;
            this.currentIndex++;
            return true;
        }
    }
    initSyncs() {
    }
    stepSyncs(delta_time) { }
    getSyncsProps() { }
}
exports.ActiveTrackNode = ActiveTrackNode;
_ActiveTrackNode_currentSection = new WeakMap(), _ActiveTrackNode_currentIndex = new WeakMap(), _ActiveTrackNode_currentTrack = new WeakMap();
(function (ActiveTrackNode) {
    let Status;
    (function (Status) {
        Status[Status["Playing"] = 0] = "Playing";
        Status[Status["WaitingSyncs"] = 1] = "WaitingSyncs";
        Status[Status["Pause"] = 2] = "Pause";
    })(Status = ActiveTrackNode.Status || (ActiveTrackNode.Status = {}));
})(ActiveTrackNode || (exports.ActiveTrackNode = ActiveTrackNode = {}));
const buildInWrappers = {
    none: (delta) => (delta < 1 ? 0 : 1),
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

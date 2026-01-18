/**
 * animation.js
 * @description A library for providing multi-track animations for HZEngine. 一个用于在HZEngine中提供简单动画的库
 * @date 2024/10/2
 * @author CuberQAQ
 */
export class Animation {
    normalizedProfile;
    initProps = {};
    activeRootTrack = null;
    lastTime = 0;
    onFrame = null;
    onEnd = null;
    customWrappers = {};
    constructor(profile, options) {
        this.normalizedProfile = Profile.normalize(profile);
        console.log(`Animation: ${JSON.stringify(profile)}`);
        if (options) {
            options.initProps && (this.initProps = options.initProps);
            options.wrappers && (this.customWrappers = options.wrappers);
        }
    }
    onStop = null;
    serialize() {
        return {
            normalizedProfile: this.normalizedProfile,
            initProps: this.initProps,
            activeRootTrack: this.activeRootTrack?.serialize(),
            lastTime: this.lastTime,
        };
    }
    static unserialize(serialized, wrappers) {
        let profile = serialized.normalizedProfile;
        let animation = new Animation(profile, {
            initProps: serialized.initProps,
            wrappers,
        });
        animation.lastTime = serialized.lastTime;
        serialized.activeRootTrack &&
            (animation.activeRootTrack = ActiveTrackNode.unserialize(animation, serialized.activeRootTrack));
        return animation;
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
        if (!this.activeRootTrack) {
            this.init();
        }
        if (time < 0)
            time = 0;
        if (time < this.lastTime) {
            this.init(); // reset the tracknode
            try {
                this.activeRootTrack.step(time);
            }
            catch (e) {
                console.log(e);
                this.activeRootTrack.status = ActiveTrackNode.Status.Pause;
            }
            if (this.activeRootTrack.status === ActiveTrackNode.Status.Pause) {
                if (this.onEnd)
                    this.onEnd();
            }
        }
        else {
            if (this.activeRootTrack.status !== ActiveTrackNode.Status.Pause) {
                try {
                    this.activeRootTrack.step(time - this.lastTime);
                }
                catch (e) {
                    console.log(e);
                    this.activeRootTrack.status = ActiveTrackNode.Status.Pause;
                }
            }
        }
        this.lastTime = time;
        if (this.onFrame) {
            // console.log("on frame", JSON.stringify(this.calcProps()));
            this.onFrame(this.calcProps());
        }
        if (this.activeRootTrack.status === ActiveTrackNode.Status.Pause) {
            if (this.onEnd)
                this.onEnd();
        }
    }
    step(delta_time) {
        this.goto(this.lastTime + delta_time);
    }
    calcProps() {
        return this.activeRootTrack.calcProps();
    }
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
        if (typeof wrapper === "string") {
            return (this.customWrappers[wrapper] ??
                buildInWrappers[wrapper] ??
                buildInWrappers.none);
        }
        else if (wrapper === undefined) {
            return buildInWrappers.none;
        }
        else
            return wrapper;
    }
    _calcWrappedProps(former_props, props, wrapper, progress) {
        let _former_props = { ...former_props };
        let wrapper_func = this._getWrapper(wrapper);
        let wraped_prog = wrapper_func(progress);
        let res = { ..._former_props };
        for (let key in props) {
            if (typeof props[key] === "number") {
                if (_former_props[key] == undefined)
                    _former_props[key] = 0;
                res[key] =
                    _former_props[key] + wraped_prog * (props[key] - _former_props[key]);
            }
            else if (typeof props[key] === "boolean") {
                if (_former_props[key] == undefined)
                    _former_props[key] = false;
                res[key] = wraped_prog === 1 ? props[key] : _former_props[key];
            }
            else if (typeof props[key] === "string") {
                if (_former_props[key] == undefined)
                    _former_props[key] = "";
                res[key] = wraped_prog === 1 ? props[key] : _former_props[key];
            }
            else {
                res[key] = props[key];
            }
        }
        return res;
    }
}
export var Profile;
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
})(Profile || (Profile = {}));
export class ActiveTrackNode {
    animation;
    accessKeys;
    currentIndex;
    repeated = 0;
    status = ActiveTrackNode.Status.Playing;
    now_time = 0;
    #currentSection = null;
    #currentIndex = null;
    get currentSection() {
        if (this.#currentSection === null) {
            if (this.currentIndex === null) {
                this.#currentSection = this.animation._accessProfile(this.accessKeys);
            }
            else {
                this.#currentSection = this.currentTrack[this.currentIndex];
            }
            this.#currentIndex = this.currentIndex;
        }
        else if (this.currentIndex !== this.#currentIndex) {
            this.#currentSection = this.currentTrack[this.currentIndex];
            this.#currentIndex = this.currentIndex;
        }
        return this.#currentSection;
    }
    #currentTrack = null;
    get currentTrack() {
        if (this.#currentTrack === null && this.currentIndex !== null) {
            this.#currentTrack = this.animation._accessProfile(this.accessKeys);
        }
        return this.#currentTrack;
    }
    lastProps = {};
    nowProps = {};
    constructor(animation, { accessKeys, index, initProps, }) {
        this.animation = animation;
        this.accessKeys = accessKeys;
        this.currentIndex = index;
        this.lastProps = { ...initProps };
        this.nowProps = { ...initProps };
    }
    serialize() {
        return {
            accessKeys: this.accessKeys,
            currentIndex: this.currentIndex,
            repeated: this.repeated,
            status: this.status,
            now_time: this.now_time,
            lastProps: this.lastProps,
            nowProps: this.nowProps,
            activeSyncs: this.activeSyncs.map((sync) => sync.serialize()),
        };
    }
    static unserialize(animation, serialized) {
        let node = new ActiveTrackNode(animation, {
            accessKeys: serialized.accessKeys,
            index: serialized.currentIndex,
            initProps: serialized.lastProps,
        });
        node.lastProps = serialized.lastProps;
        node.nowProps = serialized.nowProps;
        node.status = serialized.status;
        node.repeated = serialized.repeated;
        node.now_time = serialized.now_time;
        node.activeSyncs = serialized.activeSyncs.map((sync) => ActiveTrackNode.unserialize(animation, sync));
        return node;
    }
    /**
     *
     * @param delta_time
     * @returns 剩餘的時間
     */
    step(delta_time) {
        // console.log(`node step: ${delta_time}`);
        // if (this.status === ActiveTrackNode.Status.Pause) return delta_time;
        // because we should proceed async list
        // normal
        if (!this.currentSection) {
            this.status = ActiveTrackNode.Status.Pause;
            return delta_time;
        }
        while (true) {
            // constant field: time, wrapper, frame
            // instant filed: syncs, asyncs
            if (this.status === ActiveTrackNode.Status.Playing) {
                if (this.currentSection.time === undefined ||
                    this.currentSection.time <= 0) {
                    this.nowProps = { ...this.nowProps, ...this.currentSection.frame };
                }
                else {
                    if (this.now_time + delta_time >= this.currentSection.time) {
                        // this.now_time = this.currentSection.time
                        delta_time -= this.currentSection.time - this.now_time;
                        this.nowProps = { ...this.nowProps, ...this.currentSection.frame };
                    }
                    else {
                        this.now_time += delta_time;
                        delta_time = 0;
                        // calc
                        let progress = this.now_time / this.currentSection.time;
                        // console.log(`progress: ${progress}`);
                        this.nowProps = this.animation._calcWrappedProps(this.lastProps, this.currentSection.frame ?? {}, this.currentSection.wrapper, progress);
                        break;
                    }
                }
                // sync async
                if (this.currentSection.syncs && this.currentSection.syncs.length > 0) {
                    this.initSyncs();
                    this.status = ActiveTrackNode.Status.WaitingSyncs;
                }
            }
            // step and check sync
            if (this.status === ActiveTrackNode.Status.WaitingSyncs) {
                delta_time = this.stepSyncs(delta_time); // returns lefted time
                this.nowProps = Object.assign(this.nowProps, this.getSyncsProps());
                if (this.checkSyncsFinished()) {
                    this.status = ActiveTrackNode.Status.Playing;
                    this.activeSyncs = [];
                }
                else {
                    // debug
                    if (delta_time !== 0)
                        throw "syncs not finished while lefted time != 0. may be bugs";
                    break;
                }
            }
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
                    this.nowProps = { ...this.lastProps };
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
        return delta_time;
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
            this.lastProps = { ...this.nowProps };
            this.repeated = 0;
            this.now_time = 0;
            this.currentIndex++;
            return true;
        }
    }
    activeSyncs = [];
    initSyncs() {
        // console.log("init syncs");
        let activeSyncs = [];
        // if (this.currentSection.syncs == null) return;
        let subprofile = this.currentSection.syncs;
        let activeTrackNode;
        if (Array.isArray(subprofile)) {
            if (subprofile.length > 0 && Array.isArray(subprofile[0])) {
                // tracklist
                for (let j = 0; j < subprofile.length; ++j) {
                    activeTrackNode = new ActiveTrackNode(this.animation, {
                        accessKeys: [
                            ...this.accessKeys,
                            "" + this.currentIndex,
                            "syncs",
                            "" + j,
                        ],
                        index: 0,
                        initProps: this.nowProps, // TODO 因为 lastProps在切换的时候才会更新，所以用nowProps
                    });
                    activeSyncs.push(activeTrackNode);
                }
            }
            else {
                // Track
                activeTrackNode = new ActiveTrackNode(this.animation, {
                    accessKeys: [...this.accessKeys, "" + this.currentIndex, "syncs"],
                    index: 0,
                    initProps: this.nowProps, // TODO 因为 lastProps在切换的时候才会更新，所以用nowProps
                });
                activeSyncs.push(activeTrackNode);
                console
                    .log();
            }
        }
        else {
            // section
            activeTrackNode = new ActiveTrackNode(this.animation, {
                accessKeys: [...this.accessKeys, "" + this.currentIndex, "syncs"],
                index: null,
                initProps: this.nowProps, // TODO 因为 lastProps在切换的时候才会更新，所以用nowProps
            });
            activeSyncs.push(activeTrackNode);
        }
        // activeTrackNode?.step(0); // TODO
        this.activeSyncs = activeSyncs;
    }
    stepSyncs(delta_time) {
        let lefted_time = delta_time;
        for (let i = 0; i < this.activeSyncs.length; ++i) {
            lefted_time = Math.min(this.activeSyncs[i].step(delta_time), lefted_time);
        }
        return lefted_time;
    }
    checkSyncsFinished() {
        for (let i = 0; i < this.activeSyncs.length; ++i) {
            if (this.activeSyncs[i].status !== ActiveTrackNode.Status.Pause)
                return false;
        }
        return true;
    }
    getSyncsProps() {
        let res = {};
        for (let i = 0; i < this.activeSyncs.length; ++i) {
            Object.assign(res, this.activeSyncs[i].calcProps());
        }
        return res;
    }
}
(function (ActiveTrackNode) {
    let Status;
    (function (Status) {
        Status[Status["Playing"] = 0] = "Playing";
        Status[Status["WaitingSyncs"] = 1] = "WaitingSyncs";
        Status[Status["Pause"] = 2] = "Pause";
    })(Status = ActiveTrackNode.Status || (ActiveTrackNode.Status = {}));
})(ActiveTrackNode || (ActiveTrackNode = {}));
const buildInWrappers = {
    none: (x) => (x < 1 ? 0 : 1),
    linear: (x) => x,
    easeout: (x) => Math.pow(x, 3),
    easein: (x) => 1 - Math.pow(1 - x, 3),
    easeinout: (x) => x < 0.5 ? 0.5 * Math.pow(x, 3) : 1 - 0.5 * Math.pow(1 - x, 3),
};

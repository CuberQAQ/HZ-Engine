export default class HzTimerAdapter {
    static nid = 0;
    static idMap = new Map();
    static listenerRegistered = false;
    /**
     * 创建一个 ZeppTimer 适配器
     * @param {import("hzengine-core").HZEngineCore} core
     * @returns
     */
    constructor(core) {
        return class ZeppTimerLike {
            taskId = null;
            constructor(callback, interval) {
                this.id = nid++;
                this.callback = callback;
                HzTimerAdapter.idMap.set(this.id, this);
                if (!HzTimerAdapter.listenerRegistered) {
                    core.on("zepptimer", function (id) {
                        if (HzTimerAdapter.idMap.has(id)) {
                            HzTimerAdapter.idMap.get(id).callback();
                        }
                    });
                    HzTimerAdapter.listenerRegistered = true;
                }
            }
            start() {
                if (this.taskId)
                    return;
                this.taskId = core.async.addRepeatTask("zepptimer", [this.id], interval);
            }
            stop() {
                if (!this.taskId)
                    return;
                core.async.removeTask(this.taskId);
                this.taskId = null;
            }
        };
    }
}

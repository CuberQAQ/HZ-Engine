class HzTimerAdapter {
    /**
     * 创建一个 ZeppTimer 适配器
     * @param {import("hzengine-core").HZEngineCore} core
     * @returns
     */
    constructor(core) {
        return class ZeppTimerLike {
            constructor(callback, interval) {
                this.taskId = null;
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
HzTimerAdapter.nid = 0;
HzTimerAdapter.idMap = new Map();
HzTimerAdapter.listenerRegistered = false;
export default HzTimerAdapter;

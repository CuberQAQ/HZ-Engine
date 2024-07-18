"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Script = void 0;
class Script {
    constructor(_core) {
        this._core = _core;
        // Route Stack
        this._routeStack = [];
        this._nextRunPosition = null;
        // Middleware
        this._middlewares = [];
    }
    // Label Point Control
    /**
     * 跳转到目标标签
     * @param targetLabel
     */
    jump(targetLabel) {
        let labelData = this._locateLabel(targetLabel);
        this._nextRunPosition = labelData;
    }
    /**
     * 调用目标标签
     * 保存当前执行位置至调用栈，跳转到目标位置，直到return返回
     * @param targetLabel
     */
    call(targetLabel) {
        let labelData = this._locateLabel(targetLabel);
        this._routeStack.push(this._nextRunPosition);
        this._nextRunPosition = labelData;
    }
    return() {
        var _a;
        this._nextRunPosition = (_a = this._routeStack.pop()) !== null && _a !== void 0 ? _a : null;
    }
    _locateLabel(labelName) {
        if (this._core.storage.preloadedData == null)
            throw "Preloaded Data is Null";
        let labelData = this._core.storage.preloadedData.script.labelMap[labelName];
        if (!labelData)
            throw `Label "${labelName} not found"`;
        return labelData;
    }
    use(middleware, add_front = false) {
        if (add_front) {
            this._middlewares.unshift(middleware);
        }
        else {
            this._middlewares.push(middleware);
        }
    }
    _processCmd(cmd) {
        let ctx = this._buildContext(cmd);
        if (this._middlewares.length === 0)
            return;
        let i = 0, len = this._middlewares.length;
        let nextFunc = () => {
            i++;
            if (i >= len)
                return;
            this._middlewares[i](ctx, nextFunc);
        };
        this._middlewares[0](ctx, nextFunc);
    }
    _buildContext(cmd) {
        return {
            rawtext: cmd,
        };
    }
}
exports.Script = Script;

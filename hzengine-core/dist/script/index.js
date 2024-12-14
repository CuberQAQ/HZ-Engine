var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { mergeObjs2Str as joinObjs2Str, parseInterpolatedStr, removeComment, splitStr2Objs, } from "./strtools.js";
import { readline } from "./readscript.js";
import { Save } from "../storage/decorator.js";
let Script = (() => {
    let __callStack_decorators;
    let __callStack_initializers = [];
    let __callStack_extraInitializers = [];
    let __statementStack_decorators;
    let __statementStack_initializers = [];
    let __statementStack_extraInitializers = [];
    let __nextRunPosition_decorators;
    let __nextRunPosition_initializers = [];
    let __nextRunPosition_extraInitializers = [];
    return class Script {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __callStack_decorators = [Save("script.callStack")];
            __statementStack_decorators = [Save("script.statementStack")];
            __nextRunPosition_decorators = [Save("script.nextRunPosition")];
            __esDecorate(this, null, __callStack_decorators, { kind: "accessor", name: "_callStack", static: false, private: false, access: { has: obj => "_callStack" in obj, get: obj => obj._callStack, set: (obj, value) => { obj._callStack = value; } }, metadata: _metadata }, __callStack_initializers, __callStack_extraInitializers);
            __esDecorate(this, null, __statementStack_decorators, { kind: "accessor", name: "_statementStack", static: false, private: false, access: { has: obj => "_statementStack" in obj, get: obj => obj._statementStack, set: (obj, value) => { obj._statementStack = value; } }, metadata: _metadata }, __statementStack_initializers, __statementStack_extraInitializers);
            __esDecorate(this, null, __nextRunPosition_decorators, { kind: "accessor", name: "_nextRunPosition", static: false, private: false, access: { has: obj => "_nextRunPosition" in obj, get: obj => obj._nextRunPosition, set: (obj, value) => { obj._nextRunPosition = value; } }, metadata: _metadata }, __nextRunPosition_initializers, __nextRunPosition_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _core;
        constructor(_core) {
            this._core = _core;
        }
        #_callStack_accessor_storage = __runInitializers(this, __callStack_initializers, []);
        /**
         * 调用栈
         * 在call时保存当前执行位置和语句栈，在return时恢复执行位置和语句栈
         */
        get _callStack() { return this.#_callStack_accessor_storage; }
        set _callStack(value) { this.#_callStack_accessor_storage = value; }
        #_statementStack_accessor_storage = (__runInitializers(this, __callStack_extraInitializers), __runInitializers(this, __statementStack_initializers, []));
        /**
         * 语句栈
         * 比如while, if，会在语句开始时入栈，语句结束时出栈
         */
        get _statementStack() { return this.#_statementStack_accessor_storage; }
        set _statementStack(value) { this.#_statementStack_accessor_storage = value; }
        #_nextRunPosition_accessor_storage = (__runInitializers(this, __statementStack_extraInitializers), __runInitializers(this, __nextRunPosition_initializers, null));
        /**
         * 下一次执行的脚本位置
         * 注意：存储该值的时候应总是拷贝赋值而非直接引用赋值
         */
        get _nextRunPosition() { return this.#_nextRunPosition_accessor_storage; }
        set _nextRunPosition(value) { this.#_nextRunPosition_accessor_storage = value; }
        // Script Run
        /**
         * 执行_nextRunPosition，并返回下一行_nextRunPosition是否不为null
         */
        runSingleLine() {
            if (!this._nextRunPosition) {
                // 文件尾隐式执行 return
                this.return();
                return false;
            }
            let nowRunPosition = [
                ...this._nextRunPosition,
            ];
            this.incrementNextPosition();
            let rawCommand = readline(this._core, nowRunPosition[0], nowRunPosition[1]);
            // remove comment
            rawCommand = removeComment(rawCommand);
            if (rawCommand.trim().length && !rawCommand.trim().startsWith("#")) {
                if (rawCommand.trim().startsWith("*")) {
                    if (this._statementStack.length) {
                        throw `label between statement is not allowed, at file [${nowRunPosition[0]}] line [${nowRunPosition[1]}]`;
                    }
                }
                else {
                    this._core.debug.log("Run cmd: " + rawCommand);
                    // Process Command
                    this._processCmd(rawCommand, [...nowRunPosition]);
                }
            }
            return !!this._nextRunPosition;
        }
        // Label Point Control
        /**
         * 跳转到目标标签
         * @param targetLabel
         */
        jumpLabel(targetLabel) {
            let labelPosition = this._locateLabel(targetLabel);
            this._nextRunPosition = labelPosition;
            this._statementStack = [];
        }
        jump(path, index, clearStatementStack = false) {
            this._nextRunPosition = [path, index];
            if (clearStatementStack) {
                this._statementStack = [];
            }
        }
        /**
         * 调用目标标签
         * 保存当前执行位置至调用栈，跳转到目标位置，直到return返回
         * @param targetLabel
         */
        callLabel(targetLabel) {
            // console.log(
            //   `pending to call label ${targetLabel}, stack=${JSON.stringify(
            //     this._routeStack
            //   )}`
            // );
            let labelPosition = this._locateLabel(targetLabel);
            this._callStack.push({
                position: this._nextRunPosition ? [...this._nextRunPosition] : null,
                statementStack: this._statementStack,
            });
            this._nextRunPosition = labelPosition;
            this._statementStack = [];
            // console.log(
            //   `finished call label ${targetLabel}, stack=${JSON.stringify(
            //     this._routeStack
            //   )}`
            // );
        }
        hasLabel(targetLabel) {
            return (this._core.storage.preloadedData?.script?.labelMap?.[targetLabel] != null);
        }
        return() {
            // console.log(`pending to return, stack=${JSON.stringify(this._routeStack)}`);
            let stackItem = this._callStack.pop();
            if (stackItem) {
                this._statementStack = stackItem.statementStack;
                this._nextRunPosition = stackItem.position;
            }
            else {
                this._nextRunPosition = null;
                this._statementStack = [];
                // Game End
                this._core.end();
            }
            // console.log(`finished return, stack=${JSON.stringify(this._routeStack)}`);
        }
        clear() {
            this._nextRunPosition = null;
            this._callStack = [];
        }
        _locateLabel(labelName) {
            if (this._core.storage.preloadedData == null)
                throw "Preloaded Data is Null";
            if (!this._core.storage.preloadedData.script.labelMap[labelName])
                throw `Error: Label [${labelName}] not found`;
            let labelData = [
                ...this._core.storage.preloadedData.script.labelMap[labelName],
            ];
            return labelData;
        }
        incrementNextPosition() {
            if (this._core.storage.preloadedData == null)
                throw "Preloaded Data is Null";
            if (!this._nextRunPosition)
                throw "_nextRunPosition is null";
            // console.log(`hzsInfoMap=${JSON.stringify(this._core.storage.preloadedData.script.hzsInfoMap)}`);
            let hzsInfo = this._core.storage.preloadedData.script.hzsInfoMap[this._nextRunPosition[0]];
            if (!hzsInfo)
                throw `Preloaded hzsInfo of path(${this._nextRunPosition[0]}) not found`;
            this._nextRunPosition[1]++;
            if (this._nextRunPosition[1] >= hzsInfo.totalLines)
                this._nextRunPosition = null;
        }
        // Middleware
        _middlewares = (__runInitializers(this, __nextRunPosition_extraInitializers), []);
        use(middleware, add_front = false) {
            if (add_front) {
                this._middlewares.unshift(middleware);
            }
            else {
                this._middlewares.push(middleware);
            }
        }
        _processCmd(cmd, nowRunPosition) {
            let ctx = this._buildContext(cmd, nowRunPosition);
            if (this._middlewares.length === 0) {
                this._processUnsolvedCmd(cmd);
                return;
            }
            let i = 0, len = this._middlewares.length;
            let nextFunc = () => {
                i++;
                if (i >= len) {
                    this._processUnsolvedCmd(cmd);
                    return;
                }
                this._middlewares[i](ctx, nextFunc);
            };
            this._middlewares[0](ctx, nextFunc);
        }
        _processUnsolvedCmd(cmd) {
            if (cmd.trim().length === 0)
                return; // Empty Line
            else if (cmd.trim().startsWith("*"))
                return; // Label Command
            else {
                throw `Can not parse command: ${cmd}`;
            }
        }
        _buildContext(cmd, nowRunPosition) {
            return new Script.Context(this._core, cmd, nowRunPosition[0], nowRunPosition[1], this._statementStack);
        }
        // Statement Analyse
        _statementAnalyseStack = [];
        _analyseStatementMiddlewares = [];
        _buildAnalyseStatementContext(cmd, nowRunPosition) {
            return new Script.ContextForAnalyseStatement(this._core, cmd, nowRunPosition[0], nowRunPosition[1], this._statementAnalyseStack);
        }
        useAnalyseStatement(middleware, add_front) {
            if (add_front) {
                this._analyseStatementMiddlewares.unshift(middleware);
            }
            else {
                this._analyseStatementMiddlewares.push(middleware);
            }
        }
        /**
         * 分析statement
         *
         * Analyze the statement syntax and record the script point location and related information in advance.
         * When the script executes a statement, the regular middleware corresponding to that statement will load
         * the information saved by analyseStatement before the statement, and if there is no analysis, it will call
         * analyseStatement to analyze, and the corresponding analysis middleware will process and save the information.
         * After analysis is complete, reset _nextRunPosition to the location before the call, switch back to the normal mode,
         * and continue executing.
         */
        analyseStatement(ctx) {
            // this._core.debug.log("[HZEngine] Start statement analyse mode");
            // Backup _nextRunPosition
            let _nextRunPositionBackup = this
                ._nextRunPosition
                ? [...this._nextRunPosition]
                : null;
            let covered = false;
            // Set _nextRunPosition to the current position of the statement
            this._nextRunPosition = [ctx.currentPath, ctx.currentLineIndex];
            while (this._nextRunPosition) {
                let rawCommand = readline(this._core, this._nextRunPosition[0], this._nextRunPosition[1]);
                if (rawCommand == null)
                    throw `Readline Error(got ${rawCommand}), at file [${this._nextRunPosition[0]}] line [${this._nextRunPosition[1] + 1}]`;
                // If the command is not empty and not a comment
                if (rawCommand.trim().length && !rawCommand.trim().startsWith("#")) {
                    // If it is a label command, check if the statement stack is empty
                    if (rawCommand.trim().startsWith("*")) {
                        if (this._statementStack.length) {
                            throw `label between statement is not allowed, at file [${this._nextRunPosition[0]}] line [${this._nextRunPosition[1] + 1}]`;
                        }
                    }
                    else {
                        // Build context for analyzing statement
                        let sub_ctx = this._buildAnalyseStatementContext(rawCommand, [
                            ...this._nextRunPosition,
                        ]);
                        // console.log(`[HZEngine] analyse statement command [${rawCommand}]`);
                        // Process command
                        if (this._analyseStatementMiddlewares.length === 0) {
                            // TODO do nothing
                        }
                        else {
                            let i = 0, len = this._analyseStatementMiddlewares.length;
                            let nextFunc = () => {
                                i++;
                                if (i >= len) {
                                    // TODO do nothing
                                }
                                else {
                                    this._analyseStatementMiddlewares[i](sub_ctx, nextFunc);
                                }
                            };
                            this._analyseStatementMiddlewares[0](sub_ctx, nextFunc);
                        }
                    }
                }
                // Move to the next line
                this.incrementNextPosition();
                if (covered) {
                    if (this._statementAnalyseStack.length === 0) {
                        break;
                    }
                }
                else {
                    if (this._statementAnalyseStack.length > 0) {
                        covered = true;
                    }
                }
            }
            this._nextRunPosition = _nextRunPositionBackup;
            // Check if the statement stack is empty
            if (this._statementAnalyseStack.length > 0) {
                throw `statement not closed, at file [${this._statementAnalyseStack[this._statementAnalyseStack.length - 1][1][0]}] line [${this._statementAnalyseStack[this._statementAnalyseStack.length - 1][1][1] + 1}]`;
            }
            // Reset _nextRunPosition to the backup value, and switch back to normal mode, and continue executing
            // this._core.debug.logconsole.log("[HZEngine] Finished analyse statement mode ");
        }
        // eval
        evalScope(code) {
            try {
                return new Function("sd", "gd", "hz", `${code}`)(this._core.storage.sd, this._core.storage.gd, this._core);
            }
            catch (e) {
                this._core.debug.log(`Error in evalScope: ${e}`);
            }
        }
        evalExpression(code) {
            this._core.debug.log(`evalExpression: ${code}`);
            try {
                return new Function("sd", "gd", "hz", `return (${code})`)(this._core.storage.sd, this._core.storage.gd, this._core);
            }
            catch (e) {
                this._core.debug.log(`Error in evalExpression: ${e}`);
            }
        }
        // parse string
        parseString(str) {
            let parsedInterpolated = parseInterpolatedStr(str);
            let res = "";
            for (let item of parsedInterpolated) {
                if (item.isExpression) {
                    res += this.evalExpression(item.str);
                }
                else {
                    res += item.str;
                }
            }
            return res;
        }
    };
})();
export { Script };
(function (Script) {
    class Context {
        _core;
        _rawtext;
        currentPath;
        currentLineIndex;
        _statementStack;
        constructor(_core, _rawtext, currentPath, currentLineIndex, _statementStack) {
            this._core = _core;
            this._rawtext = _rawtext;
            this.currentPath = currentPath;
            this.currentLineIndex = currentLineIndex;
            this._statementStack = _statementStack;
        }
        get rawtext() {
            return this._rawtext;
        }
        set rawtext(rawtext) {
            this._rawtext = rawtext;
            this._rawtextChanged = true;
        }
        _rawtextChanged = false;
        _slicedArgs = null;
        get slicedArgs() {
            if (!this._slicedArgs || this._rawtextChanged)
                this._slicedArgs = splitStr2Objs(this.rawtext);
            this._rawtextChanged = false;
            return this._slicedArgs;
        }
        // 注意只有在修改在触发slicedArgs的时候才会更新rawtext
        set slicedArgs(slicedArgs) {
            this._slicedArgs = JSON.parse(JSON.stringify(slicedArgs)); // TODO 深拷贝 性能
            this._rawtext = joinObjs2Str(slicedArgs);
            // TODO this._rawtextChanged = true ???
        }
        /**
         * 開始一個新的Statement，返回該Statement的數據
         * Start a new statement and return the data of the new statement
         * @param identifier the identifier of the statement
         * @returns the data of the new statement
         */
        startStatement(identifier, data) {
            let statement_data = data ?? this.getStatementData();
            let statementStackItem = [
                identifier,
                [this.currentPath, this.currentLineIndex],
                statement_data,
            ];
            this._statementStack.push(statementStackItem);
            return statement_data;
        }
        endStatement(identifier) {
            if (this._statementStack.length === 0)
                throw `statement not open, at file [${this.currentPath}] line [${this.currentLineIndex + 1}]`;
            if (this._statementStack[this._statementStack.length - 1][0] !== identifier)
                throw `the last statement in the stack is not ${identifier}, at file [${this.currentPath}] line [${this.currentLineIndex + 1}]`;
            return this._statementStack.pop()[2];
        }
        get statementStack() {
            return this._statementStack;
        }
        // statement data will stored in core.storage.globalData.script.statement_data
        // the key of the statement data is the line index of the start statement,
        // for example: the key of the statement data of "menu ... end menu"
        // is stored in the key of the line index of the "menu" statement
        getStatementData() {
            let statement_data_in_file = this._core.storage.getSaveableData(this._core.storage.globalData, true, "script", "statement_data", this.currentPath);
            if (!statement_data_in_file["" + this.currentLineIndex]) {
                this._core.script.analyseStatement(this);
                statement_data_in_file = this._core.storage.getSaveableData(this._core.storage.globalData, true, "script", "statement_data", this.currentPath);
                if (!statement_data_in_file[this.currentLineIndex])
                    throw `analyse statement failed as statement data not found, at file [${this.currentPath}] line [${this.currentLineIndex + 1}]`;
            }
            return statement_data_in_file[this.currentLineIndex];
        }
        setStatementData(statement_data, start_position) {
            let statement_data_in_file = this._core.storage.getSaveableData(this._core.storage.globalData, true, "script", "statement_data", start_position[0]);
            statement_data_in_file["" + start_position[1]] = statement_data;
            this._core.storage.saveGlobalData();
        }
    }
    Script.Context = Context;
    let Utils;
    (function (Utils) {
        Utils.joinSlicedArgs = joinObjs2Str;
        Utils.splitRawtext = splitStr2Objs;
        function splitCommas(rawtext) {
            let slicedArgs = splitStr2Objs(rawtext);
            // console.log(`splitCommas rawtext: ${rawtext}, slicedArgs: ${JSON.stringify(slicedArgs)}`);
            let res = [];
            for (let i = 0; i < slicedArgs.length; i++) {
                if (slicedArgs[i].isQuoted)
                    res.push(`"${slicedArgs[i].str}"`);
                else if (slicedArgs[i].isSquared)
                    res.push(`[${slicedArgs[i].str}]`);
                else if (slicedArgs[i].isRounded)
                    res.push(`(${slicedArgs[i].str})`);
                else {
                    slicedArgs[i].str.split(",").forEach((str) => {
                        str = str.trim();
                        if (str)
                            res.push(str);
                    });
                }
            }
            // console.log(`splitCommas res: ${JSON.stringify(res)}`);
            return res;
        }
        Utils.splitCommas = splitCommas;
        function parseTuple(rawtext) {
            if (rawtext.length < 2 ||
                rawtext[0] !== "(" ||
                rawtext[rawtext.length - 1] !== ")") {
                throw `invalid tuple: ${rawtext}`;
            }
            rawtext = rawtext.slice(1, rawtext.length - 1);
            // console.log(`parseTuple rawtext: ${rawtext}`);
            return parseHzsArgs(rawtext);
        }
        Utils.parseTuple = parseTuple;
        function parseArray(rawtext) {
            if (rawtext.length < 2 ||
                rawtext[0] !== "[" ||
                rawtext[rawtext.length - 1] !== "]") {
                throw `invalid array: ${rawtext}`;
            }
            rawtext = rawtext.slice(1, rawtext.length - 1);
            return parseHzsArgs(rawtext);
        }
        Utils.parseArray = parseArray;
        function parseHzsArgs(rawtext) {
            rawtext = rawtext.trim();
            let arr = splitCommas(rawtext);
            let res = arr.map((str) => {
                if (str.startsWith("("))
                    return parseTuple(str);
                else if (str.startsWith("["))
                    return parseArray(str);
                else
                    return str;
            });
            // console.log(`parseHzsArgs from: "${rawtext}" ; res: ${JSON.stringify(res)}`);
            return res;
        }
        Utils.parseHzsArgs = parseHzsArgs;
    })(Utils = Script.Utils || (Script.Utils = {}));
    class ContextForAnalyseStatement extends Context {
        startStatement(identifier, data = {}) {
            return super.startStatement(identifier, data ?? {});
        }
        endStatement(identifier) {
            let statement_data = super.endStatement(identifier);
            // save analysed statement data
            let statement_data_in_file = this._core.storage.getSaveableData(this._core.storage.globalData, true, "script", "statement_data", this.currentPath);
            statement_data_in_file["" + this.currentLineIndex] = statement_data;
            this._core.storage.saveGlobalData();
            return statement_data;
        }
    }
    Script.ContextForAnalyseStatement = ContextForAnalyseStatement;
})(Script || (Script = {}));

"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Script = void 0;
const strtools_1 = require("./strtools");
const readscript_1 = require("./readscript");
const decorator_1 = require("../storage/decorator");
let Script = (() => {
    var _a, _Script__callStack_accessor_storage, _Script__statementStack_accessor_storage, _Script__nextRunPosition_accessor_storage;
    let _instanceExtraInitializers = [];
    let __callStack_decorators;
    let __callStack_initializers = [];
    let __statementStack_decorators;
    let __statementStack_initializers = [];
    let __nextRunPosition_decorators;
    let __nextRunPosition_initializers = [];
    return _a = class Script {
            constructor(_core) {
                this._core = (__runInitializers(this, _instanceExtraInitializers), _core);
                _Script__callStack_accessor_storage.set(this, __runInitializers(this, __callStack_initializers, []));
                _Script__statementStack_accessor_storage.set(this, __runInitializers(this, __statementStack_initializers, []));
                _Script__nextRunPosition_accessor_storage.set(this, __runInitializers(this, __nextRunPosition_initializers, null));
                // Middleware
                this._middlewares = [];
                // Statement Analyse
                this._statementAnalyseStack = [];
                this._analyseStatementMiddlewares = [];
            }
            /**
             * 调用栈
             * 在call时保存当前执行位置和语句栈，在return时恢复执行位置和语句栈
             */
            get _callStack() { return __classPrivateFieldGet(this, _Script__callStack_accessor_storage, "f"); }
            set _callStack(value) { __classPrivateFieldSet(this, _Script__callStack_accessor_storage, value, "f"); }
            /**
             * 语句栈
             * 比如while, if，会在语句开始时入栈，语句结束时出栈
             */
            get _statementStack() { return __classPrivateFieldGet(this, _Script__statementStack_accessor_storage, "f"); }
            set _statementStack(value) { __classPrivateFieldSet(this, _Script__statementStack_accessor_storage, value, "f"); }
            /**
             * 下一次执行的脚本位置
             * 注意：存储该值的时候应总是拷贝赋值而非直接引用赋值
             */
            get _nextRunPosition() { return __classPrivateFieldGet(this, _Script__nextRunPosition_accessor_storage, "f"); }
            set _nextRunPosition(value) { __classPrivateFieldSet(this, _Script__nextRunPosition_accessor_storage, value, "f"); }
            // Script Run
            /**
             * 执行_nextRunPosition，并返回下一行_nextRunPosition是否不为null
             */
            runSingleLine() {
                if (!this._nextRunPosition)
                    throw "Run but _nextPosition is null";
                let nowRunPosition = [
                    ...this._nextRunPosition,
                ];
                this.incrementNextPosition();
                let rawCommand = (0, readscript_1.readline)(nowRunPosition[0], nowRunPosition[1]);
                if (rawCommand.trim().length && !rawCommand.trim().startsWith("#")) {
                    if (rawCommand.trim().startsWith("*")) {
                        if (this._statementStack.length) {
                            throw `label between statement is not allowed, at file [${nowRunPosition[0]}] line [${nowRunPosition[1]}]`;
                        }
                    }
                    else {
                        console.log("Run cmd: " + rawCommand);
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
                return new _a.Context(this._core, cmd, nowRunPosition[0], nowRunPosition[1], this._statementStack);
            }
            _buildAnalyseStatementContext(cmd, nowRunPosition) {
                return new _a.ContextForAnalyseStatement(this._core, cmd, nowRunPosition[0], nowRunPosition[1], this._statementAnalyseStack);
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
                console.log("[HZEngine] Start statement analyse mode");
                // Backup _nextRunPosition
                let _nextRunPositionBackup = this
                    ._nextRunPosition
                    ? [...this._nextRunPosition]
                    : null;
                // Set _nextRunPosition to the current position of the statement
                this._nextRunPosition = [ctx.currentPath, ctx.currentLineIndex];
                while (this._nextRunPosition) {
                    let rawCommand = (0, readscript_1.readline)(this._nextRunPosition[0], this._nextRunPosition[1]);
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
                }
                this._nextRunPosition = _nextRunPositionBackup;
                // Check if the statement stack is empty
                if (this._statementAnalyseStack.length > 0) {
                    throw `statement not closed, at file [${this._statementAnalyseStack[this._statementAnalyseStack.length - 1][1][0]}] line [${this._statementAnalyseStack[this._statementAnalyseStack.length - 1][1][1] + 1}]`;
                }
                // Reset _nextRunPosition to the backup value, and switch back to normal mode, and continue executing
                console.log("[HZEngine] Finished analyse statement mode ");
            }
            // eval
            evalScope(code) {
                try {
                    return new Function("sd", "gd", `${code}`)(this._core.storage.sd, this._core.storage.gd);
                }
                catch (e) {
                    console.log(`Error in evalScope: ${e}`);
                }
            }
            evalExpression(code) {
                console.log(`[HZEngine] evalExpression: ${code}`);
                try {
                    return new Function("sd", "gd", `return (${code})`)(this._core.storage.sd, this._core.storage.gd);
                }
                catch (e) {
                    console.log(`Error in evalExpression: ${e}`);
                }
            }
            // parse string
            parseString(str) {
                let parsedInterpolated = (0, strtools_1.parseInterpolatedStr)(str);
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
        },
        _Script__callStack_accessor_storage = new WeakMap(),
        _Script__statementStack_accessor_storage = new WeakMap(),
        _Script__nextRunPosition_accessor_storage = new WeakMap(),
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __callStack_decorators = [(0, decorator_1.ArchiveStateAccessor)("script.callStack")];
            __statementStack_decorators = [(0, decorator_1.ArchiveStateAccessor)("script.statementStack")];
            __nextRunPosition_decorators = [(0, decorator_1.ArchiveStateAccessor)("script.nextRunPosition")];
            __esDecorate(_a, null, __callStack_decorators, { kind: "accessor", name: "_callStack", static: false, private: false, access: { has: obj => "_callStack" in obj, get: obj => obj._callStack, set: (obj, value) => { obj._callStack = value; } }, metadata: _metadata }, __callStack_initializers, _instanceExtraInitializers);
            __esDecorate(_a, null, __statementStack_decorators, { kind: "accessor", name: "_statementStack", static: false, private: false, access: { has: obj => "_statementStack" in obj, get: obj => obj._statementStack, set: (obj, value) => { obj._statementStack = value; } }, metadata: _metadata }, __statementStack_initializers, _instanceExtraInitializers);
            __esDecorate(_a, null, __nextRunPosition_decorators, { kind: "accessor", name: "_nextRunPosition", static: false, private: false, access: { has: obj => "_nextRunPosition" in obj, get: obj => obj._nextRunPosition, set: (obj, value) => { obj._nextRunPosition = value; } }, metadata: _metadata }, __nextRunPosition_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.Script = Script;
(function (Script) {
    class Context {
        constructor(_core, _rawtext, currentPath, currentLineIndex, _statementStack) {
            this._core = _core;
            this._rawtext = _rawtext;
            this.currentPath = currentPath;
            this.currentLineIndex = currentLineIndex;
            this._statementStack = _statementStack;
            this._rawtextChanged = false;
            this._slicedArgs = null;
        }
        get rawtext() {
            return this._rawtext;
        }
        set rawtext(rawtext) {
            this._rawtext = rawtext;
            this._rawtextChanged = true;
        }
        get slicedArgs() {
            if (!this._slicedArgs || this._rawtextChanged)
                this._slicedArgs = (0, strtools_1.splitStr2Objs)(this.rawtext);
            this._rawtextChanged = false;
            return this._slicedArgs;
        }
        /**
         * 開始一個新的Statement，返回該Statement的數據
         * Start a new statement and return the data of the new statement
         * @param identifier the identifier of the statement
         * @returns the data of the new statement
         */
        startStatement(identifier, data) {
            let statement_data = data !== null && data !== void 0 ? data : this.getStatementData();
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
    class ContextForAnalyseStatement extends Context {
        startStatement(identifier, data = {}) {
            return super.startStatement(identifier, data !== null && data !== void 0 ? data : {});
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
})(Script || (exports.Script = Script = {}));

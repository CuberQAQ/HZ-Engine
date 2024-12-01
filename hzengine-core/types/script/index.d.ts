import { HZEngineCore } from "../index.js";
import { Storage } from "../storage/index.js";
import { mergeObjs2Str as joinObjs2Str, splitStr2Objs } from "./strtools.js";
export declare class Script {
    _core: HZEngineCore;
    constructor(_core: HZEngineCore);
    /**
     * 调用栈
     * 在call时保存当前执行位置和语句栈，在return时恢复执行位置和语句栈
     */
    private accessor _callStack;
    /**
     * 语句栈
     * 比如while, if，会在语句开始时入栈，语句结束时出栈
     */
    private accessor _statementStack;
    /**
     * 下一次执行的脚本位置
     * 注意：存储该值的时候应总是拷贝赋值而非直接引用赋值
     */
    private accessor _nextRunPosition;
    /**
     * 执行_nextRunPosition，并返回下一行_nextRunPosition是否不为null
     */
    runSingleLine(): boolean;
    /**
     * 跳转到目标标签
     * @param targetLabel
     */
    jumpLabel(targetLabel: string): void;
    jump(path: string, index: number, clearStatementStack?: boolean): void;
    /**
     * 调用目标标签
     * 保存当前执行位置至调用栈，跳转到目标位置，直到return返回
     * @param targetLabel
     */
    callLabel(targetLabel: string): void;
    hasLabel(targetLabel: string): boolean;
    return(): void;
    clear(): void;
    private _locateLabel;
    incrementNextPosition(): void;
    private _middlewares;
    use(middleware: Script.Middleware, add_front?: boolean): void;
    private _processCmd;
    private _processUnsolvedCmd;
    private _buildContext;
    private _statementAnalyseStack;
    private _analyseStatementMiddlewares;
    private _buildAnalyseStatementContext;
    useAnalyseStatement(middleware: Script.MiddlewareForAnalyseStatement, add_front?: boolean): void;
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
    analyseStatement(ctx: Script.Context): void;
    evalScope(code: string): any;
    evalExpression(code: string): any;
    parseString(str: string): string;
}
export declare namespace Script {
    type Middleware = (ctx: Context, next: () => void) => void;
    class Context {
        protected _core: HZEngineCore;
        private _rawtext;
        readonly currentPath: string;
        readonly currentLineIndex: number;
        private _statementStack;
        constructor(_core: HZEngineCore, _rawtext: string, currentPath: string, currentLineIndex: number, _statementStack: StatementStack);
        get rawtext(): string;
        set rawtext(rawtext: string);
        private _rawtextChanged;
        private _slicedArgs;
        get slicedArgs(): Context.SlicedArg[];
        set slicedArgs(slicedArgs: Context.SlicedArg[]);
        /**
         * 開始一個新的Statement，返回該Statement的數據
         * Start a new statement and return the data of the new statement
         * @param identifier the identifier of the statement
         * @returns the data of the new statement
         */
        startStatement(identifier: string, data?: Storage.Saveable<unknown>): StatementData;
        endStatement(identifier: string): NonNullable<Storage.Saveable<unknown>>;
        get statementStack(): StatementStack;
        getStatementData(): NonNullable<Storage.Saveable<unknown>>;
        setStatementData(statement_data: NonNullable<Storage.Saveable<unknown>>, start_position: [path: string, index: number]): void;
    }
    namespace Utils {
        export const joinSlicedArgs: typeof joinObjs2Str;
        export const splitRawtext: typeof splitStr2Objs;
        export function splitCommas(rawtext: string): string[];
        export function parseTuple(rawtext: string): TupleOrArr;
        export function parseArray(rawtext: string): TupleOrArr;
        export function parseHzsArgs(rawtext: string): TupleOrArr;
        type TupleOrArr = (string | TupleOrArr)[];
        export {};
    }
    type MiddlewareForAnalyseStatement = (ctx: ContextForAnalyseStatement, next: () => void) => void;
    class ContextForAnalyseStatement extends Context {
        startStatement(identifier: string, data?: Storage.Saveable<unknown>): StatementData;
        endStatement(identifier: string): NonNullable<Storage.Saveable<unknown>>;
    }
    namespace Context {
        interface SlicedArg {
            str: string;
            isQuoted?: boolean;
            isSquared?: boolean;
        }
    }
    type StatementStackItem = [
        identifier: string,
        start_position: [path: string, index: number],
        statement_data: Storage.JSONValue
    ];
    type StatementStack = StatementStackItem[];
    type StatementData = NonNullable<Storage.JSONValue>;
}

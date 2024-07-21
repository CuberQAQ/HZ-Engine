import { HZEngineCore } from "..";

import * as hmFS from "@zos/fs";
import * as hmApp from "@zos/app";
import path from "@cuberqaq/path-polyfill";
import { HzsInfo, Storage } from "../storage";
import { readFileAssetsSync } from "../storage/fs";
import { sliceStr } from "./strtools";
import { readline } from "./readscript";
export class Script {
  constructor(private _core: HZEngineCore) {}

  // Route Stack
  private _routeStack: ([path: string, index: number] | null)[] = [];
  private _statementStack: Script.StatementStack = [];

  /**
   * 注意：存储该值的时候应总是拷贝赋值而非直接引用赋值
   */
  private _nextRunPosition: [path: string, index: number] | null = null;

  // Script Run

  /**
   * 执行_nextRunPosition，并返回下一行_nextRunPosition是否不为null
   */
  runSingleLine(): boolean {
    if (!this._nextRunPosition) throw "Run but _nextPosition is null";
    let nowRunPosition: [path: string, index: number] = [
      ...this._nextRunPosition,
    ];
    this._incrementNextPosition();

    let rawCommand = readline(nowRunPosition[0], nowRunPosition[1])!;
    if (rawCommand.trim().length && !rawCommand.trim().startsWith("#")) {
      if (rawCommand.trim().startsWith("*")) {
        if (this._statementStack.length) {
          throw `label between statement is not allowed, at file [${nowRunPosition[0]}] line [${nowRunPosition[1]}]`;
        }
      } else {
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
  jumpLabel(targetLabel: string) {
    let labelData = this._locateLabel(targetLabel);
    this._nextRunPosition = labelData;
  }

  jump(path: string, index: number) {
    this._nextRunPosition = [path, index];
  }

  /**
   * 调用目标标签
   * 保存当前执行位置至调用栈，跳转到目标位置，直到return返回
   * @param targetLabel
   */
  callLabel(targetLabel: string) {
    let labelData = this._locateLabel(targetLabel);
    this._routeStack.push(this._nextRunPosition);
    this._nextRunPosition = labelData;
  }

  return() {
    this._nextRunPosition = this._routeStack.pop() ?? null;
  }

  clear() {
    this._nextRunPosition = null;
    this._routeStack = [];
  }

  private _locateLabel(labelName: string) {
    if (this._core.storage.preloadedData == null)
      throw "Preloaded Data is Null";
    if (!this._core.storage.preloadedData.script.labelMap[labelName])
      throw `Error: Label [${labelName}] not found`;
    let labelData: [name: string, index: number] = [
      ...this._core.storage.preloadedData.script.labelMap[labelName],
    ] as any;
    return labelData;
  }

  private _incrementNextPosition() {
    if (this._core.storage.preloadedData == null)
      throw "Preloaded Data is Null";
    if (!this._nextRunPosition) throw "_nextRunPosition is null";
    // console.log(`hzsInfoMap=${JSON.stringify(this._core.storage.preloadedData.script.hzsInfoMap)}`);

    let hzsInfo: HzsInfo | undefined =
      this._core.storage.preloadedData.script.hzsInfoMap[
        this._nextRunPosition[0]
      ];
    if (!hzsInfo)
      throw `Preloaded hzsInfo of path(${this._nextRunPosition[0]}) not found`;
    this._nextRunPosition[1]++;
    if (this._nextRunPosition[1] >= hzsInfo.totalLines)
      this._nextRunPosition = null;
  }

  // Middleware
  private _middlewares: Script.Middleware[] = [];
  use(middleware: Script.Middleware, add_front: boolean = false) {
    if (add_front) {
      this._middlewares.unshift(middleware);
    } else {
      this._middlewares.push(middleware);
    }
  }

  private _processCmd(
    cmd: string,
    nowRunPosition: [path: string, index: number]
  ) {
    let ctx = this._buildContext(cmd, nowRunPosition);
    if (this._middlewares.length === 0) {
      this._processUnsolvedCmd(cmd);
      return;
    }
    let i = 0,
      len = this._middlewares.length;
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

  private _processUnsolvedCmd(cmd: string) {
    if (cmd.trim().length === 0) return; // Empty Line
    else if (cmd.trim().startsWith("*")) return; // Label Command
    else {
      throw `Can not parse command: ${cmd}`;
    }
  }

  private _buildContext(
    cmd: string,
    nowRunPosition: [path: string, index: number]
  ): Script.Context {
    return new Script.Context(
      this._core,
      cmd,
      nowRunPosition[0],
      nowRunPosition[1],
      this._statementStack
    );
  }

  // Statement Analyse
  private _statementAnalyseStack: Script.StatementStack = [];
  private _analyseStatementMiddlewares: Script.Middleware[] = [];
  private _buildAnalyseStatementContext(
    cmd: string,
    nowRunPosition: [path: string, index: number]
  ) {
    return new Script.ContextForAnalyseStatement(
      this._core,
      cmd,
      nowRunPosition[0],
      nowRunPosition[1],
      this._statementAnalyseStack
    );
  }
  useAnalyseStatement(middleware: Script.MiddlewareForAnalyseStatement, add_front?: boolean) {
    if (add_front) {
      this._analyseStatementMiddlewares.unshift(middleware);
    } else {
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
  analyseStatement(ctx: Script.Context) {
    console.log("[HZEngine] analyse statement");
    
    // Backup _nextRunPosition
    let _nextRunPositionBackup: [path: string, index: number] | null = this
      ._nextRunPosition
      ? [...this._nextRunPosition]
      : null;

    // Set _nextRunPosition to the current position of the statement
    this._nextRunPosition = [ctx.currentPath, ctx.currentLineIndex];
    while (this._nextRunPosition) {
      let rawCommand = readline(
        this._nextRunPosition[0],
        this._nextRunPosition[1]
      );
      if (!rawCommand)
        throw `Readline Error, at file [${this._nextRunPosition[0]}] line [${
          this._nextRunPosition[1] + 1
        }]`;

      // If the command is not empty and not a comment
      if (rawCommand.trim().length && !rawCommand.trim().startsWith("#")) {
        // If it is a label command, check if the statement stack is empty
        if (rawCommand.trim().startsWith("*")) {
          if (this._statementStack.length) {
            throw `label between statement is not allowed, at file [${
              this._nextRunPosition[0]
            }] line [${this._nextRunPosition[1] + 1}]`;
          }
        } else {
          // Build context for analyzing statement
          let sub_ctx = this._buildAnalyseStatementContext(rawCommand, [
            ...this._nextRunPosition,
          ]);
          
          console.log(`[HZEngine] analyse statement command [${rawCommand}]`);
          
          // Process command
          if (this._analyseStatementMiddlewares.length === 0) {
            // TODO do nothing
          } else {
            let i = 0,
              len = this._analyseStatementMiddlewares.length;
            let nextFunc = () => {
              i++;
              if (i >= len) {
                // TODO do nothing
              } else {
                this._analyseStatementMiddlewares[i](sub_ctx, nextFunc);
              }
            };
            this._analyseStatementMiddlewares[0](sub_ctx, nextFunc);
          }
        }
      }

      // Move to the next line
      this._incrementNextPosition();
    }

    this._nextRunPosition = _nextRunPositionBackup;

    // Check if the statement stack is empty
    if (this._statementAnalyseStack.length > 0) {
      throw `statement not closed, at file [${
        this._statementAnalyseStack[this._statementAnalyseStack.length - 1][1][0]
      }] line [${this._statementAnalyseStack[this._statementAnalyseStack.length - 1][1][1] + 1}]`;
    }

    // Reset _nextRunPosition to the backup value, and switch back to normal mode, and continue executing
    console.log("[HZEngine] analyse statement finish");
  }

  // eval
  evalScope(code: string) {
    try {
      return new Function("sd", "gd", `${code}`)(
        this._core.storage.sd,
        this._core.storage.gd
      );
    } catch (e) {
      console.log(`Error in evalScope: ${e}`);
    }
  }
  evalExpression(code: string) {
    try {
      return new Function("sd", "gd", `return (${code})`)(
        this._core.storage.sd,
        this._core.storage.gd
      );
    } catch (e) {
      console.log(`Error in evalExpression: ${e}`);
    }
  }
}

export namespace Script {
  export type Middleware = (ctx: Context, next: () => void) => void;
  export class Context {
    constructor(
      protected _core: HZEngineCore,
      public rawtext: string,
      public readonly currentPath: string,
      public readonly currentLineIndex: number,
      private _statementStack: StatementStack
    ) {}
    private _slicedArgs: Context.SlicedArg[] | null = null;
    get slicedArgs(): Context.SlicedArg[] {
      if (!this._slicedArgs) this._slicedArgs = sliceStr(this.rawtext);
      return this._slicedArgs;
    }
    /**
     * 開始一個新的Statement，返回該Statement的數據
     * Start a new statement and return the data of the new statement
     * @param identifier the identifier of the statement
     * @returns the data of the new statement
     */
    startStatement(
      identifier: string,
      data?: Storage.Saveable<unknown>
    ): StatementData {
      let statement_data = data ?? this.getStatementData();
      let statementStackItem: StatementStackItem = [
        identifier,
        [this.currentPath, this.currentLineIndex],
        statement_data,
      ];
      this._statementStack.push(statementStackItem);
      return statement_data;
    }
    endStatement(identifier: string) {
      if (this._statementStack.length === 0)
        throw `statement not open, at file [${this.currentPath}] line [${
          this.currentLineIndex + 1
        }]`;
      if (
        this._statementStack[this._statementStack.length - 1][0] !== identifier
      )
        throw `the last statement in the stack is not ${identifier}, at file [${
          this.currentPath
        }] line [${this.currentLineIndex + 1}]`;
      return this._statementStack.pop()![2];
    }
    get statementStack() {
      return this._statementStack;
    }

    // statement data will stored in core.storage.globalData.script.statement_data
    // the key of the statement data is the line index of the start statement,
    // for example: the key of the statement data of "menu ... end menu"
    // is stored in the key of the line index of the "menu" statement
    getStatementData(): NonNullable<Storage.Saveable<unknown>> {
      let statement_data_in_file = this._core.storage.getSaveableData(
        this._core.storage.globalData,
        true,
        "script",
        "statement_data",
        this.currentPath
      );
      if (!statement_data_in_file[this.currentLineIndex]) {
        this._core.script.analyseStatement(this);
        statement_data_in_file = this._core.storage.getSaveableData(
          this._core.storage.globalData,
          true,
          "script",
          "statement_data",
          this.currentPath
        );
        if (!statement_data_in_file[this.currentLineIndex])
          throw `analyse statement failed as statement data not found, at file [${
            this.currentPath
          }] line [${this.currentLineIndex + 1}]`;
      }

      return statement_data_in_file[this.currentLineIndex]!;
    }

    setStatementData(
      statement_data: NonNullable<Storage.Saveable<unknown>>,
      start_position: [path: string, index: number]
    ) {
      let statement_data_in_file = this._core.storage.getSaveableData(
        this._core.storage.globalData,
        true,
        "script",
        "statement_data",
        start_position[0]
      );
      statement_data_in_file[start_position[1]] = statement_data;
      this._core.storage.saveGlobalData();
    }
  }
  export type MiddlewareForAnalyseStatement = (ctx: ContextForAnalyseStatement, next: () => void) => void;
  export class ContextForAnalyseStatement extends Context {
    startStatement(
      identifier: string,
      data: Storage.Saveable<unknown> = {}
    ): StatementData {
      return super.startStatement(identifier, data ?? {});
    }
    endStatement(identifier: string) {
      let statement_data = super.endStatement(identifier);
      // save analysed statement data
      let statement_data_in_file = this._core.storage.getSaveableData(
        this._core.storage.globalData,
        true,
        "script",
        "statement_data",
        this.currentPath
      );
      statement_data_in_file[this.currentLineIndex] = statement_data;
      this._core.storage.saveGlobalData();
      return statement_data;
    }
  }
  export namespace Context {
    export interface SlicedArg {
      str: string;
      isQuoted: boolean; // 是否被雙引號包圍
    }
  }

  export type StatementStackItem = [
    identifier: string,
    start_position: [path: string, index: number],
    statement_data: Storage.JSONValue
  ];
  export type StatementStack = StatementStackItem[];
  export type StatementData = NonNullable<Storage.JSONValue>;
}

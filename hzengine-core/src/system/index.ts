import { HZEngineCore } from "..";

export class System {

    constructor(private _core: HZEngineCore) {

    }

    Condition: System.Condition = System.Condition.Free

    pause(delayMs?: number) {

    }

    start(initLabel: string = "start") {
        
    }

    

}

export namespace System {
    export enum Condition {
        Free,
        Pause,
        Gaming,
    }
}
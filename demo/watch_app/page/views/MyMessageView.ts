import {HZEngineCore, UI} from 'hzengine-core'
export default class MyMessageView extends UI.MessageView {
    onCreate(prop: UI.Message, layer: string, core: HZEngineCore): void {
        throw new Error('Method not implemented.');
    }
    onCommit(prop: UI.Message, layer: string, core: HZEngineCore): void {
        throw new Error('Method not implemented.');
    }
    onDestroy(prop: UI.Message, layer: string, core: HZEngineCore): void {
        throw new Error('Method not implemented.');
    }
}
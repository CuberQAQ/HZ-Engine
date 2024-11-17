import {Platform} from 'hzengine-core'
export interface WidgetFactory {
  createWidget(widgetType: number, option: Record<string, any>): any;
  deleteWidget(widget: any): void;
}

export declare type PlatformZOS = Platform<WidgetFactory>
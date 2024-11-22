import { HZEngineCore, Platform, Storage } from "../index.js";
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
export declare function Save<PlatformType extends Platform, This extends {
    _core: HZEngineCore;
}, Value extends Storage.Saveable<Value>>(store_key: string): (target: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>) => ClassAccessorDecoratorResult<This, Value>;
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
export declare function CustomSave<PlatformType extends Platform, This extends {
    _core: HZEngineCore;
}, Value, SerializedValue extends Storage.Saveable<SerializedValue>>(store_key: string, serializer: (this: This, value: Value) => SerializedValue, deserializer: (this: This, value: SerializedValue) => Value): (target: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>) => ClassAccessorDecoratorResult<This, Value>;
export declare function SaveGetter<PlatformType extends Platform, This extends {
    _core: HZEngineCore<PlatformType>;
}, Value extends Storage.Saveable<Value>>(store_key: string): (target: ClassGetterDecoratorTarget<PlatformType, This, Value>, context: ClassGetterDecoratorContext<This, Value>) => (this: This) => Value;
export declare function CustomSaveGetter<PlatformType extends Platform, This extends {
    _core: HZEngineCore<PlatformType>;
}, Value, SerializedValue extends Storage.Saveable<SerializedValue>>(store_key: string, serializer: (this: This, value: Value) => SerializedValue): (target: ClassGetterDecoratorTarget<PlatformType, This, Value>, context: ClassGetterDecoratorContext<This, Value>) => (this: This) => Value;
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
export declare function SaveSetter<PlatformType extends Platform, This extends {
    _core: HZEngineCore<PlatformType>;
}, Value extends Storage.Saveable<Value>>(store_key: string): (target: ClassSetterDecoratorTarget<PlatformType, This, Value>, context: ClassSetterDecoratorContext<This, Value>) => (this: This, value: Value) => void;
export declare function CustomSaveSetter<PlatformType extends Platform, This extends {
    _core: HZEngineCore<PlatformType>;
}, Value, SerializedValue extends Storage.Saveable<SerializedValue>>(store_key: string, deserializer: (this: This, value: SerializedValue) => Value): (target: ClassSetterDecoratorTarget<PlatformType, This, Value>, context: ClassSetterDecoratorContext<This, Value>) => (this: This, value: Value) => void;
type ClassGetterDecoratorTarget<PlatformType extends Platform, This extends {
    _core: HZEngineCore<PlatformType>;
}, Value> = (this: This) => Value;
type ClassSetterDecoratorTarget<PlatformType extends Platform, This extends {
    _core: HZEngineCore<PlatformType>;
}, Value> = (this: This, value: Value) => void;
export {};

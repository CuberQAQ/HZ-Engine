import { HZEngineCore, Storage } from "../index.js";
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
export declare function Save<This extends {
    _core: HZEngineCore;
}, Value extends Storage.Saveable<Value>>(store_key: string): (target: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>) => ClassAccessorDecoratorResult<This, Value>;
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
export declare function CustomSave<This extends {
    _core: HZEngineCore;
}, Value, SerializedValue extends Storage.Saveable<SerializedValue>>(store_key: string, serializer: (this: This, value: Value) => SerializedValue, deserializer: (this: This, value: SerializedValue) => Value): (target: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>) => ClassAccessorDecoratorResult<This, Value>;
export declare function SaveGetter<This extends {
    _core: HZEngineCore;
}, Value extends Storage.Saveable<Value>>(store_key: string): (target: ClassGetterDecoratorTarget<This, Value>, context: ClassGetterDecoratorContext<This, Value>) => (this: This) => Value;
export declare function CustomSaveGetter<This extends {
    _core: HZEngineCore;
}, Value, SerializedValue extends Storage.Saveable<SerializedValue>>(store_key: string, serializer: (this: This, value: Value) => SerializedValue): (target: ClassGetterDecoratorTarget<This, Value>, context: ClassGetterDecoratorContext<This, Value>) => (this: This) => Value;
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
export declare function SaveSetter<This extends {
    _core: HZEngineCore;
}, Value extends Storage.Saveable<Value>>(store_key: string): (target: ClassSetterDecoratorTarget<This, Value>, context: ClassSetterDecoratorContext<This, Value>) => (this: This, value: Value) => void;
export declare function CustomSaveSetter<This extends {
    _core: HZEngineCore;
}, Value, SerializedValue extends Storage.Saveable<SerializedValue>>(store_key: string, deserializer: (this: This, value: SerializedValue) => Value): (target: ClassSetterDecoratorTarget<This, Value>, context: ClassSetterDecoratorContext<This, Value>) => (this: This, value: Value) => void;
type ClassGetterDecoratorTarget<This extends {
    _core: HZEngineCore;
}, Value> = (this: This) => Value;
type ClassSetterDecoratorTarget<This extends {
    _core: HZEngineCore;
}, Value> = (this: This, value: Value) => void;
export {};

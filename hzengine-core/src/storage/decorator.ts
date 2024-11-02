import { HZEngineCore, Storage } from "..";
import { Async } from "../async";

/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
export function Save<
  This extends { _core: HZEngineCore },
  Value extends Storage.Saveable<Value>
>(store_key: string) {
  return function (
    target: ClassAccessorDecoratorTarget<This, Value>,
    context: ClassAccessorDecoratorContext<This, Value>
  ) {
    context.addInitializer(function () {
      Async.nextTick(() => {
        const core = this._core;
        core.on("initArchiveData", () => {
          core.storage.setSaveableData(
            core.storage.archiveData,
            true,
            target.get.call(this),
            ...store_key.split(".")
          );
        });
        core.on("beforeSaveArchive", () => {
          core.storage.setSaveableData(
            core.storage.archiveData,
            false,
            target.get.call(this),
            ...store_key.split(".")
          );
        });

        core.on("afterLoadArchive", () => {
          let dataInArchive = core.storage.getSaveableData(
            core.storage.archiveData,
            false,
            ...store_key.split(".")
          ) as Value;
          this._core.debug.log(`Load Data from Archive, store_key: ${store_key}, dataInArchive: ${JSON.stringify(dataInArchive)}`);
          target.set.call(this, dataInArchive);
        });
      });
    });
    if (context.kind !== "accessor") {
      throw new Error("ArchiveStateAccessor只能用于accessor属性");
    }
    return {
      get() {
        target = target as ClassAccessorDecoratorTarget<This, Value>;
        return archiveStateGetter(this, store_key, target.get);
      },
      set(value) {
        target = target as ClassAccessorDecoratorTarget<This, Value>;
        archiveStateSetter(this, store_key, target.set, value);
      },
    } as ClassAccessorDecoratorResult<This, Value>;
  };
}

/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
export function CustomSave<
  This extends { _core: HZEngineCore },
  Value,
  SerializedValue extends Storage.Saveable<SerializedValue>
>(
  store_key: string,
  serializer: (this: This, value: Value) => SerializedValue,
  deserializer: (this: This, value: SerializedValue) => Value
) {
  return (
    target: ClassAccessorDecoratorTarget<This, Value>,
    context: ClassAccessorDecoratorContext<This, Value>
  ) => {
    if (context.kind !== "accessor") {
      throw new Error("ArchiveStateAccessor只能用于accessor属性");
    }
    context.addInitializer(function () {
      Async.nextTick(() => {
        const core = this._core;
        core.on("initArchiveData", () => {
          core.storage.setSaveableData(
            core.storage.archiveData,
            true,
            serializer.call(this, target.get.call(this)),
            ...store_key.split(".")
          );
        });
        core.on("beforeSaveArchive", () => {
          core.storage.setSaveableData(
            core.storage.archiveData,
            false,
            serializer.call(this, target.get.call(this)),
            ...store_key.split(".")
          );
        });

        core.on("afterLoadArchive", () => {
          let dataInArchive = core.storage.getSaveableData(
            core.storage.archiveData,
            false,
            ...store_key.split(".")
          ) as SerializedValue;
          this._core.debug.log(`Load Data from Archive, store_key: ${store_key}, dataInArchive: ${JSON.stringify(dataInArchive)}`);
          target.set.call(this, deserializer.call(this, dataInArchive));
        });
      });
    });
    return {
      get() {
        target = target as ClassAccessorDecoratorTarget<This, Value>;
        return archiveStateGetterWithSerializer(
          this,
          store_key,
          target.get,
          serializer
        );
      },
      set(value) {
        target = target as ClassAccessorDecoratorTarget<This, Value>;
        archiveStateSetterWithDeserializer(
          this,
          store_key,
          target.set,
          value,
          deserializer
        );
      },
    } as ClassAccessorDecoratorResult<This, Value>;
  };
}

export function SaveGetter<
  This extends { _core: HZEngineCore },
  Value extends Storage.Saveable<Value>
>(store_key: string) {
  return (
    target: ClassGetterDecoratorTarget<This, Value>,
    context: ClassGetterDecoratorContext<This, Value>
  ) => {
    context.addInitializer(function () {
      Async.nextTick(() => {
        const core = this._core;
        core.on("initArchiveData", () => {
          core.storage.setSaveableData(
            core.storage.archiveData,
            true,
            target.call(this),
            ...store_key.split(".")
          );
        });
        core.on("beforeSaveArchive", () => {
          core.storage.setSaveableData(
            core.storage.archiveData,
            false,
            target.call(this),
            ...store_key.split(".")
          );
        });
      });
    });
    if (context.kind !== "getter") {
      throw new Error("ArchiveStateGetter只能用于getter属性");
    }
    return function (this: This) {
      let val = archiveStateGetter(
        this,
        store_key,
        target as ClassGetterDecoratorTarget<This, Value>
      );
      return val;
    };
  };
}

export function CustomSaveGetter<
  This extends { _core: HZEngineCore },
  Value,
  SerializedValue extends Storage.Saveable<SerializedValue>
>(
  store_key: string,
  serializer: (this: This, value: Value) => SerializedValue
) {
  return (
    target: ClassGetterDecoratorTarget<This, Value>,
    context: ClassGetterDecoratorContext<This, Value>
  ) => {
    if (context.kind !== "getter") {
      throw new Error("ArchiveStateGetter只能用于getter属性");
    }
    context.addInitializer(function () {
      Async.nextTick(() => {
        const core = this._core;
        core.on("initArchiveData", () => {
          core.storage.setSaveableData(
            core.storage.archiveData,
            true,
            serializer.call(this, target.call(this)),
            ...store_key.split(".")
          );
        });
        core.on("beforeSaveArchive", () => {
          core.storage.setSaveableData(
            core.storage.archiveData,
            false,
            serializer.call(this, target.call(this)),
            ...store_key.split(".")
          );
        });
      });
    });
    return function (this: This) {
      let val = archiveStateGetterWithSerializer(
        this,
        store_key,
        target as ClassGetterDecoratorTarget<This, Value>,
        serializer
      );
      return val;
    };
  };
}

/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
export function SaveSetter<
  This extends { _core: HZEngineCore },
  Value extends Storage.Saveable<Value>
>(store_key: string) {
  return (
    target: ClassSetterDecoratorTarget<This, Value>,
    context: ClassSetterDecoratorContext<This, Value>
  ) => {
    if (context.kind !== "setter") {
      throw new Error("ArchiveStateSetter只能用于setter属性");
    }
    context.addInitializer(function () {
      Async.nextTick(() => {
        let core = this._core;
        core.on("afterLoadArchive", () => {
          let dataInArchive = core.storage.getSaveableData(
            core.storage.archiveData,
            false,
            ...store_key.split(".")
          ) as Value;
          this._core.debug.log(`Load Data from Archive, store_key: ${store_key}, dataInArchive: ${JSON.stringify(dataInArchive)}`);
          target.call(this, dataInArchive);
        });
      });
    });
    return function (this: This, value: Value) {
      archiveStateSetter(
        this,
        store_key,
        target as ClassSetterDecoratorTarget<This, Value>,
        value
      );
    };
  };
}

export function CustomSaveSetter<
  This extends { _core: HZEngineCore },
  Value,
  SerializedValue extends Storage.Saveable<SerializedValue>
>(
  store_key: string,
  deserializer: (this: This, value: SerializedValue) => Value
) {
  return (
    target: ClassSetterDecoratorTarget<This, Value>,
    context: ClassSetterDecoratorContext<This, Value>
  ) => {
    if (context.kind !== "setter") {
      throw new Error("ArchiveStateSetter只能用于setter属性");
    }
    context.addInitializer(function () {
      Async.nextTick(() => {
        let core = this._core;
        core.on("afterLoadArchive", () => {
          let dataInArchive = core.storage.getSaveableData(
            core.storage.archiveData,
            false,
            ...store_key.split(".")
          ) as SerializedValue;
          this._core.debug.log(`Load Data from Archive, store_key: ${store_key}, dataInArchive: ${JSON.stringify(dataInArchive)}`);
          target.call(this, deserializer.call(this, dataInArchive));
        });
      });
    });
    return function (this: This, value: Value) {
      archiveStateSetterWithDeserializer(
        this,
        store_key,
        target as ClassSetterDecoratorTarget<This, Value>,
        value,
        deserializer
      );
    };
  };
}

/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function archiveStateGetter<
  This extends { _core: HZEngineCore },
  Value extends Storage.Saveable<Value>
>(_this: This, store_key: string, old_getter: (this: This) => Value) {
  const core = _this._core;
  // if (!core.storage._archiveStateGetterRegisteredList.has(store_key)) {
  //   core.storage._archiveStateGetterRegisteredList.add(store_key);
  //   core.on("initArchiveData", () => {
  //     core.storage.setSaveableData(
  //       core.storage.archiveData,
  //       true,
  //       old_getter.call(_this),
  //       ...store_key.split(".")
  //     );
  //   });
  //   core.on("beforeSaveArchive", () => {
  //     core.storage.setSaveableData(
  //       core.storage.archiveData,
  //       false,
  //       old_getter.call(_this),
  //       ...store_key.split(".")
  //     );
  //   });
  // }
  let val = old_getter.call(_this);
  // console.log(`getval: ${val}`);
  return val;
}

/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function archiveStateGetterWithSerializer<
  This extends { _core: HZEngineCore },
  Value,
  SerializedValue extends Storage.Saveable<SerializedValue>
>(
  _this: This,
  store_key: string,
  old_getter: (this: This) => Value,
  serializer: (this: This, value: Value) => SerializedValue
) {
  const core = _this._core;
  // if (!core.storage._archiveStateGetterRegisteredList.has(store_key)) {
  //   core.storage._archiveStateGetterRegisteredList.add(store_key);
  //   core.on("initArchiveData", () => {
  //     core.storage.setSaveableData(
  //       core.storage.archiveData,
  //       true,
  //       serializer.call(_this, old_getter.call(_this)),
  //       ...store_key.split(".")
  //     );
  //   });
  //   core.on("beforeSaveArchive", () => {
  //     core.storage.setSaveableData(
  //       core.storage.archiveData,
  //       false,
  //       serializer.call(_this, old_getter.call(_this)),
  //       ...store_key.split(".")
  //     );
  //   });
  // }
  let val = old_getter.call(_this);
  // console.log(`getval: ${val}`);
  return val;
}

function archiveStateSetter<
  This extends { _core: HZEngineCore },
  Value extends Storage.Saveable<Value>
>(
  _this: This,
  store_key: string,
  old_setter: (this: This, value: Value) => void,
  val: Value
) {
  // const core = _this._core;
  // if (!core.storage._archiveStateSetterRegisteredList.has(store_key)) {
  //   core.storage._archiveStateSetterRegisteredList.add(store_key);
  //   core.on("afterLoadArchive", () => {
  //     let dataInArchive = core.storage.getSaveableData(
  //       core.storage.archiveData,
  //       false,
  //       ...store_key.split(".")
  //     ) as Value;
  //     console.log(`Load Data from Archive, store_key: ${store_key}`);
  //     old_setter.call(_this, dataInArchive);
  //   });
  // }
  old_setter.call(_this, val);
  // console.log(`setval: ${val}`);
}

function archiveStateSetterWithDeserializer<
  This extends { _core: HZEngineCore },
  Value,
  SerializedValue extends Storage.Saveable<SerializedValue>
>(
  _this: This,
  store_key: string,
  old_setter: (this: This, value: Value) => void,
  val: Value,
  deserializer: (this: This, value: SerializedValue) => Value
) {
  // const core = _this._core;
  // if (!core.storage._archiveStateSetterRegisteredList.has(store_key)) {
  //   core.storage._archiveStateSetterRegisteredList.add(store_key);
  //   core.on("afterLoadArchive", () => {
  //     let dataInArchive = core.storage.getSaveableData(
  //       core.storage.archiveData,
  //       false,
  //       ...store_key.split(".")
  //     ) as SerializedValue;
  //     console.log(`Load Data from Archive, store_key: ${store_key}`);
  //     old_setter.call(_this, deserializer.call(_this, dataInArchive));
  //   });
  // }
  old_setter.call(_this, val);
  // console.log(`setval: ${val}`);
}

type ClassGetterDecoratorTarget<This extends { _core: HZEngineCore }, Value> = (
  this: This
) => Value;
type ClassSetterDecoratorTarget<This extends { _core: HZEngineCore }, Value> = (
  this: This,
  value: Value
) => void;

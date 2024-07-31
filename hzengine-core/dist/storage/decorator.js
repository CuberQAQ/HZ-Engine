"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveStateAccessor = ArchiveStateAccessor;
exports.ArchiveStateAccessorWithSerializer = ArchiveStateAccessorWithSerializer;
exports.ArchiveStateGetter = ArchiveStateGetter;
exports.ArchiveStateGetterWithSerializer = ArchiveStateGetterWithSerializer;
exports.ArchiveStateSetter = ArchiveStateSetter;
exports.ArchiveStateSetterWithDeserializer = ArchiveStateSetterWithDeserializer;
const async_1 = require("../async");
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function ArchiveStateAccessor(store_key) {
    return function (target, context) {
        context.addInitializer(function () {
            async_1.Async.nextTick(() => {
                const core = this._core;
                core.on("initArchiveData", () => {
                    core.storage.setSaveableData(core.storage.archiveData, true, target.get.call(this), ...store_key.split("."));
                });
                core.on("beforeSaveArchive", () => {
                    core.storage.setSaveableData(core.storage.archiveData, false, target.get.call(this), ...store_key.split("."));
                });
                core.on("afterLoadArchive", () => {
                    let dataInArchive = core.storage.getSaveableData(core.storage.archiveData, false, ...store_key.split("."));
                    console.log(`Load Data from Archive, store_key: ${store_key}, dataInArchive: ${JSON.stringify(dataInArchive)}`);
                    target.set.call(this, dataInArchive);
                });
            });
        });
        if (context.kind !== "accessor") {
            throw new Error("ArchiveStateAccessor只能用于accessor属性");
        }
        return {
            get() {
                target = target;
                return archiveStateGetter(this, store_key, target.get);
            },
            set(value) {
                target = target;
                archiveStateSetter(this, store_key, target.set, value);
            },
        };
    };
}
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function ArchiveStateAccessorWithSerializer(store_key, serializer, deserializer) {
    return (target, context) => {
        if (context.kind !== "accessor") {
            throw new Error("ArchiveStateAccessor只能用于accessor属性");
        }
        context.addInitializer(function () {
            async_1.Async.nextTick(() => {
                const core = this._core;
                core.on("initArchiveData", () => {
                    core.storage.setSaveableData(core.storage.archiveData, true, serializer.call(this, target.get.call(this)), ...store_key.split("."));
                });
                core.on("beforeSaveArchive", () => {
                    core.storage.setSaveableData(core.storage.archiveData, false, serializer.call(this, target.get.call(this)), ...store_key.split("."));
                });
                core.on("afterLoadArchive", () => {
                    let dataInArchive = core.storage.getSaveableData(core.storage.archiveData, false, ...store_key.split("."));
                    console.log(`Load Data from Archive, store_key: ${store_key}, dataInArchive: ${JSON.stringify(dataInArchive)}`);
                    target.set.call(this, deserializer.call(this, dataInArchive));
                });
            });
        });
        return {
            get() {
                target = target;
                return archiveStateGetterWithSerializer(this, store_key, target.get, serializer);
            },
            set(value) {
                target = target;
                archiveStateSetterWithDeserializer(this, store_key, target.set, value, deserializer);
            },
        };
    };
}
function ArchiveStateGetter(store_key) {
    return (target, context) => {
        context.addInitializer(function () {
            async_1.Async.nextTick(() => {
                const core = this._core;
                core.on("initArchiveData", () => {
                    core.storage.setSaveableData(core.storage.archiveData, true, target.call(this), ...store_key.split("."));
                });
                core.on("beforeSaveArchive", () => {
                    core.storage.setSaveableData(core.storage.archiveData, false, target.call(this), ...store_key.split("."));
                });
            });
        });
        if (context.kind !== "getter") {
            throw new Error("ArchiveStateGetter只能用于getter属性");
        }
        return function () {
            let val = archiveStateGetter(this, store_key, target);
            return val;
        };
    };
}
function ArchiveStateGetterWithSerializer(store_key, serializer) {
    return (target, context) => {
        if (context.kind !== "getter") {
            throw new Error("ArchiveStateGetter只能用于getter属性");
        }
        context.addInitializer(function () {
            async_1.Async.nextTick(() => {
                const core = this._core;
                core.on("initArchiveData", () => {
                    core.storage.setSaveableData(core.storage.archiveData, true, serializer.call(this, target.call(this)), ...store_key.split("."));
                });
                core.on("beforeSaveArchive", () => {
                    core.storage.setSaveableData(core.storage.archiveData, false, serializer.call(this, target.call(this)), ...store_key.split("."));
                });
            });
        });
        return function () {
            let val = archiveStateGetterWithSerializer(this, store_key, target, serializer);
            return val;
        };
    };
}
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function ArchiveStateSetter(store_key) {
    return (target, context) => {
        if (context.kind !== "setter") {
            throw new Error("ArchiveStateSetter只能用于setter属性");
        }
        context.addInitializer(function () {
            async_1.Async.nextTick(() => {
                let core = this._core;
                core.on("afterLoadArchive", () => {
                    let dataInArchive = core.storage.getSaveableData(core.storage.archiveData, false, ...store_key.split("."));
                    console.log(`Load Data from Archive, store_key: ${store_key}, dataInArchive: ${JSON.stringify(dataInArchive)}`);
                    target.call(this, dataInArchive);
                });
            });
        });
        return function (value) {
            archiveStateSetter(this, store_key, target, value);
        };
    };
}
function ArchiveStateSetterWithDeserializer(store_key, deserializer) {
    return (target, context) => {
        if (context.kind !== "setter") {
            throw new Error("ArchiveStateSetter只能用于setter属性");
        }
        context.addInitializer(function () {
            async_1.Async.nextTick(() => {
                let core = this._core;
                core.on("afterLoadArchive", () => {
                    let dataInArchive = core.storage.getSaveableData(core.storage.archiveData, false, ...store_key.split("."));
                    console.log(`Load Data from Archive, store_key: ${store_key}, dataInArchive: ${JSON.stringify(dataInArchive)}`);
                    target.call(this, deserializer.call(this, dataInArchive));
                });
            });
        });
        return function (value) {
            archiveStateSetterWithDeserializer(this, store_key, target, value, deserializer);
        };
    };
}
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function archiveStateGetter(_this, store_key, old_getter) {
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
function archiveStateGetterWithSerializer(_this, store_key, old_getter, serializer) {
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
function archiveStateSetter(_this, store_key, old_setter, val) {
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
function archiveStateSetterWithDeserializer(_this, store_key, old_setter, val, deserializer) {
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

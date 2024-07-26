"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveStateSetter = exports.ArchiveStateGetter = exports.ArchiveStateAccessor = void 0;
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function ArchiveStateAccessor(store_key) {
    return (target, context) => {
        if (context.kind !== "accessor") {
            throw new Error("ArchiveStateAccessor只能用于accessor属性");
        }
        return {
            get() {
                target = target;
                return archiveStateGetter(this, target.get);
            },
            set(value) {
                target = target;
                archiveStateSetter(this, target.set, value);
            },
        };
    };
}
exports.ArchiveStateAccessor = ArchiveStateAccessor;
function ArchiveStateGetter(store_key) {
    return (target, context) => {
        if (context.kind !== "getter") {
            throw new Error("ArchiveStateGetter只能用于getter属性");
        }
        return function () {
            let val = archiveStateGetter(this, target);
            return val;
        };
    };
}
exports.ArchiveStateGetter = ArchiveStateGetter;
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
        return function (value) {
            archiveStateSetter(this, target, value);
        };
    };
}
exports.ArchiveStateSetter = ArchiveStateSetter;
/**
 * 存档属性装饰器
 * @param store_key 保存数据到存档数据对象的key
 * @returns
 */
function archiveStateGetter(_this, old_getter) {
    let val = old_getter.call(_this);
    console.log(`getval: ${val}`);
    return val;
}
function archiveStateSetter(_this, old_setter, val) {
    old_setter.call(_this, val);
    console.log(`setval: ${val}`);
}

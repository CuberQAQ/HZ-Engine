"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveState = void 0;
/**
 * 存档属性装饰器
 * @decorator
 * @name 一个用于将属性存储到存档的装饰器
 */
function ArchiveState() {
    return (target, propertyKey) => {
        target[propertyKey] = target[propertyKey] || {};
    };
}
exports.ArchiveState = ArchiveState;

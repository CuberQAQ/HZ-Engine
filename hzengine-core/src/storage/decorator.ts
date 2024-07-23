/**
 * 存档属性装饰器
 * @decorator
 * @name 一个用于将属性存储到存档的装饰器
 */
export function ArchiveState() {
  return (target: any, propertyKey: string) => {
    target[propertyKey] = target[propertyKey] || {};
  };
}
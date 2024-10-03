/**
 * 解析路径，将相对路径转换为绝对路径
 * @param {...string} paths - 要解析的路径
 * @returns {string} - 解析后的绝对路径
 */
export function resolve(...args: string[]): string;
/**
 * 规范化路径，去除多余的斜杠和当前目录
 * @param {string} path - 输入的路径字符串
 * @returns {string} - 规范化后的路径
 */
export function normalize(path: string): string;
/**
 * 检查路径是否为绝对路径
 * @param {string} path - 输入的路径字符串
 * @returns {boolean} - 如果路径为绝对路径，则返回 true
 */
export function isAbsolute(path: string): boolean;
/**
 * 连接多个路径段为一个路径
 * @param {...string} segments - 要连接的路径段
 * @returns {string} - 连接后的路径
 */
export function join(...args: string[]): string;
/**
 * 计算相对路径
 * @param {string} from - 起始路径
 * @param {string} to - 目标路径
 * @returns {string} - 相对路径
 */
export function relative(from: string, to: string): string;
/**
 * 获取路径的目录名
 * @param {string} path - 输入的路径字符串
 * @returns {string} - 目录名
 */
export function dirname(path: string): string;
/**
 * 获取路径的基本名
 * @param {string} path - 输入的路径字符串
 * @param {string} [ext] - 可选的扩展名，如果提供则将其从基本名中去除
 * @returns {string} - 基本名
 */
export function basename(path: string, ext?: string | undefined): string;
/**
 * 获取路径的扩展名
 * @param {string} path - 输入的路径字符串
 * @returns {string} - 扩展名
 */
export function extname(path: string): string;
/**
 * 格式化路径对象为路径字符串
 * @param {Object} pathObject - 路径对象
 * @param {string} pathObject.root - 根路径
 * @param {string} pathObject.dir - 目录路径
 * @param {string} pathObject.base - 基本文件名
 * @param {string} pathObject.ext - 扩展名
 * @param {string} pathObject.name - 文件名（不包含扩展名）
 * @returns {string} - 格式化后的路径字符串
 */
export function format(pathObject: {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
}): string;
/**
 * 解析路径字符串为路径对象
 * @param {string} pathString - 输入的路径字符串
 * @returns {{root: string, dir: string, base: string, ext: string, name: string}} - 路径对象
 */
export function parse(pathString: string): {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
};
export let sep: string;
export let delimiter: string;

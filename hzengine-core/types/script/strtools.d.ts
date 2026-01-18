/**
 * 将一行字符串切割为(str,quoted)[]的形式
 * @param str
 * @returns
 */
export declare function splitStr2Objs(str: string): {
    str: string;
    isQuoted?: boolean | undefined;
    isSquared?: boolean | undefined;
    isRounded?: boolean | undefined;
}[];
export declare function mergeObjs2Str(objs: {
    str: string;
    isQuoted?: boolean;
    isSquared?: boolean;
    isRounded?: boolean;
}[]): string;
export declare function splitStr2Strs(str: string): string[];
/**
 * 转义一遍字符串，使其中\n等变成对应字符（可能报错）
 * @param str
 * @returns
 */
export declare function transformStr(str: string): any;
export declare function parseInterpolatedStr(str: string): ParsedInterpolationItem[];
export declare function removeComment(str: string): string;
type ParsedInterpolationItem = {
    str: string;
    isExpression: boolean;
};
export {};

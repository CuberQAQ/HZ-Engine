"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformStr = exports.splitStr2Strs = exports.splitStr2Objs = void 0;
/**
 * 将一行字符串切割为(str,quoted)[]的形式
 * @param str
 * @returns
 */
function splitStr2Objs(str) {
    let res = [];
    let len = str.length;
    let p = 0;
    while (p < len) {
        while (p < len && str[p] === " ")
            ++p; // find first not space
        if (p === len)
            return res;
        if (str[p] === '"') {
            // find next `"`
            let q = p + 1;
            while (q < len && str[q] !== '"') {
                if (str[q] === "\\")
                    q += 2;
                else
                    ++q;
            }
            if (q >= len)
                throw "Quote not completed";
            let resstr = str.slice(p + 1, q);
            //   console.log(`Transformed[${res.length}]:\n${transformStr(resstr)}`);
            let transformedStr = "error";
            try {
                transformedStr = transformStr(resstr);
            }
            catch (e) {
                throw "该字符串中的转义字符有错误：" + resstr;
            }
            res.push({ str: transformedStr, isQuoted: true });
            p = q + 1;
        }
        else if (str[p] === '[') {
            // find next `]`
            let q = p + 1;
            while (q < len && str[q] !== ']') {
                // if (str[q] === "\\") q += 2;
                // else ++q;
                ++q;
            }
            if (q >= len)
                throw "square brackets not completed";
            let resstr = str.slice(p + 1, q);
            //   console.log(`Transformed[${res.length}]:\n${transformStr(resstr)}`);
            // let transformedStr;
            // try {
            //   transformedStr = transformStr(resstr);
            // } catch (e) {
            //   throw "该字符串中的转义字符有错误：" + resstr;
            // }
            res.push({ str: resstr, isSquared: true });
            p = q + 1;
        }
        else {
            let q = p + 1;
            while (q < len && str[q] !== " " && str[q] !== '"')
                ++q; // find first space/quote after this
            let resstr = str.slice(p, q);
            //   console.log(transformStr(resstr));
            res.push({ str: resstr, isQuoted: false });
            p = q;
        }
    }
    return res;
}
exports.splitStr2Objs = splitStr2Objs;
function splitStr2Strs(str) {
    return splitStr2Objs(str).map((obj) => obj.isQuoted ? `"${obj.str}"` : obj.str);
}
exports.splitStr2Strs = splitStr2Strs;
/**
 * 转义一遍字符串，使其中\n等变成对应字符（可能报错）
 * @param str
 * @returns
 */
function transformStr(str) {
    return JSON.parse(`"${str}"`);
}
exports.transformStr = transformStr;

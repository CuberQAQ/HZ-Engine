"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitStr2Objs = splitStr2Objs;
exports.splitStr2Strs = splitStr2Strs;
exports.transformStr = transformStr;
exports.parseInterpolatedStr = parseInterpolatedStr;
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
        else if (str[p] === "[") {
            // find next `]`
            let q = p + 1;
            while (q < len && str[q] !== "]") {
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
function splitStr2Strs(str) {
    return splitStr2Objs(str).map((obj) => obj.isQuoted ? `"${obj.str}"` : obj.str);
}
/**
 * 转义一遍字符串，使其中\n等变成对应字符（可能报错）
 * @param str
 * @returns
 */
function transformStr(str) {
    return JSON.parse(`"${str}"`);
}
// 翻译hzengine script插值字符串
// 语法："...[expression]..."
// 如果希望在字符串中显示`[`，请使用两个`[`，如`"[[正常显示而不被当作表达式的文字]]"`
function parseInterpolatedStr(str) {
    let len = str.length;
    let p = 0;
    let expr_record = [];
    while (p < len) {
        // 寻找第一个`[`
        while (p < len && str[p] !== "[")
            ++p;
        if (p >= len)
            break;
        // 判断是否是两个`[`
        if (str[p] === "[" && str[p + 1] === "[") {
            p += 2;
            continue;
        }
        // 寻找第一个`]`
        let q = p + 1;
        while (q < len && str[q] !== "]") {
            ++q;
            // 判断是否是两个`]`
            while (q < len && str[q] === "]" && str[q + 1] === "]") {
                q += 2;
            }
        }
        if (q >= len) {
            // 没有找到`]`，报错
            throw `Interpolated string lose closing bracket: ${str}`;
        }
        expr_record.push([p, q]);
        p = q + 1;
    }
    let left = 0, right = len;
    let res = [];
    for (let i = 0; i < expr_record.length; ++i) {
        let [l, r] = expr_record[i];
        if (l > left)
            res.push({ str: str.slice(left, l), isExpression: false });
        res.push({ str: str.slice(l + 1, r), isExpression: true });
        left = r + 1;
    }
    if (left < right)
        res.push({ str: str.slice(left, right), isExpression: false });
    return res;
}

/**
 * 将一行字符串切割为(str,quoted)[]的形式
 * @param str
 * @returns
 */
export function splitStr2Objs(str: string) {
  let res: { str: string; isQuoted?: boolean, isSquared?: boolean }[] = [];
  let len = str.length;
  let p = 0;
  while (p < len) {
    while (p < len && str[p] === " ") ++p; // find first not space
    if (p === len) return res;
    if (str[p] === '"') {
      // find next `"`
      let q = p + 1;
      while (q < len && str[q] !== '"') {
        if (str[q] === "\\") q += 2;
        else ++q;
      }
      if (q >= len) throw "Quote not completed";
      let resstr = str.slice(p + 1, q);
      //   console.log(`Transformed[${res.length}]:\n${transformStr(resstr)}`);
      let transformedStr: string = "error";
      try {
        transformedStr = transformStr(resstr);
      } catch (e) {
        throw "该字符串中的转义字符有错误：" + resstr;
      }
      res.push({ str: transformedStr!, isQuoted: true });
      p = q + 1;
    } else if (str[p] === '[') {
      // find next `]`
      let q = p + 1;
      while (q < len && str[q] !== ']') {
        // if (str[q] === "\\") q += 2;
        // else ++q;
        ++q
      }
      if (q >= len) throw "square brackets not completed";
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
    } else {
      let q = p + 1;
      while (q < len && str[q] !== " " && str[q] !== '"') ++q; // find first space/quote after this
      let resstr = str.slice(p, q);
      //   console.log(transformStr(resstr));
      res.push({ str: resstr, isQuoted: false });
      p = q;
    }
  }
  return res;
}

export function splitStr2Strs(str: string) {
  return splitStr2Objs(str).map((obj) =>
    obj.isQuoted ? `"${obj.str}"` : obj.str
  );
}

/**
 * 转义一遍字符串，使其中\n等变成对应字符（可能报错）
 * @param str
 * @returns
 */
export function transformStr(str: string) {
  return JSON.parse(`"${str}"`);
}

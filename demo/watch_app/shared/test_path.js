// path utils for ZeppOS

'use strict';

var util = {
  isString: (x) => typeof x === 'string', // 检查是否为字符串
  isObject: (x) => typeof x === 'object'  // 检查是否为对象
};

// 检查路径是否包含协议
function isProtocolPath(path) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(path);
}

// 提取协议和路径部分
function extractProtocol(path) {
  const match = path.match(/^([a-zA-Z][a-zA-Z\d+\-.]*):\/\/(.*)$/);
  if (match) {
    return {
      protocol: match[1], // 获取协议
      filepath: match[2]  // 获取文件路径
    };
  }
  return { protocol: null, filepath: path }; // 如果没有协议，返回原路径
}

// 解析路径数组并规范化
function normalizeArray(parts, allowAboveRoot) {
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];

    // 忽略空部分和当前目录（.）
    if (!p || p === '.') continue;

    // 处理上级目录（..）
    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop(); // 移除最后一个部分
      } else if (allowAboveRoot) {
        res.push('..'); // 允许上级目录
      }
    } else {
      res.push(p); // 添加有效部分
    }
  }

  return res;
}

// 移除数组两端的空元素
function trimArray(arr) {
  var lastIndex = arr.length - 1;
  var start = 0;
  for (; start <= lastIndex; start++) {
    if (arr[start]) break;
  }

  var end = lastIndex;
  for (; end >= 0; end--) {
    if (arr[end]) break;
  }

  if (start === 0 && end === lastIndex) return arr;
  if (start > end) return [];
  return arr.slice(start, end + 1);
}

// 使用正则表达式分割路径
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var zeppos = {};

// 分割路径
function zepposSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}

// zeppos 版本的路径解析
zeppos.resolve = function () {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // 跳过空和无效的条目
    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    // 检查路径是否包含协议
    if (isProtocolPath(path)) {
      const { protocol, filepath } = extractProtocol(path);
      resolvedPath = filepath + '/' + resolvedPath;
      resolvedAbsolute = true; // 将协议路径视为绝对路径
    } else {
      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path[0] === '/';
    }
  }

  // 规范化路径
  resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// zeppos 版本的路径规范化
zeppos.normalize = function (path) {
  // 检查路径是否包含协议
  if (isProtocolPath(path)) {
    const { protocol, filepath } = extractProtocol(path);
    return protocol + '://' + normalizeArray(filepath.split('/')).join('/');
  }

  var isAbsolute = zeppos.isAbsolute(path),
      trailingSlash = path && path[path.length - 1] === '/';

  // 规范化路径
  path = normalizeArray(path.split('/'), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// 检查路径是否为绝对路径
zeppos.isAbsolute = function (path) {
  return path.charAt(0) === '/';
};

// zeppos 版本的路径连接
zeppos.join = function () {
  var path = '';
  for (var i = 0; i < arguments.length; i++) {
    var segment = arguments[i];
    if (!util.isString(segment)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += '/' + segment;
      }
    }
  }
  return zeppos.normalize(path);
};

// zeppos 版本的相对路径计算
zeppos.relative = function (from, to) {
  from = zeppos.resolve(from).substr(1);
  to = zeppos.resolve(to).substr(1);

  var fromParts = trimArray(from.split('/'));
  var toParts = trimArray(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

zeppos.dirname = function (path) {
  var result = zepposSplitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    return '.';
  }

  if (dir) {
    dir = dir.substr(0, dir.length - 1); // 去掉尾部斜杠
  }

  return root + dir;
};

zeppos.basename = function (path, ext) {
  var f = zepposSplitPath(path)[2];
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

zeppos.extname = function (path) {
  return zepposSplitPath(path)[3];
};

zeppos.format = function (pathObject) {
  if (!util.isObject(pathObject)) {
    throw new TypeError(
      "Parameter 'pathObject' must be an object, not " + typeof pathObject
    );
  }

  var root = pathObject.root || '';

  if (!util.isString(root)) {
    throw new TypeError(
      "'pathObject.root' must be a string or undefined, not " +
      typeof pathObject.root
    );
  }

  var dir = pathObject.dir ? pathObject.dir + zeppos.sep : '';
  var base = pathObject.base || '';
  return dir + base;
};

zeppos.parse = function (pathString) {
  if (!util.isString(pathString)) {
    throw new TypeError(
      "Parameter 'pathString' must be a string, not " + typeof pathString
    );
  }
  var allParts = zepposSplitPath(pathString);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError("Invalid path '" + pathString + "'");
  }
  allParts[1] = allParts[1] || '';
  allParts[2] = allParts[2] || '';
  allParts[3] = allParts[3] || '';

  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  };
};

zeppos.sep = '/';
zeppos.delimiter = ':';
module.exports = zeppos;

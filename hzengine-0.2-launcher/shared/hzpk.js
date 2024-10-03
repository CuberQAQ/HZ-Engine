// HZ-Engine Package (hzpk) utils for Zepp OS
import hmFS from "@zos/fs";
import path from "../shared/path.js";
const head_magic = Uint8Array.from("HZENGINE-PACKAGE!", (ch) =>
  ch.charCodeAt(0)
);
const head_version = Uint8Array.from([1, 0, 0]);
const info_version = "1.0.0";

export function checkHzpk_v1(path) {
  // 检查文件是否为 hzpk 以及 hzpk 头版本是否为 1.0.0
  if (!hmFS.statSync({ path }))
    return {
      isHzpk: false,
      error: "读取 hzpk 失败",
    };

  //   let fd = hmFS.openSync({ path: "assets://icon.png", flag: hmFS.O_RDONLY })
  //   let buf = new Uint8Array(10).buffer
  //   hmFS.readSync({fd, buffer: buf})

  //   console.log("end test");

  // TODO  end test

  let code = hmFS.openSync({ path, flag: hmFS.O_RDONLY });
  if (code < 0) {
    return {
      isHzpk: false,
      error: "打开 hzpk 失败",
    };
  }

  let headLen = head_magic.length + head_version.length;
  let buffer = new ArrayBuffer(headLen);
  let buf_view = new Uint8Array(buffer);
  let len = hmFS.readSync({
    fd: code,
    buffer,
    options: { length: headLen },
  });
  //   hmFS.closeSync({ fd: code });
  if (len !== headLen) {
    hmFS.closeSync({ fd: code });
    return {
      isHzpk: false,
      error: `无效的 hzpk（头长度不匹配，应为 ${headLen}，实际为 ${len}，buffer：${buffer.toString()}）`,
    };
  }

  let offset = 0;
  // test magic
  for (let i = 0; i < head_magic.length; i++) {
    if (buf_view[i + offset] !== head_magic[i]) {
      hmFS.closeSync({ fd: code });
      return {
        isHzpk: false,
        error: `无效的 hzpk（magic 不匹配, 位置 ${offset}, buffer[${
          i + offset
        }]=${buf_view[i + offset]}, head_magic[${i}]=${
          head_magic[i]
        }, 应为 ${Buffer.from(
          head_magic.buffer
        ).toString()}, 实际为 ${Buffer.from(
          buffer.slice(offset, offset + head_magic.length)
        ).toString()}）`,
      };
    }
  }
  offset += head_magic.length;
  // test version
  for (let i = 0; i < head_version.length; i++) {
    if (buf_view[i + offset] !== head_version[i]) {
      hmFS.closeSync({ fd: code });
      return {
        isHzpk: false,
        error: `不支持该版本的 hzpk`,
      };
    }
  }
  offset += head_version.length;

  // read info
  let info_len = readNumber(path, offset);
  offset += calcNumberBytes(info_len);

  let info_buf = new ArrayBuffer(info_len);
  len = hmFS.readSync({
    fd: code,
    buffer: info_buf,
    options: { position: offset, length: info_len },
  });
  if (len !== info_len) {
    hmFS.closeSync({ fd: code });
    return {
      isHzpk: false,
      error: "hzpk 包信息长度不完整",
    };
  }
  let info;
  try {
    info = JSON.parse(Buffer.from(info_buf).toString());
  } catch (error) {
    hmFS.closeSync({ fd: code });
    return {
      isHzpk: false,
      error: "hzpk 包信息解析失败",
    };
  }
  offset += info_len;

  // test info version
  if (info.version !== info_version) {
    hmFS.closeSync({ fd: code });
    return {
      isHzpk: false,
      error: "不支持该版本的 hzpk 信息",
    };
  }

  hmFS.closeSync({ fd: code });
  return {
    isHzpk: true,
    info,
    offset,
  };
}

export function unpackHzpk_v1({
  hzpk_path,
  target_dir,
  offset,
  files_info,
  onProgress,
}) {
  // test if target dir exists
  if (hmFS.readdirSync({ path: target_dir })?.length > 0) {
    // throw new Error("目标目录不为空");
    clearDir(target_dir);
  }
  if (hmFS.readdirSync({ path: target_dir }) == undefined) {
    hmFS.mkdirSync({ path: target_dir });
  }

  let code = hmFS.openSync({ path: hzpk_path, flag: hmFS.O_RDONLY });
  if (code < 0) {
    throw new Error("打开 hzpk 失败");
  }

  function traverseDir(files_info, dir) {
    for (let file in files_info) {
      let file_info = files_info[file];
      if (file_info.isDirectory) {
        if (hmFS.readdirSync({ path: path.join(dir, file) }) === undefined) {
          hmFS.mkdirSync({ path: path.join(dir, file) });
        }
        traverseDir(file_info.files_info, path.join(dir, file));
      } else {
        let file_path = path.join(dir, file);
        let buffer = new ArrayBuffer(file_info.size);
        let buf_view = new Uint8Array(buffer);
        hmFS.readSync({
          fd: code,
          buffer,
          options: {
            position: offset + file_info.offset,
            length: file_info.size,
          },
        });
        hmFS.writeFileSync({ path: file_path, data: buffer });
        // if (onProgress) {
        //   onProgress();
        // }
      }
    }
  }

  traverseDir(files_info, target_dir);

  hmFS.closeSync({ fd: code });
}

/**
 * 从 offset 开始循环，直到读取的字节不是 127，然后将循环过的字节的数字加起来
 * @param {*} buffer
 * @param {*} offset
 */
function readNumber(path, offset) {
  let code = hmFS.openSync({ path });
  let len = hmFS.statSync({ path })?.size;
  if (code < 0 || len === undefined) {
    return -1;
  }

  let sum = 0;
  let buffer = new ArrayBuffer(1);
  let buf_view = new Uint8Array(buffer);
  for (let p = offset; ; p++) {
    if (p >= len) {
      hmFS.closeSync({ fd: code });
      return -2;
    }
    hmFS.readSync({ fd: code, buffer, options: { position: p, length: 1 } });
    sum += buf_view[0];
    if (buf_view[0] !== 255) break;
  }
  return sum;
}

function calcNumberBytes(number) {
  if (number < 0) throw Error("calc number bytes must be >= 0");
  return Math.floor(number / 255) + 1;
}

function isFileSync({ path }) {
  let code = hmFS.openSync({ path });
  if (code >= 0) {
    hmFS.closeSync({ fd: code });
    return true;
  } else {
    return false;
  }
}

export function clearDir(target_path) {
  if (isFileSync({ path: target_path })) {
    hmFS.rmSync({ path: target_path });
  } else {
    for (let file of hmFS.readdirSync({ path: target_path })) {
      clearDir(path.join(target_path, file));
    }
  }
}

const hzpk_list_path = "data://hzpk_list.json";
export function getHzpkList() {
  let hzpk_list = [];
  if (!isFileSync({ path: hzpk_list_path })) {
    hmFS.writeFileSync({
      path: hzpk_list_path,
      data: JSON.stringify(hzpk_list),
    });
  } else {
    hzpk_list = JSON.parse(
      hmFS.readFileSync({ path: hzpk_list_path, options: { encoding: "utf8" } })
    );
  }

  return hzpk_list;
}
export function addHzpk(hzpk) {
  let hzpk_list = getHzpkList();
  // place in the first place
  hzpk_list.unshift(hzpk);
  hmFS.writeFileSync({
    path: hzpk_list_path,
    data: JSON.stringify(hzpk_list),
  });
}

export function removeHzpkByUuid(uuid) {
// remove from hzpk list and clear the hzpk dir
  let hzpk_list = getHzpkList();
  for (let i = 0; i < hzpk_list.length; i++) {
    if (hzpk_list[i].uuid === uuid) {
      let hzpk = hzpk_list.splice(i, 1)[0];

      clearDir(hzpk.dir);
      hmFS.writeFileSync({
        path: hzpk_list_path,
        data: JSON.stringify(hzpk_list),
        options: { encoding: "utf8" },
      });
      break;
    }
  }
}
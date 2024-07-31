import { Buffer } from "node:buffer";
import { readFileSync, writeFileSync } from "node:fs";
const head_magic = Uint8Array.from("HZENGINE-PACKAGE!", (ch) =>
  ch.charCodeAt(0)
);
const head_version = Uint8Array.from([1, 0, 0]);
export function buildHeader_v1(head_info_json) {
  let buffer = new Uint8Array(0);
  // magic
  buffer = Buffer.concat([buffer, head_magic]);
  // version
  buffer = Buffer.concat([buffer, head_version]);
  // write info length
  let info_buf = Buffer.from(JSON.stringify(head_info_json));
  let info_len = info_buf.length;
  buffer = Buffer.concat([
    buffer,
    writeNumber(new Uint8Array(calcNumberBytes(info_len)), 0, info_len),
  ]);
  // write info
  buffer = Buffer.concat([buffer, info_buf]);
  return buffer;
}

/**
 *
 * @param {Buffer} buffer
 * @returns
 */
export function isHeader_v1(buffer) {
  if (buffer.length < 9) return false;
  let offset = 0;
  // test magic
  for (let i = 0; i < head_magic.length; i++) {
    if (buffer[i + offset] !== head_magic[i]) return false;
  }
  offset += head_magic.length;
  // test version
  for (let i = 0; i < head_version.length; i++) {
    if (buffer[i + offset] !== head_version[i]) return false;
  }
  offset += head_version.length;
  return true;
}

/**
 *
 * @param {Buffer} buffer
 * @returns
 */
export function tryReadInfo_v1(buffer) {
  if (!isHeader_v1(buffer)) throw new Error("not a hzpk v1 header");
  let offset = head_magic.length + head_version.length;
  let info_len = readNumber(buffer, offset);
  offset += calcNumberBytes(info_len);
  let info_buf = buffer.subarray(offset, offset + info_len);
  offset += info_len;
  let info = JSON.parse(info_buf.toString());
  // console.log(info);
  return {length: offset, info};
}



/**
 * 从 offset 开始循环，直到读取的字节不是 127，然后将循环过的字节的数字加起来
 * @param {*} buffer
 * @param {*} offset
 */
export function readNumber(buffer, offset) {
  let sum = 0;
  for (let i = offset; i < buffer.length; i++) {
    sum += buffer[i];
    if (buffer[i] !== 255) break;
  }
  return sum;
}

/**
 * 规则同上,但是是写数字。写入的字节数不确定
 * @param {Buffer} buffer
 * @param {*} offset
 * @param {*} number
 * @returns 返回buffer
 */
export function writeNumber(buffer, offset, number) {
  if (number < 0) throw new Error("write number must be >= 0");
  for (let i = offset; i < buffer.length; i++) {
    if (number == 255) {
      buffer[i] = 255;
      if (i + 1 < buffer.length) buffer[i + 1] = 0;
      else throw new Error("write number overflow");
      return buffer;
    }
    buffer[i] = number >= 255 ? 255 : number;
    number = number - (number >= 255 ? 255 : number);
    if (number == 0) return buffer;
  }
  throw new Error("write number overflow");
}

export function calcNumberBytes(number) {
  if (number < 0) throw new Error("calc number bytes must be >= 0");
  return Math.floor(number / 255) + 1;
}

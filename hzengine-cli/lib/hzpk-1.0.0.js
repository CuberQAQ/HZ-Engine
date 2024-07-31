import { existsSync, readFileSync, writeFileSync } from "fs";
import { packProjectFiles_v1, buildInfo_v1, isInfo_v1, unpackProjectFiles_v1 } from "./hzpk-compress-1.0.0.js";
import { buildHeader_v1, isHeader_v1, tryReadInfo_v1 } from "./hzpk-header-1.0.0.js";

export function buildHzpk_v1({ name, author, description, version, root_dir }) {
    // build files info
    const { buffer, files_info ,} = packProjectFiles_v1( root_dir );
    // build header
    const header = buildHeader_v1(buildInfo_v1({ name, author, description, version, files_info  }));
    // concat header and body
    return Buffer.concat([header, buffer]);
}

export function isHzpk_v1(buffer) {
    return isHeader_v1(buffer) && isInfo_v1(tryReadInfo_v1(buffer).info);
}

/**
 * 
 * @param {Buffer} buffer 
 * @param {*} target_dir 
 */
export function unpackHzpk_v1(buffer, target_dir) {
    if(!isHzpk_v1(buffer)) throw new Error("not a hzpk v1");
    let {length: info_length, info} = tryReadInfo_v1(buffer);
    if(existsSync(target_dir)) {
        throw new Error("target_dir is exists");
    }

    // unpack files
    let files_buffer = buffer.subarray(info_length);
    unpackProjectFiles_v1(info.data.files_info, files_buffer, target_dir);
}


import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import path from "path";

const info_version = "1.0.0";
export function buildInfo_v1({
  name,
  uuid,
  author,
  description,
  version,
  files_info,
}) {
  return {
    version: info_version,
    data: {
      name,
      uuid,
      author,
      description,
      version,
      files_info,
    },
  };
}

export function packProjectFiles_v1(root_dir) {
  let total_size = 0;
  let offset = 0;
  if (!root_dir) {
    throw new Error("root_dir is required");
  }
  if (!existsSync(root_dir)) {
    throw new Error("root_dir is not exists");
  }
  // 遍历目录
  function traverseDirInfo(dir) {
    let files_info = {};
    let dir_files = readdirSync(dir);
    for (let i = 0; i < dir_files.length; i++) {
      let file = dir_files[i];
      let file_path = path.join(dir, file);
      if (statSync(file_path).isDirectory()) {
        files_info[file] = {
          isDirectory: true,
          files_info: traverseDirInfo(file_path),
        };
      } else {
        // write into buffer
        let file_size = statSync(file_path).size;
        total_size += file_size;
        files_info[file] = {
          isDirectory: false,
          size: file_size,
        };
      }
    }
    return files_info;
  }
  let files_info = traverseDirInfo(root_dir)

  let buffer = Buffer.alloc(total_size);

  // 遍历info
  function traverseDir(files_info, dir) {
    for (let file in files_info) {
      let file_info = files_info[file];
      if (file_info.isDirectory) {
        traverseDir(file_info.files_info, path.join(dir, file));
      } else {
        let file_path = path.join(dir, file);
        readFileSync(file_path).copy(buffer, offset);
        files_info[file].offset = offset;
        offset += file_info.size;
      }
    }
  }

  traverseDir(files_info, root_dir);

  return { buffer, files_info };
}

export function unpackProjectFiles_v1(files_info, buffer, root_dir) {
  console.log(files_info, buffer, root_dir);
  if(!existsSync(root_dir)){
    mkdirSync(root_dir);
  }
  function traverseDir(files_info, dir) {
    for (let file in files_info) {
      let file_info = files_info[file];
      if (file_info.isDirectory) {
        if(!existsSync(path.join(dir, file))){
          mkdirSync(path.join(dir, file));
        }
        traverseDir(file_info.files_info, path.join(dir, file));
      } else {
        let file_path = path.join(dir, file);
        writeFileSync(file_path, buffer.slice(file_info.offset, file_info.offset + file_info.size));
      }
    }
  }

  traverseDir(files_info, root_dir);
}

export function isInfo_v1(info) {
  return info.version === info_version;
}
import * as hmApp from "@zos/app";
import * as hmFS from "@zos/fs";
import Path from "@cuberqaq/path-polyfill";
function getAppDir(appId = (hmApp.getPackageInfo() as any).appId) {
  let str = appId.toString(16);
  switch (str.length) {
    case 1:
      return `0000000${str}`.toUpperCase();
    case 2:
      return `000000${str}`.toUpperCase();
    case 3:
      return `00000${str}`.toUpperCase();
    case 4:
      return `0000${str}`.toUpperCase();
    case 5:
      return `000${str}`.toUpperCase();
    case 6:
      return `00${str}`.toUpperCase();
    case 7:
      return `0${str}`.toUpperCase();
    case 8:
      return `${str}`.toUpperCase();
  }
}

export function readdirAssetsSync(option: {
  path: string;
}): string[] | undefined {
  return hmFS.readdirSync({
    path: fromDataToAssetsPath(option.path),
  });
}

export function isFileDataSync(option: { path: string }) {
  let code = hmFS.openSync({ path: option.path });
  if (code >= 0) {
    hmFS.closeSync({ fd: code });
    return true;
  } else {
    return false;
  }
}

export function isFileAssetsSync(option: { path: string }) {
  // console.log("path=" + option.path);

  let code = hmFS.openAssetsSync({ path: option.path });
  if (code >= 0) {
    hmFS.closeSync({ fd: code });
    return true;
  } else {
    return false;
  }
}

/**
 * 将基于assets的文件路径转换为基于data的文件路径
 */
function fromDataToAssetsPath(path: string) {
  return Path.join(`../../${getAppDir()}/assets`, path);
}

export function writeFileAssetsSync(opt: {
  path: string;
  data: string | ArrayBuffer | DataView;
  options?: hmFS.writeFileSync.Options;
}) {
  // console.log("write path="+opt.path);
  let fd = hmFS.openAssetsSync({path: opt.path, flag: hmFS.O_WRONLY | hmFS.O_CREAT})
  if(fd < 0) throw "Open Assets File Failed code="+fd
  let buf = opt.data
  if(buf instanceof DataView) {
    buf = buf.buffer // TODO maybe error
  }
  if(typeof buf === 'string') buf = Buffer.from(buf).buffer
  
  let res = hmFS.writeSync({
    fd,
    buffer: buf,
  })
  hmFS.closeSync({fd})
  return res
}

export function readFileAssetsSync(opt: {
  path: string;
  options?: hmFS.readFileSync.Options;
}) {
  // console.log("read path="+opt.path);
  let fd = hmFS.openAssetsSync({path: opt.path, flag: hmFS.O_RDONLY})
  if(fd < 0) throw "Open Assets File Failed code="+fd
  let size = hmFS.statAssetsSync({path: opt.path})!.size
  let arrbuf = new ArrayBuffer(size)
  hmFS.readSync({fd, buffer: arrbuf})
  hmFS.closeSync({fd})
  if(opt.options && typeof opt.options.encoding === 'string') {
    return Buffer.from(arrbuf).toString(opt.options.encoding)
  } 
  else {
    return arrbuf
  }
}

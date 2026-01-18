/* eslint-disable @typescript-eslint/no-unused-vars */
import { ipcRenderer, contextBridge, } from "electron";
import fs from "fs";
import path from "path";
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  sendSync(...args: any[]) {
    return ipcRenderer.sendSync(args[0], ...args.slice(1));
  },
});

contextBridge.exposeInMainWorld("fs", {
  readFileSync: (path: string, options?: any) => {
    const result = fs.readFileSync(path, options);
    if (Buffer.isBuffer(result)) {
      return result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
    }
    return result;
  },
  readdirSync: (path: string) => fs.readdirSync(path),
  statSync: (path: string) => {
    const stats = fs.statSync(path);
    return {
      isFile: () => stats.isFile(),
      isDirectory: () => stats.isDirectory(),
      size: stats.size,
    };
  },
  writeFileSync: (path: string, data: any, options?: any) => fs.writeFileSync(path, data, options),
  existsSync: (path: string) => fs.existsSync(path),
  mkdirSync: (path: string, options?: any) => fs.mkdirSync(path, options),
  unlinkSync: (path: string) => fs.unlinkSync(path),
});

contextBridge.exposeInMainWorld("path", {
  join: (...args: string[]) => path.join(...args),
  dirname: (p: string) => path.dirname(p),
  basename: (p: string) => path.basename(p),
  resolve: (...args: string[]) => path.resolve(...args),
});

contextBridge.exposeInMainWorld("isFile", (path: string) => {
  try {
    const stat = fs.statSync(path);
    return stat.isFile();
  } catch (e) {
    return false;
  }
});
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

  // You can expose other APTs you need here.
  // ...
});

contextBridge.exposeInMainWorld("fs", fs);
contextBridge.exposeInMainWorld("isFile", (path: string) => {
  try {
    const stat = fs.statSync(path);
    return stat.isFile();
  } catch (e) {
    return false;
  }
});
// contextBridge.exposeInMainWorld("openProject", () => {
//   return dialog.showOpenDialog({
//     properties: ["openDirectory"],
//   })
// })
import { BaseSideService } from "@zeppos/zml/base-side";
import { gettext } from "i18n";
/// <reference path="../node_modules/@zeppos/zml/zml.d.ts" />
const logger = Logger.getLogger("hzengine-app-side");
let downloadLock = false
let lockId = 1000
AppSideService(
  BaseSideService({
    onInit() {
      console.log(gettext("example"));
    },

    onRun() {},

    onDestroy() {},

    onCall({ method, params }) {},
    onRequest(req, res) {
      if (req.method === "device.init") {
        res(null, { status: "OK" });
      }
      else if (req.method === "redownload") {
        settings.settingsStorage.setItem("download.url", 
          settings.settingsStorage.getItem("download.url")
        )
        res(null, {status: "OK"})
      }
      else {
        res("Unsupported request method: " + req.method);
      }
    },

    log(...args) {
      logger.log(...args);
      this.call({
        method: "log",
        params: { args },
      });
    },

    onReceivedFile(fileObj) {},

    onSettingsChange({ key, oldValue, newValue }) {
      this.log("onSettingsChange", key, oldValue, newValue);
      if (key === "download.url") {
        if (!newValue) return;
        this.log("download.url changed from " + oldValue + " to " + newValue);
        if(downloadLock) {
          this.log("downloadTest LOCKED, download cancelled");
          return
        }
        this.call({
          method: "download",
          params: {
            url: newValue,
          },
        });
        // // data://download/logo.png
        // this.settings.setItem("download.app_side.condition", "DOWNLOADING");
        this.call({
          method: "download.app_side.condition",
          params: { data: "DOWNLOADING" },
        });
        // settings.settingsStorage.setItem("download.app_side.progress", "0");
        this.call({
          method: "download.app_side.progress",
          params: { data: "0" },
        });
        
        let task = this.download(newValue, {
          headers: {},
          timeout: 6000,
        });

        downloadLock = true
        let lock_id = ++lockId
        setTimeout(() => {
          if(downloadLock && lock_id === lockId) {
            this.log("download timeout, download cancelled, unlock");
            downloadLock = false
          }
        }, 5000)
        this.log("downloadTest locked");

        task.onSuccess = (data) => {
          this.log("downloadTest success", JSON.stringify(data));
          // settings.settingsStorage.setItem(
          //   "download.app_side.condition",
          //   "TRANSFERING_TO_DEVICE"
          // );
          this.call({
            method: "download.app_side.condition",
            params: { data: "TRANSFERING_TO_DEVICE" },
          });
          // transfer to device
          this.sendFile(data.filePath, {});
        };

        task.onFail =(data)=> {
          this.log("downloadTest fail", JSON.stringify(data));
          // settings.settingsStorage.setItem(
          //   "download.app_side.condition",
          //   "FAILED"
          // );
          this.call({
            method: "download.app_side.condition",
            params: { data: "FAILED", err: JSON.stringify(data) },
          });
        };

        task.onComplete =  ()=> {
          downloadLock = false
          this.log("downloadTest complete, unlock");
        };

        task.onProgress = (data) => {
          // this.log("downloadTest progress", JSON.stringify(data));
          // settings.settingsStorage.setItem(
          //   "download.app_side.progress",
          //   "" + data.progress
          // );
          this.call({
            method: "download.app_side.progress",
            params: { data: "" + data.progress },
          });
        };

        return task;
      }
    },
  })
);

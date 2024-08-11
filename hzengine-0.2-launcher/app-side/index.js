import { BaseSideService } from "@zeppos/zml/base-side";
import { gettext } from "i18n";
/// <reference path="../node_modules/@zeppos/zml/zml.d.ts" />
const logger = Logger.getLogger("hzengine-app-side");
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
      } else {
        res("Unsupported request method: " + req.method);
      }
    },

    onReceivedFile(fileObj) {},

    onSettingsChange({ key, oldValue, newValue }) {
      if (key === "download.url") {
        if (!newValue) return;
        console.log(
          "download.url changed from " + oldValue + " to " + newValue
        );
        this.call({
          method: "download",
          params: {
            url: newValue,
          },
        });
        // // data://download/logo.png
        this.settings.setItem("download.app_side.condition", "DOWNLOADING");
        this.call({
          method: "download.app_side.condition",
          params: { data: "DOWNLOADING" },
        });
        settings.settingsStorage.setItem("download.app_side.progress", "0");
        this.call({
          method: "download.app_side.progress",
          params: { data: "0" },
        });
        let task = this.download(newValue, {
          headers: {},
          timeout: 6000,
        });

        task.onSuccess = (data) => {
          logger.log("downloadTest success", data);
          settings.settingsStorage.setItem(
            "download.app_side.condition",
            "TRANSFERING_TO_DEVICE"
          );
          this.call({
            method: "download.app_side.condition",
            params: { data: "TRANSFERING_TO_DEVICE" },
          });
          // transfer to device
          this.sendFile(data.filePath, {});
        };

        task.onFail = function (data) {
          logger.log("downloadTest fail", data);
          settings.settingsStorage.setItem(
            "download.app_side.condition",
            "FAILED"
          );
          this.call({
            method: "download.app_side.condition",
            params: { data: "FAILED" },
          });
        };

        task.onComplete = function () {};

        task.onProgress = (data) => {
          logger.log("downloadTest progress", data);
          settings.settingsStorage.setItem(
            "download.app_side.progress",
            "" + data.progress
          );
          // this.call({
          //   method: "download.app_side.progress",
          //   params: { data: "" + data.progress },
          // });
        };

        return task;
      }
    },
  })
);

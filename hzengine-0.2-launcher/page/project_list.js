import { BaseSideService } from "@zeppos/zml/base-side";

AppSideService(
  BaseSideService({
    onInit() {},
    onRun() {},
    getDataFromDevice() {
      return this.request({
        method: "your.method2",
        params: {
          param1: "param1",
          param2: "param2",
        },
      })
        .then((result) => {
          // receive your data
          console.log("result=>", result);
        })
        .catch((error) => {
          // receive your error
          console.error("error=>", error);
        });
    },

    notifyDevice() {
      this.call({
        method: "your.method4",
        params: {
          param1: "param1",
          param2: "param2",
        },
      });
    },

    onRequest(req, res) {
      // need reply
      // node style callback
      // first param is error
      // second param is your data
      if (req.method === "your.method1") {
        // do something
        res(null, {
          test: 1,
        });
      } else {
        res("error happened");
      }
    },

    onCall(data) {
      // no reply
      if (req.method === "your.method3") {
        // do something
      }
    },
    onDestroy() {},
  })
);

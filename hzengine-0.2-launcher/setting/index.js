var styleViewCard = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "stretch",
  width: "100%",
  height: "100%",
  background: "#ffffff",
  borderRadius: "10px",
  padding: "10px",
  boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
};

AppSettingsPage({
  // 1. Define state
  state: {
    testKey: null,
    showTextInput: false,
  },
  build(props) {
    // 2. Get SettingsStorage
    this.getStorage(props);

    // 3. Logic
    const toggleButtonMap = {
      ["Hello Zepp OS2"]: "Hello World",
      ["Hello World"]: "Hello Zepp OS2",
    };

    // 4. Return Render Function
    return View(
      {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: "#F5F5F5",
          padding: "10px",
        },
      },
      [
        View({ style: styleViewCard }, [
          Text(
            {
              style: {
                fontSize: "18px",
                fontWeight: "bold",
                textAlign: "center",
              },
            },
            "HZ Engine 启动器"
          ),
          Text(
            {
              style: {
                fontSize: "14px",
                textAlign: "center",
              },
            },
            ["Version 0.2.0 ©CuberQAQ"]
          ),
        ]),
        View({
          style: {
            height: "10px",
          },
        }),
        View(
          {
            style: styleViewCard,
          },
          [
            Text(
              {
                style: {
                  fontSize: "18px",
                  fontWeight: "bold",
                  textAlign: "center",
                },
              },
              "通过直链安装 HZPK 包"
            ),
            Text(
              {
                style: {
                  // fontSize: "14px",
                  // textAlign: "center",
                },
              },
              ["操作说明："]
            ),
            Text(null, [
              "1. 在视觉小说项目中使用 hze pack 将项目打包为 hzpk 包",
            ]),
            Text(null, ["2. 将 hzpk 包上传到支持直链的网盘，获取直链链接"]),
            View({
              style: {
                height: "10px",
              },
            }),
            TextInput({
              label: "输入链接",
              labelStyle: {
                display: "inline-block",
                padding: "0 16px",
                height: "36px",
                lineHeight: "36px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#1e88e5", // 主按钮颜色
                color: "white",
                fontSize: "14px",
                fontWeight: "500",
                textTransform: "uppercase",
                textAlign: "center",
                cursor: "pointer",
                transition: "background-color 0.3s, box-shadow 0.3s",
                boxShadow: "0 2px 2px rgba(0, 0, 0, 0.2)",
                ":hover": {
                  backgroundColor: "#1565c0", // 悬停时的颜色
                },
                ":active": {
                  backgroundColor: "#1565c0", // 按下时的颜色
                  boxShadow: "0 4px 4px rgba(0, 0, 0, 0.2)",
                },
                ":disabled": {
                  backgroundColor: "#9e9e9e",
                  cursor: "not-allowed",
                  boxShadow: "none",
                },
              },
              disabled: false,
              placeholder: "请输入 hzpk 的直链链接",
              settingsKey: "download.url",
              onChange(value) {
                props.settingsStorage.setItem("download.url", value);
              },
            }),
            View({
              style: {
                height: "10px",
              },
            }),
            Text(
              {
                style: {
                  // fontSize: "14px",
                  textAlign: "center",
                },
              },
              [this.state.download_appside_condition ?? "等待下载"]
            ),
            // Button({
            //   label: this.state.testKey,
            //   style: {
            //     fontSize: "12px",
            //     borderRadius: "30px",
            //     background: "#D85E33",
            //     color: "white",
            //     width: "100%",
            //   },
            //   onClick: () => {
            //     // 5. Modify the data in settingsStorage in the callback function of the event
            //     props.settingsStorage.setItem(
            //       "testKey",
            //       toggleButtonMap[this.state.testKey]
            //     );
            //     // return TextInput({})
            //     props.settingsStorage.setItem(
            //       "showTextInput",
            //       this.state.showTextInput ? "false" : "true"
            //     );
            //   },
            // }),
          ]
        ),
      ]
    );
  },
  getStorage(props) {
    this.state.testKey =
      props.settingsStorage.getItem("testKey") || "Hello World";
    this.state.showTextInput =
      props.settingsStorage.getItem("showTextInput") === "true";
    this.download_appside_condition = props.settingsStorage.getItem(
      "download.app_side.condition"
    );
  },
});

var CardViewStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "stretch",
  width: "100%",
  height: "100%",
  background: "#ffffff",
  borderRadius: "10px",
  padding: "10px",
  boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
};

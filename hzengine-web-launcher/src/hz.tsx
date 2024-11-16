import { HZEngineCore } from "hzengine-core";

export default function HZ(props: {
  projectPath: string;
  cachePath: string;
  savePath: string;
}) {
  const hzengine = new HZEngineCore({
    name: "web.launcher",
    getScreenSize: () => {
      return [window.innerWidth, window.innerHeight];
    },
    createUILayer({ z_index }) {
      return {
        createWidget(widgetType, option) {
          return {
            type: widgetType,
            option,
            z_index,
          };
        },
        deleteWidget(widget) {
          if (widget) {
            widget.destroy();
          }
        },
      };
    },
    deleteUILayer(widgetFactory) {
      //   (widgetFactory as any).destroy();
      console.log(`widgetFactory`, widgetFactory);
    },
    
  });

  // 创建HZEngineCore实例

  // 加载ViewPlugin插件，定义其HZEngine中的插件名字为views
  // 这个插件注册了say，fg_img，bg_img，menu，title，quick_menu等常用页面组件(view)
  // 该实例项目的view文件夹就是这个ViewPlugin插件的根目录，
  // 你可以添加自己的页面组件，也可以修改view文件夹已有的页面组件
  // hzengine.loadPlugin("views", ViewPlugin);
  // hzengine.loadPlugin("black_trans", BlackTrans);

  // 加载游戏项目，这里的"raw/project"是项目的根文件夹（相对于assets文件夹）
  hzengine.loadProject({
    projectPath: props.projectPath,
    cachePath: props.cachePath,
    savePath: props.savePath,
  });

  // 在模拟器将电量设置为0，就會認定是模拟器环境
  // 这是为了方便测试。一旦认定为模拟器环境，在hzs脚本中以[REAL]开头的命令会被忽略
  // let isEmulator = current === 0;
  (hzengine.storage.gd as Record<string, boolean>).realEnv = false;
  // console.log(`当前电量为${current}%，是否认定为模拟器:${isEmulator}`);

  // 启动HZEngine
  // 这里是异步操作，意味着页面的渲染将在下一刻才执行
  hzengine.start();
  return <></>;
}

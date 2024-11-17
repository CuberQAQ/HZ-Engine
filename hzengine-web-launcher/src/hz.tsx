import { HZEngineCore } from "hzengine-core";
import { HZEnginePlatformWeb } from "./hzengine/hzengine-platform-web";
import {} from "pixi.js";
import { Container, Graphics, Stage } from "@pixi/react";
import { useEffect, useRef } from "react";
import { Button } from "@pixi/ui";

// init pixi.js
// const app = new Application();
// await app.init({ width: 640, height: 360 });
// document.body.appendChild(app.canvas);

// Create the sprite and add it to the stage
// await PIXI.Assets.load('sample.png');
// const sprite = PIXI.Sprite.from('sample.png');
// app.stage.addChild(sprite);

export default function HZ(props: {
  projectPath: string;
  cachePath: string;
  savePath: string;
}) {
  return (
    <Stage
      width={480}
      height={480}
      onMount={async (app) => {
        // // 创建HZEngineCore实例
        // // 加载ViewPlugin插件，定义其HZEngine中的插件名字为views
        // // 这个插件注册了say，fg_img，bg_img，menu，title，quick_menu等常用页面组件(view)
        // // 该实例项目的view文件夹就是这个ViewPlugin插件的根目录，
        // // 你可以添加自己的页面组件，也可以修改view文件夹已有的页面组件
        // // hzengine.loadPlugin("views", ViewPlugin);
        // // hzengine.loadPlugin("black_trans", BlackTrans);
        // // // 加载游戏项目，这里的"raw/project"是项目的根文件夹（相对于assets文件夹）
        // const hzengine = new HZEngineCore(HZEnginePlatformWeb(app));
        // console.warn(
        //   `[HZEngine] Restart to load project: ${props.projectPath}`
        // );
        // hzengine.loadProject({
        //   projectPath: props.projectPath,
        //   cachePath: props.cachePath,
        //   savePath: props.savePath,
        // });
        // // 在模拟器将电量设置为0，就會認定是模拟器环境
        // // 这是为了方便测试。一旦认定为模拟器环境，在hzs脚本中以[REAL]开头的命令会被忽略
        // // let isEmulator = current === 0;
        // (hzengine.storage.gd as Record<string, boolean>).realEnv = false;
        // // console.log(`当前电量为${current}%，是否认定为模拟器:${isEmulator}`);
        // // 启动HZEngine
        // // 这里是异步操作，意味着页面的渲染将在下一刻才执行
        // hzengine.start();
      }}
    >
      <Graphics
        draw={(g) => {
          g
            .beginFill(0x000000)
            .lineStyle(1, 0x00ff00)
            .drawRect(120, 120, 240, 240);
          const button = new Button(g);
          button.onPress.connect(() => console.log("Button pressed!"));
          return g
        }}
      />
    </Stage>
  );
}

// Add a ticker callback to move the sprite back and forth
// let elapsed = 0.0;
// app.ticker.add((ticker) => {
//   elapsed += ticker.deltaTime;
//   sprite.x = 100.0 + Math.cos(elapsed/50.0) * 100.0;
// });

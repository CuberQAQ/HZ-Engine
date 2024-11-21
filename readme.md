项目文件夹简介
- `hzengine-0.1.0-launcher`: 1.0启动器（已经成为文物）
- `hzengine-0.2-launcher`: 2.0启动器，支持直链下载更新游戏和游戏管理
- `hzengine-web-launcher`: web 端启动器，目前为空壳。用 vite 构建
- `demo`: 用于一些新功能的快速演示
    - `hello-hzengine`: 一个 HZ-Engine 项目结构的 demo，是一个完整的小游戏（如果算游戏的话）
    - `watch_app`: 一个 ZeppOS 小程序项目，可以独立运行 assets/raw/project 下的游戏，用于演示和测试一些新功能
    - `watch_app2`: 一个 ZeppOS 小程序项目，草稿箱，想干啥都行
- `hzengine-cli`: HZ-Engine CLI 脚手架，对应 npm 上发布的 hzengine-cli 包
- `hzengine-core`: HZ-Engine Core 引擎核心代码

## git clone 本项目后
运行以下命令获取asuka-ui子模块
```bash
git submodule init
git submodule update
```

## 开发环境：
每个有 package.json 的文件夹都应该执行
```bash
npm i
```
pnpm, yarn 等均可

### HZ-Engine ZeppOS Lacuncher 0.2
注意 view 和 plugin 文件夹里的ts代码需要分别用 tsc 构建（之后用构建工具自动化）

```bash
npm i
```
编译 jsx 文件：
```
rollup -c
```
如果无需编译 jsx， 则无需使用 rollup

即可直接用 zeus 打包 or 预览

### HZ-Engine Electron Launcher

#### electron 二进制包换源：
```sh
npm config edit
```
打开编辑器后，在空行添加：
```
electron_mirror=https://npmmirror.com/mirrors/electron/
```

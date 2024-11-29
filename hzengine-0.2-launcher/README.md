# HZ-Engine ZeppOS Launcher 0.2 
特性：
- 直链下载安装
- 多游戏管理
  
# 开发

## 安装依赖
```bash
npm i
```
or pnpm

## 使用 TypeScript
可用于写引擎插件、游戏内界面（游戏设置、存档页面）等
位于 lib 文件夹下. 请将源码写在src文件夹中。编译后会输出到dist文件夹中

### 编译
在 lib 文件夹中
```bash
tsc
```
即可编译ts

```bash
tsc --watch
```
可监听文件变化并自动重新编译



## 使用 AsukaUI JSX 
Asuka UI 目前用于写启动器而非游戏页面。包含直链下载、包管理等
jsx文件位于page文件夹下
### 编译
1. 删除page/hzpk_***.js
2. 运行
```bash
rollup -c
```
每个 jsx 文件都需要在`roll.config.js`中配置
即可将jsx编译成js文件
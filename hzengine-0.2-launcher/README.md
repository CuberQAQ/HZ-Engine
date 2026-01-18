# HZ-Engine ZeppOS Launcher 0.2 
特性：
- 直链下载安装
- 多游戏管理
  
# 开发

## 安装依赖

1. 安装 [pnpm](https://pnpm.io/installation)

2. 安装依赖
```bash
pnpm i
```

3. 配置 `asuka-ui`
- 拉取 `asuka-ui` submodule
```bash
git submodule update --init
```
- 在 `asuka-ui` 文件夹中安装依赖
```bash
cd asuka-ui
pnpm i
```

4. 配置 `hzengine-core`
- 在 `hzengine-core` 文件夹中安装依赖
```bash
cd hzengine-core
pnpm i
```

## 构建
```bash
pnpm build
```

监听变化：
```bash
pnpm build:watch
```

## 打包
```bash
zeus build
```


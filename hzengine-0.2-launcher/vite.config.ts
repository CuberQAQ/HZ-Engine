import { defineConfig } from "vite";
// @ts-ignore
import { resolve, dirname } from "path";
// @ts-ignore
import fs from "fs";
import solid from "vite-plugin-solid";
// @ts-ignore
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 自动扫描 src 下的所有 *.page.ts 文件
 * 并生成入口对象 { 'page/xxx.page': '/abs/path/to/src/xxx.page.ts' }
 */
function getPageEntries() {
  const dir = resolve("src");
  const files = fs.readdirSync(dir);
  const entries: Record<string, string> = {};
  for (const file of files) {
    if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx")) {
      const name = "page/" + file.replace(/\.[tj]sx?$/, ""); // 增加 page/ 前缀，如 page/index.page
      entries[name] = resolve(dir, file);
    }
  }
  return entries;
}

export default defineConfig(({ mode }) => {
  const isSimulator = mode === "development";

  return {
    define: {
      __SIMULATOR__: isSimulator,
    },
    plugins: [
      solid({
        solid: {
          moduleName: "@cuberqaq/asuka-ui/solid",
          generate: "universal",
        },
        babel: {},
      }),
    ],
    esbuild: {
      jsx: "automatic",
      jsxImportSource: "@cuberqaq/asuka-ui",
      treeShaking: true,
      // drop: isSimulator ? [] : ["console", "debugger"], // 实机打包时去掉 console
    },
    build: {
      outDir: ".", // 输出到根目录 (client/)
      rollupOptions: {
        input: {
          // app: resolve(__dirname, "app.tsx"), // 添加 app 入口
          ...getPageEntries(),
        },
        output: {
          entryFileNames: "[name].js", // [name] 包含路径，如 page/index.page.js
          format: "es",
          inlineDynamicImports: false,
          chunkFileNames: "shared/[name].chunk.js",
        },
        external: [
          /@zos\/.*/,
          /@cuberqaq\/asuka-lite(\/*)?/,
          /@cuberqaq\/asuka-ui-lite(\/*)?/,
          // /@cuberqaq\/asuka-ui(\/*)?/,
        ],
        treeshake: {
          moduleSideEffects: false,
        },
      },
      minify: !isSimulator, // 实机打包开启混淆
      emptyOutDir: false, // 不清空输出目录，避免删除源码
      target: "es2019",
    },
  };
});

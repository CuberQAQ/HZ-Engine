import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import esbuild from 'rollup-plugin-esbuild'
const config = {
  input: ["src/asuka_ui.tsx"],
  output: { dir: "dist", format: "esm", entryFileNames: `[name].js` },
  plugins: [
    nodeResolve({
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }),
    esbuild({
      tsconfig: "./tsconfig.json",
      jsx: "preserve"
    }),
    // typescript({ tsconfig: "./tsconfig.build.json", check: false }),
    babel({ include: ["src/**/*"], extensions: [".js", ".jsx", ".ts", ".tsx"], babelHelpers: "inline" }),
  ],
  treeshake: true,
  external: [/@zos\/.*/, /@cuberqaq\/./, "@cuberqaq/asuka-ui/solid", "@cuberqaq/asuka-ui"],
  exclude: ["node_modules"],
};

export default config;

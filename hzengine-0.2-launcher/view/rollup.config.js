import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import esbuild from 'rollup-plugin-esbuild'
// import "@rollup/plugin-multi-entry"
const config = {
  input: ["src/index.ts"],
  output: { dir: "dist", format: "esm", entryFileNames: `index.js` },
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
  external: [/@zos\/.*/, /@cuberqaq\/.*/, "@cuberqaq/asuka-ui/solid", "@cuberqaq/asuka-ui", "hzengine-core", "node_modules"],
};

export default config;

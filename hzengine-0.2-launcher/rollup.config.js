import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
const config = {
  input: ["page/transfer.jsx", "page/project_list.jsx"],
  output: { dir: "page", format: "esm", entryFileNames: `[name].js` },
  plugins: [nodeResolve(), , babel({ babelHelpers: "inline" })],
  external: [/@zos\/*/, /@zeppos\/*/],
  treeshake: true
};

export default config;

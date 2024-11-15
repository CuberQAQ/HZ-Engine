import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
const config = {
  input: ["page/transfer.jsx", "page/project_list.jsx"],
  output: { dir: "page" },
  plugins: [nodeResolve(), , babel()],
  external: [/@zos\/*/, /@zeppos\/*/],
};

export default config;

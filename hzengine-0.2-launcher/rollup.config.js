import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from 'rollup-plugin-typescript2'
const config = {
  input: ["page/transfer.jsx"],
  output: { dir: "page" },
  plugins: [nodeResolve(), babel()],
  external: [/@zos\/*/, /@zeppos\/*/],
};

export default config;

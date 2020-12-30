import packageJson from "./package.json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import del from "rollup-plugin-delete";
import html from "@rollup/plugin-html";
import postcss from "rollup-plugin-postcss";
import svg from "rollup-plugin-svg";
import replace from "@rollup/plugin-replace";
import gitRevSync from "git-rev-sync";
import execute from "rollup-plugin-execute";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "umd",
      name: "markreader",
      esModule: false,
      sourcemap: true
    },
    plugins: [
      del({
        targets: ["./dist/*"]
      }),
      replace({
        __VERSION__: JSON.stringify(packageJson.version),
        __COMMIT__: JSON.stringify(gitRevSync.short())
      }),
      html({
        title: "MarkReader"
      }),
      resolve(),
      commonjs({
        include: "node_modules/**"
      }),
      typescript({
        typescript: require("typescript")
      }),
      svg({
        base64: true
      }),
      postcss({
        extract: false,
        modules: false,
        inject: false,
        minimize: true,
        plugins: []
      }),
      terser({
        output: {
          comments: false
        }
      }),
      execute("npm run copy-to-docs")
    ]
  }
];

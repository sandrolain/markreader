import package from "./package.json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import del from "rollup-plugin-delete";
import html from "@rollup/plugin-html";
import postcss from "rollup-plugin-postcss";
import svg from "rollup-plugin-svg";
import replace from '@rollup/plugin-replace';
import gitRevSync from "git-rev-sync";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "umd",
      name: "wikidown",
      esModule: false,
      sourcemap: true
    },
    plugins: [
      // del({
      //   targets: ["./dist/*"]
      // }),
      html({
        title: "wikidown"
      }),
      resolve(),
      commonjs({
        include: 'node_modules/**'
      }),
      typescript({
        typescript: require("typescript")
      }),
      replace({
        __version__: package.version,
        __commit_: gitRevSync.short(),
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
      })
    ]
  }
];

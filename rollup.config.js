import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.browser,
      format: "umd",
      name: "Yzy_FrontendMonitor",
      exports: "named",
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        exclude: ["**/*.test.ts", "dist"],
      },
    }),
    terser(),
  ],
  external: [],
};

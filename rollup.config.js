import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "rollup-plugin-terser";

const pkg = await import("./package.json", { assert: { type: "json" } });

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.default.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.default.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.default.browser,
      format: "umd",
      name: "FrontendMonitor",
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
    terser.terser(),
  ],
  external: [],
};

/* eslint-env node */
import babel from "rollup-plugin-babel";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const commonTerserOptions = {
  timings: true,
  compress: {
    sequences: true,
    conditionals: true,
    evaluate: true,
    unsafe_arrows: true,
    warnings: true
  }
};

export default [
  {
    input: pkg.module,
    output: {
      file: "dist/yall.min.mjs",
      format: "esm"
    },
    plugins: [
      babel({
        presets: [
          [
            "@babel/preset-env", {
              targets: {
                esmodules: true
              },
              loose: true
            }
          ]
        ]
      }),
      terser({
        ecma: 8,
        mangle: {
          keep_fnames: true,
          toplevel: true,
          reserved: ["yall"],
          module: true
        },
        ...commonTerserOptions
      })
    ]
  },
  {
    input: pkg.module,
    output: {
      name: "yall",
      file: "dist/yall.min.js",
      format: "iife"
    },
    plugins: [
      babel({
        presets: [
          [
            "@babel/preset-env", {
              targets: ">0.5%, last 5 versions, ie > 10, not dead",
              loose: true
            }
          ]
        ]
      }),
      terser({
        ecma: 5,
        mangle: {
          keep_fnames: true,
          toplevel: true,
          reserved: ["yall"],
          module: false
        },
        ...commonTerserOptions
      })
    ]
  },
  {
    input: pkg.module,
    output: {
      file: pkg.main,
      format: "cjs"
    },
    plugins: [
      copy({
        "dist/yall.min.js": "test/js/yall.min.js",
        "dist/yall.min.mjs": "test/js/yall.min.mjs"
      })
    ]
  }
];

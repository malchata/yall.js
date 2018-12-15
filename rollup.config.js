import buble from "rollup-plugin-buble";
import { terser } from "rollup-plugin-terser";
const fs = require("fs");

const ver = JSON.parse(fs.readFileSync("./package.json", "utf8")).version;

const libIdent = "yall.js (v" + ver + ")";

export default [
	// non-minified build
	{
		input: "./src/yall.js",
		plugins: [
			buble(),
		],
		output: {
			banner: [
				"/**",
				" * " + libIdent,
				" * Yet Another Lazy loader",
				" * https://github.com/malchata/yall.js",
				" **/",
			].join("\n") + "\n",
			name: "window",
			extend: true,
			file: "./dist/yall.js",
			format: "iife",
			esModule: false,
		},
	},
	// minified build
	{
		input: "./src/yall.js",
		plugins: [
			buble(),
			terser({
				output: {
					comments: /^!/
				}
			}),
		],
		output: {
			banner: "/*! " + libIdent + " */",
			name: "window",
			extend: true,
			file: "./dist/yall.min.js",
			format: "iife",
			esModule: false,
		},
	},
]
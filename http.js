/* eslint-env node */
/* eslint no-console: "off" */

import { join } from "path";
import express from "express";
const app = express();
const htdocs = join(process.cwd(), "test");

// Run static server
app.use(express.static(htdocs));
app.listen(8080);

console.log("yall.js test up and running at http://localhost:8080/");
console.log("Press Ctrl+C to quit.");

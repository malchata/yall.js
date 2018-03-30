const path = require("path");
const express = require("express");
const app = express();
const htdocs = path.join(__dirname, "test");

// Run static server
app.use(express.static(htdocs));
app.listen(8080);

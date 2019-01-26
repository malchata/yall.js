/* eslint-env node */

"use strict";

module.exports = {
  presets: [
    [
      "@babel/preset-env", {
        targets: ">0.5%, last 5 versions, ie > 10, not dead",
        loose: true
      }
    ]
  ]
};

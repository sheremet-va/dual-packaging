const path = require("path");

module.exports = {
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "vite-example",
      fileName: (format) => `index.${format == "es" ? "mjs" : "js"}`,
    },
  },
};

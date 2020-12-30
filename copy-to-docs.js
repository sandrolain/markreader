const path = require("path");
const fs   = require("fs");

const distPath = path.resolve(__dirname, "dist");
const copyPath = path.resolve(__dirname, "docs");
const files    = ["index.html", "index.js", "index.js.map"];

for(const file of files) {
  fs.copyFileSync(
    path.resolve(distPath, file),
    path.resolve(copyPath, file)
  );
}

const fs = require("node:fs");
const path = require("node:path");

const outputDirectory = path.join(process.cwd(), "out");

function makeWritable(target) {
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) return;

  const ownerPermissions = stat.isDirectory() ? 0o700 : 0o600;
  fs.chmodSync(target, stat.mode | ownerPermissions);

  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target)) {
      makeWritable(path.join(target, entry));
    }
  }
}

if (fs.existsSync(outputDirectory)) {
  makeWritable(outputDirectory);
  fs.rmSync(outputDirectory, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  });
  console.log("Removed stale static export directory.");
}

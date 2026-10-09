import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Publication metadata only. No application or analytical behavior is changed.
const root = fileURLToPath(new URL("../", import.meta.url));
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const commit = git("rev-parse", "HEAD");
if (git("status", "--porcelain")) throw new Error("Commit source changes before stamping a release.");
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const source = createHash("sha256");
for (const path of git("ls-files", "-z").split("\0").filter(Boolean).sort()) {
  source.update(path + "\0");
  source.update(sha256(execFileSync("git", ["show", "HEAD:" + path], { cwd: root })) + "\n");
}
const directory = join(root, "dist/public");
const assets = {};
function walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name !== "release.json") assets[relative(directory, path).replaceAll("\\", "/")] = sha256(readFileSync(path));
  }
}
walk(directory);
if (!assets["index.html"]) throw new Error("Build the site before stamping a release.");
writeFileSync(join(directory, "release.json"), JSON.stringify({ commit, source_tree_sha256: source.digest("hex"), assets }, null, 2) + "\n");
console.log("Prepared static release for commit " + commit);

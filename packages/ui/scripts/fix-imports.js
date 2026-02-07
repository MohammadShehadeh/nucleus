import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UI_PACKAGE_PATH = path.resolve(__dirname, "../");
const SRC_DIR = path.join(UI_PACKAGE_PATH, "src");

const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

const packageJsonPath = path.join(UI_PACKAGE_PATH, "package.json");

if (!fs.existsSync(packageJsonPath)) {
  console.error("Cannot find package.json in ui package!");
  process.exit(1);
}

const packageName = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")).name;

function walkDir(dir, callback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (FILE_EXTENSIONS.includes(path.extname(entry.name))) {
      callback(fullPath);
    }
  });
}

function replaceImports(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Regex: match import/export statements starting with "src/"
  const updated = content.replace(
    /((?:import|export)[\s\S]*?from\s+['"])src\/(.*?)['"]/g,
    (_, prefix, importPath) => `${prefix}${packageName}/${importPath}"`
  );

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf-8");
    console.log(`Updated imports in: ${filePath}`);
  }
}

// 4️⃣ Run
walkDir(SRC_DIR, replaceImports);
console.log(`All imports updated to use "${packageName}"!`);

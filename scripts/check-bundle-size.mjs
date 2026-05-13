import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const BUNDLE_BUDGET_KB = 1800;
const chunksDir = join(process.cwd(), ".next", "static", "chunks");

if (!existsSync(chunksDir)) {
  console.error("Bundle budget check failed: .next/static/chunks not found. Run `npm run build` first.");
  process.exit(1);
}

function getDirectorySizeBytes(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += getDirectorySizeBytes(fullPath);
    } else {
      total += statSync(fullPath).size;
    }
  }
  return total;
}

const totalBytes = getDirectorySizeBytes(chunksDir);
const totalKB = totalBytes / 1024;
const budgetBytes = BUNDLE_BUDGET_KB * 1024;

console.log(`Chunk bundle size: ${totalKB.toFixed(1)} KB (budget: ${BUNDLE_BUDGET_KB} KB)`);

if (totalBytes > budgetBytes) {
  console.error(
    `Bundle budget exceeded by ${(totalKB - BUNDLE_BUDGET_KB).toFixed(1)} KB. ` +
      "Consider lazy-loading non-critical components or reducing client-side dependencies."
  );
  process.exit(1);
}

console.log("Bundle budget check passed.");

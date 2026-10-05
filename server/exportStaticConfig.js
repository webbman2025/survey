import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPublicConfig } from "./surveyConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "public", "config.bilingual.json");

const payload = { en: getPublicConfig("en"), "zh-Hant": getPublicConfig("zh-Hant") };
fs.writeFileSync(out, JSON.stringify(payload), "utf8");
console.log("Wrote", out);

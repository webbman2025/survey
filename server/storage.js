import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.VERCEL
  ? path.join("/tmp", "survey-submissions.json")
  : path.join(__dirname, "..", "data", "submissions.json");

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

export function saveSubmission(record) {
  ensureFile();
  const rows = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  rows.unshift(record);
  fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
  return record;
}

export function listSubmissions() {
  ensureFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

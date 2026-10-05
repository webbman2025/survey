import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { list, put } from "@vercel/blob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "data", "submissions.json");
const TMP_FILE = path.join("/tmp", "survey-submissions.json");
const BLOB_PREFIX = "leads/";

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function readJsonFile(file) {
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

function writeJsonFile(file, rows) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(rows, null, 2), "utf8");
}

function saveSubmissionFile(record, file = DATA_FILE) {
  const rows = readJsonFile(file);
  rows.unshift(record);
  writeJsonFile(file, rows);
  return record;
}

async function saveSubmissionBlob(record) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  await put(`${BLOB_PREFIX}${record.id}.json`, JSON.stringify(record), {
    access: "private",
    addRandomSuffix: false,
    token,
    contentType: "application/json",
  });
  return record;
}

async function listSubmissionsBlob() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const { blobs } = await list({ prefix: BLOB_PREFIX, token });
  const rows = await Promise.all(
    blobs.map(async (blob) => {
      const res = await fetch(blob.url, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to read lead blob: ${blob.pathname}`);
      return JSON.parse(await res.text());
    })
  );
  return rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function saveSubmission(record) {
  if (blobEnabled()) return saveSubmissionBlob(record);
  if (process.env.VERCEL) {
    console.warn("[storage] BLOB_READ_WRITE_TOKEN not set — leads stored in /tmp (not durable across instances)");
    return saveSubmissionFile(record, TMP_FILE);
  }
  return saveSubmissionFile(record, DATA_FILE);
}

export async function listSubmissions() {
  if (blobEnabled()) return listSubmissionsBlob();
  if (process.env.VERCEL) return readJsonFile(TMP_FILE);
  return readJsonFile(DATA_FILE);
}

export function storageMode() {
  if (blobEnabled()) return "vercel-blob";
  if (process.env.VERCEL) return "vercel-ephemeral";
  return "file";
}
